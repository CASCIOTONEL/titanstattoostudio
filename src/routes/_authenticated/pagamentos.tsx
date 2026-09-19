import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { meusPapeis, type Papel } from "@/lib/equipe.functions";

export const Route = createFileRoute("/_authenticated/pagamentos")({
  head: () => ({
    meta: [
      { title: "Recebimentos — Titans Tattoo Studio" },
      { name: "description", content: "Painel interno de recebimentos: valor, data e forma de pagamento." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Recebimentos — Titans Tattoo Studio" },
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
  observacoes: string | null;
  created_at: string;
};

type LeadConcluido = {
  id: string;
  nome: string;
  servico: string;
  largura_cm: number;
  altura_cm: number;
  local_corpo: string;
};

const FORMAS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Transferência", "Link de pagamento"];
const TIPOS = [
  { valor: "sinal", rotulo: "Sinal" },
  { valor: "saldo", rotulo: "Saldo restante" },
  { valor: "total", rotulo: "Valor total" },
];

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function PagamentosPage() {
  const navigate = useNavigate();
  const carregarPapeis = useServerFn(meusPapeis);
  const [papeis, setPapeis] = useState<Papel[] | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [leads, setLeads] = useState<LeadConcluido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mes, setMes] = useState<string>(() => hoje().slice(0, 7));

  const [leadId, setLeadId] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [forma, setForma] = useState(FORMAS[0]);
  const [tipo, setTipo] = useState("total");
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
      const [{ data: pgs, error: erroPg }, { data: lds }] = await Promise.all([
        supabase.from("pagamentos").select("*").order("data", { ascending: false }),
        supabase
          .from("leads")
          .select("id, nome, servico, largura_cm, altura_cm, local_corpo")
          .eq("status", "concluído")
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (erroPg) setError(erroPg.message);
      else setPagamentos((pgs ?? []) as Pagamento[]);
      setLeads((lds ?? []) as LeadConcluido[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const pagosPorLead = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const p of pagamentos) {
      if (p.lead_id) mapa[p.lead_id] = (mapa[p.lead_id] ?? 0) + Number(p.valor);
    }
    return mapa;
  }, [pagamentos]);

  const doMes = useMemo(
    () => pagamentos.filter((p) => p.data.startsWith(mes)),
    [pagamentos, mes],
  );
  const totalMes = useMemo(() => doMes.reduce((s, p) => s + Number(p.valor), 0), [doMes]);

  function selecionarLead(id: string) {
    setLeadId(id);
    const lead = leads.find((l) => l.id === id);
    if (lead) setClienteNome(lead.nome);
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const numero = Number(valor.replace(/\./g, "").replace(",", "."));
    if (!clienteNome.trim()) return setError("Informe o nome do cliente.");
    if (!Number.isFinite(numero) || numero <= 0) return setError("Informe um valor maior que zero.");
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
    setForma(FORMAS[0]);
    setTipo("total");
    setObservacoes("");
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este recebimento?")) return;
    const { error: erro } = await supabase.from("pagamentos").delete().eq("id", id);
    if (erro) return setError(erro.message);
    setPagamentos((prev) => prev.filter((p) => p.id !== id));
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
          title="Recebimentos"
          description="Registre cada pagamento com valor, data e forma, ligado aos orçamentos concluídos."
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
          Seu acesso não tem permissão para ver os recebimentos.
        </p>
      ) : (
        <>
          <form onSubmit={registrar} className="mt-10 border border-border bg-card/30 p-6">
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
              <div className="sm:col-span-2 lg:col-span-3">
                <Campo label="Observações">
                  <input
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full border border-border bg-background px-4 py-3 text-sm"
                    placeholder="Opcional"
                  />
                </Campo>
              </div>
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
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          </form>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border border-border bg-card/30 p-6">
            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Mês
              </label>
              <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="mt-2 block border border-border bg-background px-4 py-3 text-sm"
              />
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Recebido no mês
              </p>
              <p className="mt-2 text-2xl text-foreground">{moeda(totalMes)}</p>
              <p className="text-xs text-muted-foreground">{doMes.length} recebimento(s)</p>
            </div>
          </div>

          {loading ? (
            <p className="mt-10 text-sm text-muted-foreground">Carregando recebimentos...</p>
          ) : doMes.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">
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
                      {new Date(`${p.data}T12:00:00`).toLocaleDateString("pt-BR")} · {p.forma} ·{" "}
                      {TIPOS.find((t) => t.valor === p.tipo)?.rotulo ?? p.tipo}
                    </p>
                    {p.lead_id ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Orçamento concluído · total recebido {moeda(pagosPorLead[p.lead_id] ?? 0)}
                      </p>
                    ) : null}
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
      )}
    </Section>
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
