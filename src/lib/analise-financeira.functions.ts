import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const analisarMesFinanceiro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ mes: z.string().regex(/^\d{4}-\d{2}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: papeis } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!papeis?.some((p) => p.role === "master" || p.role === "financeiro"))
      throw new Error("Apenas administradores e financeiro podem gerar a análise.");

    const [ano, m] = data.mes.split("-").map(Number) as [number, number];
    const inicio = `${data.mes}-01`;
    const fim = new Date(Date.UTC(ano, m, 0)).toISOString().slice(0, 10);
    const ini3 = new Date(Date.UTC(ano, m - 4, 1)).toISOString().slice(0, 10);
    const [{ data: pgs, error: e1 }, { data: dps, error: e2 }] = await Promise.all([
      supabase.from("pagamentos").select("valor, data, forma, tipo, tatuador, comissao_percentual").gte("data", ini3).lte("data", fim),
      supabase.from("despesas").select("valor, data, categoria").gte("data", ini3).lte("data", fim),
    ]);
    if (e1 || e2) throw new Error("Não foi possível ler os dados financeiros.");

    const resumo = (mesRef: string) => {
      const p = (pgs ?? []).filter((x) => x.data.startsWith(mesRef));
      const d = (dps ?? []).filter((x) => x.data.startsWith(mesRef));
      const receita = p.reduce((s, x) => s + Number(x.valor), 0);
      const comissao = p.reduce((s, x) => s + (Number(x.valor) * Number(x.comissao_percentual)) / 100, 0);
      const despesas = d.reduce((s, x) => s + Number(x.valor), 0);
      const agrupa = <T,>(arr: T[], k: (t: T) => string, v: (t: T) => number) =>
        arr.reduce<Record<string, number>>((a, t) => ((a[k(t)] = Math.round(((a[k(t)] ?? 0) + v(t)) * 100) / 100), a), {});
      return {
        mes: mesRef,
        receita: +receita.toFixed(2),
        comissoes: +comissao.toFixed(2),
        despesas: +despesas.toFixed(2),
        lucro_liquido: +(receita - comissao - despesas).toFixed(2),
        recebimentos: p.length,
        receita_por_tatuador: agrupa(p, (x) => x.tatuador || "Sem tatuador", (x) => Number(x.valor)),
        receita_por_forma: agrupa(p, (x) => x.forma, (x) => Number(x.valor)),
        despesas_por_categoria: agrupa(d, (x) => x.categoria, (x) => Number(x.valor)),
      };
    };
    const anteriores = [3, 2, 1].map((n) => new Date(Date.UTC(ano, m - 1 - n, 1)).toISOString().slice(0, 7));
    const dados = { mes_analisado: resumo(data.mes), meses_anteriores: anteriores.map(resumo) };
    const atual = dados.mes_analisado;
    if (atual.recebimentos === 0 && atual.despesas === 0)
      return { texto: "Não há recebimentos nem despesas registrados neste mês para analisar.", resumo: atual };

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Análise com IA não configurada.");
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions:
          "Você é consultor financeiro de um estúdio de tatuagem no Brasil (Titans Tattoo Studio). Tatuadores recebem comissão (padrão 60%). Analise os dados em JSON e responda em português do Brasil, em texto simples com títulos curtos e listas com '-' (sem tabelas, sem markdown pesado). Estrutura: 1) Resumo do mês (receita, comissões, despesas, lucro líquido e margem); 2) Comparação com os meses anteriores; 3) Destaques e riscos (tatuadores, formas de pagamento, categorias de despesa); 4) 4 a 6 ações práticas e específicas para o próximo mês. Use apenas os números fornecidos, valores em R$. Seja direto, no máximo ~350 palavras.",
        messages: [{ role: "user", content: JSON.stringify(dados) }],
        maxRetries: 0,
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "medium",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const texto = await result.text;
      if (!texto.trim()) throw new Error("A IA não retornou uma análise. Tente novamente mais tarde.");
      return { texto, resumo: atual };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos ao workspace para continuar.");
      if (status === 429) throw new Error("Muitas solicitações no momento. Aguarde um pouco e tente de novo.");
      if (status === 403) throw new Error("O uso de IA está bloqueado para este workspace no momento.");
      throw e instanceof Error ? e : new Error("Falha ao gerar a análise.");
    }
  });
