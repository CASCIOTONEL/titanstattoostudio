import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { meusPapeis, type Papel } from "@/lib/equipe.functions";
import { whatsappLink } from "@/lib/studio";

export const Route = createFileRoute("/_authenticated/orcamentos")({
  head: () => ({
    meta: [
      { title: "Orçamentos recebidos — Titans Tattoo Studio" },
      { name: "description", content: "Painel interno com os pedidos de orçamento recebidos pelo site." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Orçamentos recebidos — Titans Tattoo Studio" },
      { property: "og:description", content: "Painel interno do Titans Tattoo Studio." },
    ],
  }),
  component: OrcamentosPage,
});

type Lead = {
  id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  endereco: string | null;
  servico: string;
  ideia: string;
  largura_cm: number;
  altura_cm: number;
  local_corpo: string;
  cor: string | null;
  tipo: string | null;
  tatuador: string | null;
  disponibilidade: string | null;
  referencias: string[];
  status: string;
  created_at: string;
};

const ETAPAS = [
  { key: "aberto", label: "Novo" },
  { key: "em andamento", label: "Em contato" },
  { key: "agendado", label: "Agendado" },
  { key: "concluído", label: "Concluído" },
  { key: "não fechou", label: "Não fechou" },
] as const;

const statusOptions: string[] = ETAPAS.map((e) => e.key);

const TATUADORES = ["Cascio", "Ricardo", "Braian"];

const coresTatuador: Record<string, string> = {
  Cascio: "var(--color-artist-cascio)",
  Ricardo: "var(--color-artist-ricardo)",
  Braian: "var(--color-artist-braian)",
};

function corDoTatuador(nome: string | null) {
  if (!nome) return "var(--color-border)";
  return coresTatuador[nome] ?? "var(--color-border)";
}

function etapaDoLead(status: string) {
  return statusOptions.includes(status) ? status : "aberto";
}

function onlyDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function OrcamentosPage() {
  const navigate = useNavigate();
  const carregarPapeis = useServerFn(meusPapeis);
  const [papeis, setPapeis] = useState<Papel[] | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");
  const [vista, setVista] = useState<"kanban" | "lista">("kanban");
  const [filtroTatuador, setFiltroTatuador] = useState<string>("todos");
  const [signed, setSigned] = useState<Record<string, string>>({});

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
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setLeads((data ?? []) as Lead[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const novo = payload.new as Lead;
          setLeads((prev) => (prev.some((l) => l.id === novo.id) ? prev : [novo, ...prev]));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leads" },
        (payload) => {
          const atualizado = payload.new as Lead;
          setLeads((prev) => prev.map((l) => (l.id === atualizado.id ? atualizado : l)));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const paths = leads.flatMap((l) => l.referencias ?? []).filter((p) => !(p in signed));
    if (paths.length === 0) return;
    let active = true;
    (async () => {
      const { data } = await supabase.storage.from("referencias").createSignedUrls(paths, 3600);
      if (!active || !data) return;
      setSigned((prev) => {
        const next = { ...prev };
        for (const item of data) {
          if (item.path && item.signedUrl) next[item.path] = item.signedUrl;
        }
        return next;
      });
    })();
    return () => {
      active = false;
    };
  }, [leads, signed]);

  const porTatuador = useMemo(
    () =>
      filtroTatuador === "todos"
        ? leads
        : leads.filter((l) => (l.tatuador ?? "") === filtroTatuador),
    [leads, filtroTatuador],
  );

  const visiveis = useMemo(
    () => (filtro === "todos" ? porTatuador : porTatuador.filter((l) => etapaDoLead(l.status) === filtro)),
    [porTatuador, filtro],
  );

  const colunas = useMemo(
    () =>
      ETAPAS.map((etapa) => ({
        ...etapa,
        itens: porTatuador.filter((l) => etapaDoLead(l.status) === etapa.key),
      })),
    [porTatuador],
  );

  async function mudarStatus(id: string, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) setError(error.message);
  }

  async function excluirLead(id: string) {
    if (!window.confirm("Excluir este orçamento definitivamente?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  async function sair() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  const podeVerOrcamentos =
    papeis === null || papeis.some((p) => p === "master" || p === "recepcao");

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <SectionTitle
          eyebrow="Área do estúdio"
          title="Orçamentos recebidos"
          description="Cada pedido enviado pelo site com nome, WhatsApp, endereço, dimensão e local do corpo."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/agenda"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Agenda
          </Link>
          <Link
            to="/pagamentos"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Financeiro
          </Link>
          <Link
            to="/contatos"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Contatos
          </Link>
          <Link
            to="/clientes"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Clientes
          </Link>
          {papeis?.includes("tatuador") ? (
            <Link
              to="/meu-painel"
              className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Meu painel
            </Link>
          ) : null}

          {papeis?.includes("master") ? (
            <Link
              to="/equipe"
              className="border border-foreground/80 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
            >
              Equipe e permissões
            </Link>
          ) : null}
          <button
            type="button"
            onClick={sair}
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>

      {!podeVerOrcamentos ? (
        <p role="alert" className="mt-10 text-sm text-destructive">
          Seu acesso não tem permissão para ver os orçamentos. Esta área é da recepção e do
          administrador do estúdio.
        </p>
      ) : null}

      {podeVerOrcamentos ? (
      <>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <div className="flex gap-2" role="group" aria-label="Modo de visualização">
          {(["kanban", "lista"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              aria-pressed={vista === v}
              className={
                "border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors " +
                (vista === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {v === "kanban" ? "Quadro" : "Lista"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tatuador">
          {["todos", ...TATUADORES].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFiltroTatuador(t)}
              aria-pressed={filtroTatuador === t}
              className={
                "flex items-center gap-2 border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors " +
                (filtroTatuador === t
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {t !== "todos" ? (
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: corDoTatuador(t) }}
                />
              ) : null}
              {t}
            </button>
          ))}
        </div>
      </div>

      {vista === "lista" ? (
        <div className="mt-6 flex flex-wrap gap-2">
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
              {ETAPAS.find((e) => e.key === s)?.label ?? s}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando orçamentos...</p>
      ) : error ? (
        <p role="alert" className="mt-10 text-sm text-destructive">{error}</p>
      ) : vista === "kanban" ? (
        <div className="mt-10 overflow-x-auto pb-4">
          <div className="flex min-w-[1100px] gap-4">
            {colunas.map((coluna) => (
              <section key={coluna.key} className="flex w-72 shrink-0 flex-col">
                <header className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-foreground">
                    {coluna.label}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">{coluna.itens.length}</span>
                </header>
                <div className="mt-4 space-y-3">
                  {coluna.itens.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum pedido aqui.</p>
                  ) : null}
                  {coluna.itens.map((lead) => {
                    const indice = ETAPAS.findIndex((e) => e.key === coluna.key);
                    const capa = (lead.referencias ?? []).find((p) => signed[p]);
                    return (
                      <article
                        key={lead.id}
                        className="border border-border bg-card/40 p-4"
                        style={{ borderLeft: `3px solid ${corDoTatuador(lead.tatuador)}` }}
                      >
                        <div className="flex items-start gap-3">
                          {capa ? (
                            <a href={signed[capa]} target="_blank" rel="noopener">
                              <img
                                src={signed[capa]}
                                alt="Referência enviada pelo cliente"
                                className="h-12 w-12 border border-border object-cover"
                              />
                            </a>
                          ) : null}
                          <div className="min-w-0">
                            <h4 className="truncate text-sm text-foreground">{lead.nome}</h4>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                              {lead.tatuador || "sem tatuador"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                          {lead.servico} · {lead.largura_cm}x{lead.altura_cm} cm · {lead.local_corpo}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <a
                            href={whatsappLink(
                              `Olá ${lead.nome.split(" ")[0]}, aqui é do Titans Tattoo Studio sobre seu orçamento (${lead.servico}, ${lead.largura_cm}x${lead.altura_cm} cm, ${lead.local_corpo}).`,
                            ).replace(/wa\.me\/\d+/, `wa.me/${onlyDigits(lead.whatsapp)}`)}
                            target="_blank"
                            rel="noopener"
                            className="border border-border px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                          >
                            WhatsApp
                          </a>
                          <button
                            type="button"
                            disabled={indice <= 0}
                            onClick={() => mudarStatus(lead.id, ETAPAS[indice - 1]!.key)}
                            className="border border-border px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            aria-label="Voltar etapa"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={indice >= ETAPAS.length - 1}
                            onClick={() => mudarStatus(lead.id, ETAPAS[indice + 1]!.key)}
                            className="border border-border px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            aria-label="Avançar etapa"
                          >
                            →
                          </button>
                        </div>

                        <select
                          value={etapaDoLead(lead.status)}
                          onChange={(e) => mudarStatus(lead.id, e.target.value)}
                          aria-label={`Etapa de ${lead.nome}`}
                          className="mt-3 w-full border border-border bg-background px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          {ETAPAS.map((e) => (
                            <option key={e.key} value={e.key}>
                              {e.label}
                            </option>
                          ))}
                        </select>

                        {coluna.key === "concluído" ? (
                          <Link
                            to="/pagamentos"
                            className="mt-3 block border border-foreground/70 px-3 py-2 text-center text-[10px] uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-background"
                          >
                            Registrar recebimento
                          </Link>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : visiveis.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Nenhum orçamento nesta situação ainda.</p>
      ) : (
        <div className="mt-10 space-y-6">
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
                <Info label="E-mail" value={lead.email || "-"} />
                <Info label="Endereço" value={lead.endereco || "—"} />
                <Info label="Serviço" value={lead.servico} />
                <Info label="Dimensão" value={`${lead.largura_cm} cm x ${lead.altura_cm} cm`} />
                <Info label="Local do corpo" value={lead.local_corpo} />
                <Info label="Cor" value={lead.cor || "-"} />
                <Info label="Tipo de trabalho" value={lead.tipo || "-"} />
                <Info label="Tatuador" value={lead.tatuador || "-"} />
                <Info label="Disponibilidade" value={lead.disponibilidade || "-"} />
              </dl>

              <p className="mt-6 whitespace-pre-line border-t border-border pt-5 text-sm text-muted-foreground">
                {lead.ideia}
              </p>

              {lead.referencias?.length ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {lead.referencias.map((path) =>
                    signed[path] ? (
                      <a key={path} href={signed[path]} target="_blank" rel="noopener">
                        <img
                          src={signed[path]}
                          alt="Referência enviada pelo cliente"
                          className="h-28 w-28 border border-border object-cover"
                        />
                      </a>
                    ) : (
                      <div key={path} className="h-28 w-28 border border-border bg-card/40" />
                    ),
                  )}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={whatsappLink(
                    `Olá ${lead.nome.split(" ")[0]}, aqui é do Titans Tattoo Studio sobre seu orçamento (${lead.servico}, ${lead.largura_cm}x${lead.altura_cm} cm, ${lead.local_corpo}).`,
                  ).replace(/wa\.me\/\d+/, `wa.me/${onlyDigits(lead.whatsapp)}`)}
                  target="_blank"
                  rel="noopener"
                  className="border border-foreground/80 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
                >
                  Responder no WhatsApp
                </a>
                {lead.status === "concluído" ? (
                  <Link
                    to="/pagamentos"
                    className="border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Registrar recebimento
                  </Link>
                ) : null}
                {papeis?.includes("master") ? (
                  <button
                    type="button"
                    onClick={() => excluirLead(lead.id)}
                    className="border border-destructive/60 px-6 py-3 text-xs uppercase tracking-[0.2em] text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
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
    </Section>
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
