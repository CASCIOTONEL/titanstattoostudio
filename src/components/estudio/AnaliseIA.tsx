import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analisarMesFinanceiro } from "@/lib/analise-financeira.functions";

export function AnaliseIA({ mesInicial }: { mesInicial: string }) {
  const analisar = useServerFn(analisarMesFinanceiro);
  const [mes, setMes] = useState(mesInicial);
  const [texto, setTexto] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function gerar() {
    setCarregando(true);
    setErro(null);
    setTexto(null);
    try {
      const r = await analisar({ data: { mes } });
      setTexto(r.texto);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar a análise.");
    }
    setCarregando(false);
  }

  return (
    <div className="mt-8 border border-border bg-card/30 p-6">
      <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Análise do mês com IA</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolha o mês e receba um diagnóstico de receitas, comissões, despesas e lucro, com sugestões práticas.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="border border-border bg-background px-4 py-3 text-sm" />
        <button
          type="button"
          onClick={gerar}
          disabled={carregando || !mes}
          className="border border-foreground/80 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {carregando ? "Analisando..." : "Gerar análise"}
        </button>
      </div>
      {carregando ? <p className="mt-4 text-sm text-muted-foreground">Isso pode levar alguns segundos...</p> : null}
      {erro ? <p role="alert" className="mt-4 text-sm text-destructive">{erro}</p> : null}
      {texto ? <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{texto.replace(/\*\*/g, "")}</div> : null}
    </div>
  );
}
