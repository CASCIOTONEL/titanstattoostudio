import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { meuAcesso, type MeuAcesso } from "@/lib/equipe.functions";

export const Route = createFileRoute("/_authenticated/meu-painel")({
  head: () => ({
    meta: [
      { title: "Meu painel — Titans Tattoo Studio" },
      { name: "description", content: "Área do tatuador com orçamentos, faturamento e comissão da semana." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Meu painel — Titans Tattoo Studio" },
      { property: "og:description", content: "Área do tatuador do Titans Tattoo Studio." },
    ],
  }),
  component: MeuPainelPage,
});

type Lead = {
  id: string;
  nome: string;
  whatsapp: string;
  servico: string;
  ideia: string;
  largura_cm: number;
  altura_cm: number;
  local_corpo: string;
  cor: string | null;
  tipo: string | null;
  disponibilidade: string | null;
  status: string;
  created_at: string;
};

type Pagamento = {
  id: string;
  cliente_nome: string;
  valor: number;
  data: string;
  forma: string;
  tipo: string;
  comissao_percentual: number;
};

const statusOptions = ["aberto", "em andamento", "concluído"];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Segunda-feira (00h) da semana de uma data. */
function inicioSemana(d: Date) {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dia = (base.getDay() + 6) % 7; // 0 = segunda
  base.setDate(base.getDate() - dia);
  return base;
}

function dataLocal(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a ?? 1970, (m ?? 1) - 1, d ?? 1);
}

const fmtDia = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function MeuPainelPage() {
  const navigate = useNavigate();
  const carregarAcesso = useServerFn(meuAcesso);
  const [acesso, setAcesso] = useState<MeuAcesso | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<"orcamentos" | "financeiro">("orcamentos");
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const a = await carregarAcesso();
        if (!ativo) return;
        setAcesso(a);
        const [{ data: ls, error: e1 }, { data: ps, error: e2 }] = await Promise.all([
          supabase.from("leads").select("*").order("created_at", { ascending: false }),
          supabase.from("pagamentos").select("*").order("data", { ascending: false }),
        ]);
        if (!ativo) return;
        if (e1) setErro(e1.message);
        else setLeads((ls ?? []) as unknown as Lead[]);
        if (e2) setErro(e2.message);
        else setPagamentos((ps ?? []) as unknown as Pagamento[]);
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Não foi possível carregar seus dados.");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const semana = useMemo(() => {
    const inicio = inicioSemana(new Date());
    inicio.setDate(inicio.getDate() + semanaOffset * 7);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);
    return { inicio, fim };
  }, [semanaOffset]);

  const daSemana = useMemo(
    () =>
      pagamentos.filter((p) => {
        const d = dataLocal(p.data);
        return d >= semana.inicio && d <= semana.fim;
      }),
    [pagamentos, semana],
  );

  const totalSemana = daSemana.reduce((s, p) => s + Number(p.valor), 0);
  const comissaoSemana = daSemana.reduce(
    (s, p) => s + (Number(p.valor) * Number(p.comissao_percentual ?? 60)) / 100,
    0,
  );

  const porDia = useMemo(() => {
    const mapa = new Map<string, { valor: number; comissao: number }>();
    for (const p of daSemana) {
      const atual = mapa.get(p.data) ?? { valor: 0, comissao: 0 };
      atual.valor += Number(p.valor);
      atual.comissao += (Number(p.valor) * Number(p.comissao_percentual ?? 60)) / 100;
      mapa.set(p.data, atual);
    }
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [daSemana]);

  const visiveis = useMemo(
    () => (filtro === "todos" ? leads : leads.filter((l) => l.status === filtro)),
    [leads, filtro],
  );

  async function mudarStatus(id: string, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) setErro(error.message);
  }

  async function sair() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  const semVinculo = acesso !== null && !acesso.tatuador && !acesso.papeis.includes("master");

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <SectionTitle
          eyebrow="Área do tatuador"
          title={acesso?.tatuador ? `Painel de ${acesso.tatuador}` : "Meu painel"}
          description="Seus orçamentos, seu faturamento e a comissão da semana (segunda a segunda)."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/agenda"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Minha agenda
          </Link>
          <button
            type="button"
            onClick={sair}
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>

      {semVinculo ? (
        <p role="alert" className="mt-10 text-sm text-destructive">
          Seu acesso ainda não está ligado a um tatuador. Peça ao administrador para escolher o seu
          nome em Equipe e permissões.
        </p>
      ) : null}

      {erro ? <p role="alert" className="mt-8 text-sm text-destructive">{erro}</p> : null}

      <div className="mt-8 flex flex-wrap gap-2" role="tablist">
        {(["orcamentos", "financeiro"] as const).map((a) => (
          <button
            key={a}
            type="button"
            role="tab"
            aria-selected={aba === a}
            onClick={() => setAba(a)}
            className={
              "border-b-2 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors " +
              (aba === a
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground")
            }
          >
            {a === "orcamentos" ? "Meus orçamentos" : "Faturamento e comissão"}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando...</p>
      ) : aba === "orcamentos" ? (
        <>
          <div className="mt-8 flex flex-wrap gap-2">
            {["todos", ...statusOptions].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFiltro(s)}
                className={
                  "border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors " +
                  (filtro === s
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground")
                }
              >
                {s}
              </button>
            ))}
          </div>

          {visiveis.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">Nenhum orçamento nesta situação.</p>
          ) : (
            <div className="mt-8 space-y-6">
              {visiveis.map((lead) => (
                <article key={lead.id} className="border border-border bg-card/30 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg text-foreground">{lead.nome}</h3>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(lead.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Situação do orçamento">
                      {statusOptions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => mudarStatus(lead.id, s)}
                          aria-pressed={lead.status === s}
                          className={
                            "border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors " +
                            (lead.status === s
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-muted-foreground hover:text-foreground")
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <Info label="WhatsApp" value={lead.whatsapp} />
                    <Info label="Serviço" value={lead.servico} />
                    <Info label="Dimensão" value={`${lead.largura_cm} cm x ${lead.altura_cm} cm`} />
                    <Info label="Local do corpo" value={lead.local_corpo} />
                    <Info label="Cor" value={lead.cor || "-"} />
                    <Info label="Disponibilidade" value={lead.disponibilidade || "-"} />
                  </dl>

                  <p className="mt-6 whitespace-pre-line border-t border-border pt-5 text-sm text-muted-foreground">
                    {lead.ideia}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setSemanaOffset((v) => v - 1)}
              className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Semana anterior
            </button>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {fmtDia(semana.inicio)} a {fmtDia(semana.fim)}
            </span>
            <button
              type="button"
              disabled={semanaOffset >= 0}
              onClick={() => setSemanaOffset((v) => Math.min(0, v + 1))}
              className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              Próxima semana
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card titulo="Faturamento da semana" valor={brl(totalSemana)} />
            <Card titulo="Minha comissão" valor={brl(comissaoSemana)} />
            <Card titulo="Fica no estúdio" valor={brl(totalSemana - comissaoSemana)} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            A comissão é fechada de segunda a segunda e paga na terça seguinte.
          </p>

          <h3 className="mt-10 text-lg text-foreground">Dia a dia</h3>
          {porDia.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum recebimento nesta semana.</p>
          ) : (
            <div className="mt-4 divide-y divide-border border border-border">
              {porDia.map(([dia, v]) => (
                <div key={dia} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                  <span className="text-foreground">{dataLocal(dia).toLocaleDateString("pt-BR")}</span>
                  <span className="text-muted-foreground">
                    Recebido {brl(v.valor)} · Comissão {brl(v.comissao)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h3 className="mt-10 text-lg text-foreground">Recebimentos da semana</h3>
          {daSemana.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nada registrado ainda.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {daSemana.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card/30 px-5 py-4 text-sm">
                  <span className="text-foreground">{p.cliente_nome}</span>
                  <span className="text-muted-foreground">
                    {dataLocal(p.data).toLocaleDateString("pt-BR")} · {p.forma} · {p.tipo}
                  </span>
                  <span className="text-foreground">
                    {brl(Number(p.valor))} · comissão {brl((Number(p.valor) * Number(p.comissao_percentual ?? 60)) / 100)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Section>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="border border-border bg-card/30 p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{titulo}</p>
      <p className="mt-2 text-2xl text-foreground">{valor}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}
