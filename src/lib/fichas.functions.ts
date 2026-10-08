import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.string().regex(/^[a-f0-9]{48}$/);

export const PERGUNTAS_SAUDE = [
  { chave: "alergias", rotulo: "Tem alergia a algum medicamento, látex, pomada ou metal?" },
  { chave: "diabetes", rotulo: "Tem diabetes?" },
  { chave: "hipertensao", rotulo: "Tem pressão alta ou problema cardíaco?" },
  { chave: "queloide", rotulo: "Tem tendência a queloide ou cicatrização difícil?" },
  { chave: "hemofilia", rotulo: "Tem hemofilia ou problema de coagulação?" },
  { chave: "gestante", rotulo: "Está gestante ou amamentando?" },
  { chave: "medicamentos", rotulo: "Usa algum medicamento contínuo (ex.: anticoagulante)?" },
  { chave: "pele", rotulo: "Tem alguma doença de pele na região (psoríase, dermatite etc.)?" },
  { chave: "alcool", rotulo: "Consumiu álcool ou drogas nas últimas 24 horas?" },
] as const;

export const buscarFicha = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ token: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ficha } = await supabaseAdmin
      .from("fichas_anamnese")
      .select("id, expira_em, assinada_em, cliente_id")
      .eq("token", data.token)
      .maybeSingle();
    if (!ficha) return { estado: "invalida" as const };
    if (ficha.assinada_em) return { estado: "assinada" as const };
    if (new Date(ficha.expira_em) < new Date()) return { estado: "expirada" as const };
    const { data: cliente } = await supabaseAdmin
      .from("clientes")
      .select("nome")
      .eq("id", ficha.cliente_id)
      .maybeSingle();
    return { estado: "aberta" as const, primeiroNome: (cliente?.nome ?? "").split(" ")[0] ?? "" };
  });

const respostaSchema = z.object({ resposta: z.enum(["sim", "nao"]), detalhe: z.string().max(300) });

export const assinarFicha = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        token: tokenSchema,
        respostas: z.record(z.string().max(30), respostaSchema),
        observacoes: z.string().max(1000),
        aceiteProcedimento: z.literal(true),
        aceitePolitica: z.literal(true),
        aceiteLgpd: z.literal(true),
        aceiteImagem: z.boolean(),
        assinatura: z
          .string()
          .startsWith("data:image/png;base64,")
          .max(1_500_000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const chaves = new Set<string>(PERGUNTAS_SAUDE.map((p) => p.chave));
    for (const k of Object.keys(data.respostas)) if (!chaves.has(k)) throw new Error("Resposta inválida.");
    if (Object.keys(data.respostas).length !== chaves.size) throw new Error("Responda todas as perguntas.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ficha } = await supabaseAdmin
      .from("fichas_anamnese")
      .select("id, expira_em, assinada_em")
      .eq("token", data.token)
      .maybeSingle();
    if (!ficha || ficha.assinada_em || new Date(ficha.expira_em) < new Date())
      throw new Error("Este link não está mais disponível. Peça um novo ao estúdio.");

    const bytes = Buffer.from(data.assinatura.split(",")[1] ?? "", "base64");
    const path = `${ficha.id}.png`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("assinaturas")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (upErr) throw new Error("Não foi possível salvar a assinatura.");

    const { error } = await supabaseAdmin
      .from("fichas_anamnese")
      .update({
        respostas: { ...data.respostas, observacoes: data.observacoes },
        aceite_procedimento: true,
        aceite_politica: true,
        aceite_lgpd: true,
        aceite_imagem: data.aceiteImagem,
        assinatura_path: path,
        assinada_em: new Date().toISOString(),
      })
      .eq("id", ficha.id)
      .is("assinada_em", null);
    if (error) throw new Error("Não foi possível salvar a ficha.");
    return { ok: true };
  });
