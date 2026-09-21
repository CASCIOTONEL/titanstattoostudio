import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { meusPapeis, type Papel } from "@/lib/equipe.functions";
import { artists } from "@/lib/studio";

export const Route = createFileRoute("/_authenticated/pagamentos")({
  head: () => ({
    meta: [
      { title: "Financeiro — Titans Tattoo Studio" },
      {
        name: "description",
        content:
          "Painel financeiro interno: recebimentos, formas de pagamento, produção por tatuador e comissões semanais.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Financeiro — Titans Tattoo Studio" },
      { property: "og:description", content: "Painel interno do Titans Tattoo Studio." },
    ],
  }),
  component: PagamentosPage,
});

type Pagamento = {
  id: string;
  lead_id: string | null;
  cliente_nome: string;
  valor: number;
  data: string;
  forma: string;
  tipo: string;
  tatuador: string | null;
  comissao_percentual: number;
  observacoes: string | null;
  created_at: string;
};

type ComissaoPaga = {
  id: string;
  tatuador: string;
  periodo_inicio: string;
  periodo_fim: string;
  pagar_em: string;
  valor: number;
  pago_em: string;
};

type LeadConcluido = {
  id: string;
  nome: string;
  servico: string;
  largura_cm: number;
  altura_cm: number;
  local_corpo: string;
  tatuador: string | null;
};

const FORMA_PADRAO = "Pix";
const FORMAS = [
  "Pix",
  "Cartão de crédito",
  "Cartão de débito",
  "Dinheiro",
  "Transferência",
  "Link de pagamento",
];
const TIPOS = [
  { valor: "sinal", rotulo: "Sinal" },
  { valor: "saldo", rotulo: "Saldo restante" },
  { valor: "total", rotulo: "Valor total" },
];
const COMISSAO_PADRAO = 60;
const TATUADORES = artists.map((a) => a.name);
const ABAS = [
  { id: "recebimentos", rotulo: "Recebimentos" },
  { id: "tatuadores", rotulo: "Por tatuador" },
  { id: "dias", rotulo: "Dia a dia" },
  { id: "comissoes", rotulo: "Comissões (terças)" },
] as const;
type Aba = (typeof ABAS)[number]["id"];

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataBR(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR");
}

function diaSemana(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" });
}

function somarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Semana de comissão: terça-feira até segunda-feira; o repasse acontece na terça seguinte. */
function inicioDaSemana(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  const diff = (d.getDay() - 2 + 7) % 7; // 2 = terça
  return somarDias(iso, -diff);
}

function PagamentosPage() {
  const navigate = useNavigate();
  const carregarPapeis = useServerFn(meusPapeis);
  const [papeis, setPapeis] = useState<Papel[] | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [comissoes, setComissoes] = useState<ComissaoPaga[]>([]);
  const [leads, setLeads] = useState<LeadConcluido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState<Aba>("recebimentos");
  const [mes, setMes] = useState<string>(() => hoje().slice(0, 7));

  const [leadId, setLeadId] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [forma, setForma] = useState(FORMA_PADRAO);
  const [tipo, setTipo] = useState("total");
  const [tatuador, setTatuador] = useState(TATUADORES[0] ?? "");
  const [comissaoPercentual, setComissaoPercentual] = useState(String(COMISSAO_PADRAO));
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const lista = await carregarPapeis();
        if (active) setPapeis(lista);
      } catch {
        if (active) setPapeis([]);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: pgs, error: erroPg }, { data: cms }, { data: lds }] = await Promise.all([
        supabase.from("pagamentos").select("*").order("data", { ascending: false }),
        supabase.from("comissoes_pagas").select("*").order("periodo_inicio", { ascending: false }),
        supabase
          .from("leads")
          .select("id, nome, servico, largura_cm, altura_cm, local_corpo, tatuador")
          .eq("status", "concluído")
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (erroPg) setError(erroPg.message);
      else setPagamentos((pgs ?? []) as Pagamento[]);
      setComissoes((cms ?? []) as ComissaoPaga[]);
      setLeads((lds ?? []) as LeadConcluido[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const doMes = useMemo(() => pagamentos.filter((p) => p.data.startsWith(mes)), [pagamentos, mes]);
  const totalMes = useMemo(() => doMes.reduce((s, p) => s + Number(p.valor), 0), [doMes]);
  const comissaoMes = useMemo(
    () => doMes.reduce((s, p) => s + (Number(p.valor) * Number(p.comissao_percentual)) / 100, 0),
    [doMes],
  );

  const porForma = useMemo(() => {
    const mapa: Record<string, { total: number; qtd: number }> = {};
    for (const p of doMes) {
      const atual = mapa[p.forma] ?? { total: 0, qtd: 0 };
      mapa[p.forma] = { total: atual.total + Number(p.valor), qtd: atual.qtd + 1 };
    }
    return Object.entries(mapa).sort((a, b) => b[1].total - a[1].total);
  }, [doMes]);

  const porTatuador = useMemo(() => {
    const mapa: Record<
      string,
      { total: number; comissao: number; qtd: number; atendimentos: Set<string> }
    > = {};
    for (const p of doMes) {
      const nome = p.tatuador || "Sem tatuador";
      const atual = mapa[nome] ?? { total: 0, comissao: 0, qtd: 0, atendimentos: new Set<string>() };
      atual.total += Number(p.valor);
      atual.comissao += (Number(p.valor) * Number(p.comissao_percentual)) / 100;
      atual.qtd += 1;
      atual.atendimentos.add(p.lead_id ?? p.cliente_nome.trim().toLowerCase());
      mapa[nome] = atual;
    }
    return Object.entries(mapa)
      .map(
        ([nome, d]) =>
          [
            nome,
            {
              total: d.total,
              comissao: d.comissao,
              qtd: d.qtd,
              atendimentos: d.atendimentos.size,
              ticket: d.atendimentos.size > 0 ? d.total / d.atendimentos.size : 0,
            },
          ] as const,
      )
      .sort((a, b) => b[1].total - a[1].total);
  }, [doMes]);

  /** Ticket médio do estúdio: total recebido no mês dividido pelos atendimentos distintos. */
  const ticketEstudio = useMemo(() => {
    const atendimentos = new Set(
      doMes.map((p) => p.lead_id ?? p.cliente_nome.trim().toLowerCase()),
    );
    return {
      atendimentos: atendimentos.size,
      valor: atendimentos.size > 0 ? totalMes / atendimentos.size : 0,
    };
  }, [doMes, totalMes]);

  const porDia = useMemo(() => {
    const mapa: Record<string, { total: number; comissao: number; porTatuador: Record<string, number> }> = {};
    for (const p of doMes) {
      const atual = mapa[p.data] ?? { total: 0, comissao: 0, porTatuador: {} };
      const nome = p.tatuador || "Sem tatuador";
      atual.total += Number(p.valor);
      atual.comissao += (Number(p.valor) * Number(p.comissao_percentual)) / 100;
      atual.porTatuador[nome] = (atual.porTatuador[nome] ?? 0) + Number(p.valor);
      mapa[p.data] = atual;
    }
    return Object.entries(mapa).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [doMes]);

  /** Fechamentos semanais (terça a segunda) por tatuador, com repasse na terça seguinte. */
  const fechamentos = useMemo(() => {
    const mapa: Record<
      string,
      { tatuador: string; inicio: string; fim: string; pagarEm: string; recebido: number; comissao: number }
    > = {};
    for (const p of pagamentos) {
      const nome = p.tatuador || "Sem tatuador";
      const inicio = inicioDaSemana(p.data);
      const chave = `${nome}|${inicio}`;
      const atual =
        mapa[chave] ??
        {
          tatuador: nome,
          inicio,
          fim: somarDias(inicio, 6),
          pagarEm: somarDias(inicio, 7),
          recebido: 0,
          comissao: 0,
        };
      atual.recebido += Number(p.valor);
      atual.comissao += (Number(p.valor) * Number(p.comissao_percentual)) / 100;
      mapa[chave] = atual;
    }
    return Object.values(mapa).sort((a, b) =>
      a.inicio === b.inicio ? a.tatuador.localeCompare(b.tatuador) : a.inicio < b.inicio ? 1 : -1,
    );
  }, [pagamentos]);

  function comissaoPagaDe(tatuadorNome: string, inicio: string) {
    return comissoes.find((c) => c.tatuador === tatuadorNome && c.periodo_inicio === inicio) ?? null;
  }

  function selecionarLead(id: string) {
    setLeadId(id);
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      setClienteNome(lead.nome);
      if (lead.tatuador && TATUADORES.includes(lead.tatuador)) setTatuador(lead.tatuador);
    }
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const numero = Number(valor.replace(/\./g, "").replace(",", "."));
    const percentual = Number(comissaoPercentual.replace(",", "."));
    if (!clienteNome.trim()) return setError("Informe o nome do cliente.");
    if (!Number.isFinite(numero) || numero <= 0) return setError("Informe um valor maior que zero.");
    if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100)
      return setError("O percentual de comissão deve ficar entre 0 e 100.");
    setSalvando(true);
    const { data: user } = await supabase.auth.getUser();
    const { data: inserido, error: erro } = await supabase
      .from("pagamentos")
      .insert({
        lead_id: leadId || null,
        cliente_nome: clienteNome.trim(),
        valor: numero,
        data,
        forma,
        tipo,
        tatuador: tatuador || null,
        comissao_percentual: percentual,
        observacoes: observacoes.trim() || null,
        registrado_por: user.user?.id ?? null,
      })
      .select()
      .single();
    setSalvando(false);
    if (erro) return setError(erro.message);
    setPagamentos((prev) => [inserido as Pagamento, ...prev]);
    setAviso("Recebimento registrado.");
    setLeadId("");
    setClienteNome("");
    setValor("");
    setData(hoje());
    setForma(FORMA_PADRAO);
    setTipo("total");
    setComissaoPercentual(String(COMISSAO_PADRAO));
    setObservacoes("");
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este recebimento?")) return;
    const { error: erro } = await supabase.from("pagamentos").delete().eq("id", id);
    if (erro) return setError(erro.message);
    setPagamentos((prev) => prev.filter((p) => p.id !== id));
  }

  async function marcarComissaoPaga(f: {
    tatuador: string;
    inicio: string;
    fim: string;
    pagarEm: string;
    comissao: number;
  }) {
    setError(null);
    const { data: user } = await supabase.auth.getUser();
    const { data: inserido, error: erro } = await supabase
      .from("comissoes_pagas")
      .insert({
        tatuador: f.tatuador,
        periodo_inicio: f.inicio,
        periodo_fim: f.fim,
        pagar_em: f.pagarEm,
        valor: Number(f.comissao.toFixed(2)),
        registrado_por: user.user?.id ?? null,
      })
      .select()
      .single();
    if (erro) return setError(erro.message);
    setComissoes((prev) => [inserido as ComissaoPaga, ...prev]);
  }

  async function desfazerComissao(id: string) {
    const { error: erro } = await supabase.from("comissoes_pagas").delete().eq("id", id);
    if (erro) return setError(erro.message);
    setComissoes((prev) => prev.filter((c) => c.id !== id));
  }

  async function sair() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  const podeVer =
    papeis === null ||
    papeis.some((p) => p === "master" || p === "financeiro" || p === "recepcao");
  const ehMaster = papeis?.includes("master") ?? false;

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <SectionTitle
          eyebrow="Área do estúdio"
          title="Financeiro"
          description="Recebimentos com valor, data e forma, produção por tatuador, movimento diário e comissão de 60% repassada às terças-feiras."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/orcamentos"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Orçamentos
          </Link>
          <Link
            to="/clientes"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Clientes
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

      {!podeVer ? (
        <p role="alert" className="mt-10 text-sm text-destructive">
          Seu acesso não tem permissão para ver o financeiro.
        </p>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-border bg-card/30 p-5">
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Mês
              </label>
              <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm"
              />
            </div>
            <Indicador rotulo="Recebido no mês" valor={moeda(totalMes)} nota={`${doMes.length} recebimento(s)`} />
            <Indicador rotulo="Comissão dos tatuadores" valor={moeda(comissaoMes)} nota="60% do recebido" />
            <Indicador
              rotulo="Fica no estúdio"
              valor={moeda(totalMes - comissaoMes)}
              nota="Recebido menos comissões"
            />
            <Indicador
              rotulo="Ticket médio do estúdio"
              valor={moeda(ticketEstudio.valor)}
              nota={`${ticketEstudio.atendimentos} atendimento(s) no mês`}
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-b border-border" role="tablist">
            {ABAS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={aba === a.id}
                onClick={() => setAba(a.id)}
                className={
                  "-mb-px border-b-2 px-5 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors " +
                  (aba === a.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                {a.rotulo}
              </button>
            ))}
          </div>

          {error ? (
            <p role="alert" className="mt-6 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {loading ? <p className="mt-8 text-sm text-muted-foreground">Carregando financeiro...</p> : null}

          {aba === "recebimentos" ? (
            <>
              <form onSubmit={registrar} className="mt-8 border border-border bg-card/30 p-6">
                <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Novo recebimento
                </h3>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Campo label="Orçamento concluído">
                    <select
                      value={leadId}
                      onChange={(e) => selecionarLead(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                    >
                      <option value="">Sem vínculo com orçamento</option>
                      {leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nome} — {l.servico} ({l.largura_cm}x{l.altura_cm} cm, {l.local_corpo})
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Cliente">
                    <input
                      value={clienteNome}
                      onChange={(e) => setClienteNome(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                      placeholder="Nome do cliente"
                    />
                  </Campo>
                  <Campo label="Tatuador">
                    <select
                      value={tatuador}
                      onChange={(e) => setTatuador(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                    >
                      {TATUADORES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      <option value="">Sem tatuador</option>
                    </select>
                  </Campo>
                  <Campo label="Valor (R$)">
                    <input
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      inputMode="decimal"
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                      placeholder="350,00"
                    />
                  </Campo>
                  <Campo label="Data do recebimento">
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                    />
                  </Campo>
                  <Campo label="Forma de pagamento">
                    <select
                      value={forma}
                      onChange={(e) => setForma(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                    >
                      {FORMAS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Tipo">
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                    >
                      {TIPOS.map((t) => (
                        <option key={t.valor} value={t.valor}>
                          {t.rotulo}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Comissão do tatuador (%)">
                    <input
                      value={comissaoPercentual}
                      onChange={(e) => setComissaoPercentual(e.target.value)}
                      inputMode="decimal"
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                    />
                  </Campo>
                  <Campo label="Observações">
                    <input
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="w-full border border-border bg-background px-4 py-3 text-sm"
                      placeholder="Opcional"
                    />
                  </Campo>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={salvando}
                    className="border border-foreground/80 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
                  >
                    {salvando ? "Registrando..." : "Registrar recebimento"}
                  </button>
                  {aviso ? <p className="text-sm text-muted-foreground">{aviso}</p> : null}
                </div>
              </form>

              {porForma.length ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {porForma.map(([f, dados]) => (
                    <Indicador
                      key={f}
                      rotulo={f}
                      valor={moeda(dados.total)}
                      nota={`${dados.qtd} recebimento(s)`}
                    />
                  ))}
                </div>
              ) : null}

              {!loading && doMes.length === 0 ? (
                <p className="mt-8 text-sm text-muted-foreground">
                  Nenhum recebimento registrado neste mês.
                </p>
              ) : (
                <div className="mt-8 space-y-4">
                  {doMes.map((p) => (
                    <article
                      key={p.id}
                      className="flex flex-wrap items-start justify-between gap-4 border border-border bg-card/30 p-5"
                    >
                      <div>
                        <h4 className="text-base text-foreground">{p.cliente_nome}</h4>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {dataBR(p.data)} · {p.forma} ·{" "}
                          {TIPOS.find((t) => t.valor === p.tipo)?.rotulo ?? p.tipo} ·{" "}
                          {p.tatuador || "sem tatuador"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Comissão {Number(p.comissao_percentual)}% ={" "}
                          {moeda((Number(p.valor) * Number(p.comissao_percentual)) / 100)}
                        </p>
                        {p.observacoes ? (
                          <p className="mt-2 text-sm text-muted-foreground">{p.observacoes}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg text-foreground">{moeda(Number(p.valor))}</span>
                        {ehMaster ? (
                          <button
                            type="button"
                            onClick={() => excluir(p.id)}
                            className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-destructive"
                          >
                            Excluir
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {aba === "tatuadores" ? (
            porTatuador.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">
                Nenhum recebimento neste mês para separar por tatuador.
              </p>
            ) : (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {porTatuador.map(([nome, dados]) => (
                  <article key={nome} className="border border-border bg-card/30 p-6">
                    <h4 className="text-lg text-foreground">{nome}</h4>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {dados.qtd} recebimento(s) · {dados.atendimentos} atendimento(s) no mês
                    </p>
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Linha rotulo="Recebido" valor={moeda(dados.total)} />
                      <Linha rotulo="Ticket médio" valor={moeda(dados.ticket)} />
                      <Linha rotulo="Comissão (60%)" valor={moeda(dados.comissao)} />
                      <Linha rotulo="Estúdio" valor={moeda(dados.total - dados.comissao)} />
                    </dl>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Ticket médio do estúdio no mês: {moeda(ticketEstudio.valor)}
                    </p>
                  </article>
                ))}
              </div>
            )
          ) : null}

          {aba === "dias" ? (
            porDia.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">
                Nenhum recebimento neste mês para mostrar dia a dia.
              </p>
            ) : (
              <div className="mt-8 space-y-4">
                {porDia.map(([dia, dados]) => (
                  <article
                    key={dia}
                    className="flex flex-wrap items-start justify-between gap-4 border border-border bg-card/30 p-5"
                  >
                    <div>
                      <h4 className="text-base text-foreground">
                        {dataBR(dia)}{" "}
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {diaSemana(dia)}
                        </span>
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {Object.entries(dados.porTatuador)
                          .map(([nome, v]) => `${nome}: ${moeda(v)}`)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-foreground">{moeda(dados.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        comissões {moeda(dados.comissao)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : null}

          {aba === "comissoes" ? (
            <>
              <p className="mt-8 text-sm text-muted-foreground">
                Cada semana fecha na segunda-feira (período de terça a segunda) e o repasse de 60% é
                feito na terça-feira seguinte.
              </p>
              {fechamentos.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  Nenhum fechamento de comissão ainda.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {fechamentos.map((f) => {
                    const paga = comissaoPagaDe(f.tatuador, f.inicio);
                    return (
                      <article
                        key={`${f.tatuador}-${f.inicio}`}
                        className="flex flex-wrap items-start justify-between gap-4 border border-border bg-card/30 p-5"
                      >
                        <div>
                          <h4 className="text-base text-foreground">{f.tatuador}</h4>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {dataBR(f.inicio)} a {dataBR(f.fim)} · pagar em {dataBR(f.pagarEm)}{" "}
                            (terça)
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Recebido {moeda(f.recebido)} · estúdio {moeda(f.recebido - f.comissao)}
                          </p>
                          {paga ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Pago em {new Date(paga.pago_em).toLocaleDateString("pt-BR")}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg text-foreground">{moeda(f.comissao)}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {paga ? "pago" : "a pagar"}
                            </p>
                          </div>
                          {paga ? (
                            <button
                              type="button"
                              onClick={() => desfazerComissao(paga.id)}
                              className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                            >
                              Desfazer
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => marcarComissaoPaga(f)}
                              className="border border-foreground/80 px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background"
                            >
                              Marcar como paga
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </Section>
  );
}

function Indicador({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  return (
    <div className="border border-border bg-card/30 p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{rotulo}</p>
      <p className="mt-2 text-2xl text-foreground">{valor}</p>
      {nota ? <p className="mt-1 text-xs text-muted-foreground">{nota}</p> : null}
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{rotulo}</dt>
      <dd className="mt-1 text-foreground">{valor}</dd>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
