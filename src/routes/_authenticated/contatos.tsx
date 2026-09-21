import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/_authenticated/contatos")({
  head: () => ({
    meta: [
      { title: "Contatos e aniversariantes — Titans Tattoo Studio" },
      {
        name: "description",
        content: "Lista interna com todos os contatos de orçamento e clientes fechados.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Contatos e aniversariantes — Titans Tattoo Studio" },
      { property: "og:description", content: "Painel interno do Titans Tattoo Studio." },
    ],
  }),
  component: ContatosPage,
});

type Contato = {
  chave: string;
  nome: string;
  whatsapp: string;
  documento: string | null;
  nascimento: string | null;
  fechou: boolean;
  cliente: boolean;
  ultimoContato: string;
};

const btn =
  "border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground";

function digitos(v: string) {
  return v.replace(/\D/g, "");
}

function linkPara(whatsapp: string, mensagem: string) {
  const num = digitos(whatsapp);
  const completo = num.startsWith("55") ? num : `55${num}`;
  return `https://wa.me/${completo}?text=${encodeURIComponent(mensagem)}`;
}

function fmtData(v: string | null) {
  if (!v) return "—";
  const [a, m, d] = v.slice(0, 10).split("-");
  return d && m && a ? `${d}/${m}/${a}` : "—";
}

function idade(nascimento: string) {
  const hoje = new Date();
  const [a, m, d] = nascimento.slice(0, 10).split("-").map(Number);
  if (!a || !m || !d) return null;
  let anos = hoje.getFullYear() - a;
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) anos--;
  return anos;
}

function ContatosPage() {
  const navigate = useNavigate();
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<"todos" | "fecharam" | "aniversariantes">("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let ativo = true;
    (async () => {
      const [{ data: leads, error: e1 }, { data: clientes, error: e2 }] = await Promise.all([
        supabase
          .from("leads")
          .select("nome, whatsapp, documento, nascimento, status, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("clientes")
          .select("nome, whatsapp, documento, nascimento, created_at")
          .order("created_at", { ascending: false }),
      ]);
      if (!ativo) return;
      if (e1 || e2) {
        setErro((e1 ?? e2)?.message ?? "Não foi possível carregar os contatos.");
        setCarregando(false);
        return;
      }
      const mapa = new Map<string, Contato>();
      for (const l of leads ?? []) {
        const chave = digitos(l.whatsapp) || l.nome.toLowerCase();
        const atual = mapa.get(chave);
        const fechou = l.status === "concluído" || atual?.fechou === true;
        mapa.set(chave, {
          chave,
          nome: atual?.nome ?? l.nome,
          whatsapp: atual?.whatsapp ?? l.whatsapp,
          documento: atual?.documento ?? l.documento ?? null,
          nascimento: atual?.nascimento ?? l.nascimento ?? null,
          fechou,
          cliente: atual?.cliente ?? false,
          ultimoContato: atual?.ultimoContato ?? l.created_at,
        });
      }
      for (const c of clientes ?? []) {
        const chave = digitos(c.whatsapp) || c.nome.toLowerCase();
        const atual = mapa.get(chave);
        mapa.set(chave, {
          chave,
          nome: c.nome,
          whatsapp: c.whatsapp,
          documento: c.documento ?? atual?.documento ?? null,
          nascimento: c.nascimento ?? atual?.nascimento ?? null,
          fechou: true,
          cliente: true,
          ultimoContato: atual?.ultimoContato ?? c.created_at,
        });
      }
      setContatos(
        [...mapa.values()].sort((a, b) => b.ultimoContato.localeCompare(a.ultimoContato)),
      );
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const hojeMD = useMemo(() => {
    const h = new Date();
    return `${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
  }, []);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return contatos
      .filter((c) => {
        if (aba === "fecharam") return c.fechou;
        if (aba === "aniversariantes")
          return !!c.nascimento && c.nascimento.slice(5, 10) === hojeMD;
        return true;
      })
      .filter(
        (c) =>
          !termo ||
          c.nome.toLowerCase().includes(termo) ||
          digitos(c.whatsapp).includes(digitos(termo)) ||
          (c.documento ?? "").includes(termo),
      );
  }, [contatos, aba, busca, hojeMD]);

  const aniversariantesHoje = contatos.filter(
    (c) => !!c.nascimento && c.nascimento.slice(5, 10) === hojeMD,
  ).length;

  async function sair() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  const abas = [
    { id: "todos" as const, rotulo: `Todos (${contatos.length})` },
    { id: "fecharam" as const, rotulo: `Fecharam (${contatos.filter((c) => c.fechou).length})` },
    {
      id: "aniversariantes" as const,
      rotulo: `Aniversariantes de hoje (${aniversariantesHoje})`,
    },
  ];

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <SectionTitle
          eyebrow="Área do estúdio"
          title="Contatos"
          description="Todo mundo que pediu orçamento e quem fechou, com nome, telefone, CPF e data de nascimento."
        />
        <div className="flex flex-wrap gap-3">
          <Link to="/orcamentos" className={btn}>
            Orçamentos
          </Link>
          <Link to="/clientes" className={btn}>
            Clientes
          </Link>
          <Link to="/agenda" className={btn}>
            Agenda
          </Link>
          <button type="button" onClick={sair} className={btn}>
            Sair
          </button>
        </div>
      </div>

      {erro ? <p className="mt-6 border border-destructive/50 p-4 text-sm">{erro}</p> : null}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {abas.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={aba === a.id}
              onClick={() => setAba(a.id)}
              className={`${btn} ${aba === a.id ? "border-foreground text-foreground" : ""}`}
            >
              {a.rotulo}
            </button>
          ))}
        </div>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, telefone ou CPF"
          className="w-full max-w-sm border border-border bg-transparent px-4 py-3 text-sm"
        />
      </div>

      {carregando ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando contatos…</p>
      ) : lista.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          {aba === "aniversariantes"
            ? "Nenhum aniversariante hoje."
            : "Nenhum contato encontrado."}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Nascimento</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => {
                const anos = c.nascimento ? idade(c.nascimento) : null;
                return (
                  <tr key={c.chave} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">{c.nome}</td>
                    <td className="px-4 py-3">{c.whatsapp}</td>
                    <td className="px-4 py-3">{c.documento || "—"}</td>
                    <td className="px-4 py-3">
                      {fmtData(c.nascimento)}
                      {aba === "aniversariantes" && anos !== null ? (
                        <span className="text-muted-foreground"> · {anos} anos</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.cliente ? "Cliente" : c.fechou ? "Fechou" : "Orçamento"}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={linkPara(
                          c.whatsapp,
                          aba === "aniversariantes"
                            ? `Feliz aniversário, ${c.nome.split(" ")[0]}! Toda a equipe do Titans Tattoo Studio deseja um dia incrível.`
                            : `Olá, ${c.nome.split(" ")[0]}! Aqui é do Titans Tattoo Studio.`,
                        )}
                        target="_blank"
                        rel="noopener"
                        className="text-xs uppercase tracking-[0.18em] underline underline-offset-4"
                      >
                        Enviar
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
