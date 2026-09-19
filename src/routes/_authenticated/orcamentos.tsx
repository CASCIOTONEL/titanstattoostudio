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
  endereco: string;
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

const statusOptions = [
  "novo",
  "aguardando informações",
  "orçamento enviado",
  "aguardando sinal",
  "agendado",
  "realizado",
  "arquivado",
];

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

  const visiveis = useMemo(
    () => (filtro === "todos" ? leads : leads.filter((l) => l.status === filtro)),
    [leads, filtro],
  );

  async function mudarStatus(id: string, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) setError(error.message);
  }

  async function sair() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <SectionTitle
          eyebrow="Área do estúdio"
          title="Orçamentos recebidos"
          description="Cada pedido enviado pelo site com nome, WhatsApp, endereço, dimensão e local do corpo."
        />
        <div className="flex flex-wrap gap-3">
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

      {papeis !== null && papeis.length === 0 ? (
        <p role="alert" className="mt-10 text-sm text-destructive">
          Seu acesso ainda não tem permissão para ver os orçamentos. Peça ao administrador do estúdio
          para liberar o seu nível de permissão.
        </p>
      ) : null}


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

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando orçamentos...</p>
      ) : error ? (
        <p role="alert" className="mt-10 text-sm text-destructive">{error}</p>
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
                <select
                  value={lead.status}
                  onChange={(e) => mudarStatus(lead.id, e.target.value)}
                  className="border border-border bg-card/40 px-3 py-2 text-xs uppercase tracking-[0.16em] text-foreground"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <Info label="WhatsApp" value={lead.whatsapp} />
                <Info label="E-mail" value={lead.email || "-"} />
                <Info label="Endereço" value={lead.endereco} />
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
              </div>
            </article>
          ))}
        </div>
      )}
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
