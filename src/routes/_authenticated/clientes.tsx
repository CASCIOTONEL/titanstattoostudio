import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { meusPapeis, type Papel } from "@/lib/equipe.functions";
import { whatsappLink } from "@/lib/studio";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Titans Tattoo Studio" },
      { name: "description", content: "Cadastro interno de clientes do Titans Tattoo Studio." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Clientes — Titans Tattoo Studio" },
      { property: "og:description", content: "Cadastro interno de clientes do Titans Tattoo Studio." },
    ],
  }),
  component: ClientesPage,
});

type Cliente = {
  id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  nascimento: string | null;
  documento: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  alergias: string | null;
  observacoes: string | null;
  origem: string | null;
  created_at: string;
};

type Formulario = {
  nome: string;
  whatsapp: string;
  email: string;
  nascimento: string;
  documento: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  alergias: string;
  observacoes: string;
  origem: string;
};

const vazio: Formulario = {
  nome: "",
  whatsapp: "",
  email: "",
  nascimento: "",
  documento: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  alergias: "",
  observacoes: "",
  origem: "",
};

const campos: { chave: keyof Formulario; rotulo: string; tipo?: string; area?: boolean }[] = [
  { chave: "nome", rotulo: "Nome completo" },
  { chave: "whatsapp", rotulo: "WhatsApp" },
  { chave: "email", rotulo: "E-mail", tipo: "email" },
  { chave: "nascimento", rotulo: "Data de nascimento", tipo: "date" },
  { chave: "documento", rotulo: "CPF ou RG" },
  { chave: "endereco", rotulo: "Endereço" },
  { chave: "cidade", rotulo: "Cidade" },
  { chave: "estado", rotulo: "Estado" },
  { chave: "cep", rotulo: "CEP" },
  { chave: "origem", rotulo: "Como conheceu o estúdio" },
  { chave: "alergias", rotulo: "Alergias e cuidados de saúde", area: true },
  { chave: "observacoes", rotulo: "Observações", area: true },
];

function paraFormulario(cliente: Cliente): Formulario {
  return {
    nome: cliente.nome ?? "",
    whatsapp: cliente.whatsapp ?? "",
    email: cliente.email ?? "",
    nascimento: cliente.nascimento ?? "",
    documento: cliente.documento ?? "",
    endereco: cliente.endereco ?? "",
    cidade: cliente.cidade ?? "",
    estado: cliente.estado ?? "",
    cep: cliente.cep ?? "",
    alergias: cliente.alergias ?? "",
    observacoes: cliente.observacoes ?? "",
    origem: cliente.origem ?? "",
  };
}

function paraBanco(form: Formulario) {
  const limpo = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    nome: form.nome.trim(),
    whatsapp: form.whatsapp.trim(),
    email: limpo(form.email),
    nascimento: limpo(form.nascimento),
    documento: limpo(form.documento),
    endereco: limpo(form.endereco),
    cidade: limpo(form.cidade),
    estado: limpo(form.estado),
    cep: limpo(form.cep),
    alergias: limpo(form.alergias),
    observacoes: limpo(form.observacoes),
    origem: limpo(form.origem),
  };
}

function ClientesPage() {
  const navigate = useNavigate();
  const carregarPapeis = useServerFn(meusPapeis);
  const [papeis, setPapeis] = useState<Papel[] | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Formulario>(vazio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await carregarPapeis();
        if (ativo) setPapeis(lista);
      } catch {
        if (ativo) setPapeis([]);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const { data, error: erro } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!ativo) return;
      if (erro) setError(erro.message);
      else setClientes((data ?? []) as Cliente[]);
      setLoading(false);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const podeVer = papeis === null || papeis.some((p) => p === "master" || p === "recepcao");
  const ehMaster = papeis?.includes("master") ?? false;

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter((c) =>
      [c.nome, c.whatsapp, c.email ?? "", c.cidade ?? ""].join(" ").toLowerCase().includes(termo),
    );
  }, [clientes, busca]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    if (form.nome.trim().length < 2) {
      setError("Informe o nome completo do cliente.");
      return;
    }
    if (form.whatsapp.replace(/\D/g, "").length < 10) {
      setError("Informe o WhatsApp com DDD.");
      return;
    }
    setSalvando(true);
    const dados = paraBanco(form);
    if (editandoId) {
      const { data, error: erro } = await supabase
        .from("clientes")
        .update(dados)
        .eq("id", editandoId)
        .select()
        .maybeSingle();
      if (erro) setError(erro.message);
      else {
        if (data) setClientes((prev) => prev.map((c) => (c.id === editandoId ? (data as Cliente) : c)));
        setAviso("Cadastro atualizado.");
        setEditandoId(null);
        setForm(vazio);
      }
    } else {
      const { data, error: erro } = await supabase.from("clientes").insert(dados).select().maybeSingle();
      if (erro) setError(erro.message);
      else {
        if (data) setClientes((prev) => [data as Cliente, ...prev]);
        setAviso("Cliente cadastrado.");
        setForm(vazio);
      }
    }
    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este cliente?")) return;
    const { error: erro } = await supabase.from("clientes").delete().eq("id", id);
    if (erro) setError(erro.message);
    else setClientes((prev) => prev.filter((c) => c.id !== id));
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
          title="Clientes"
          description="Cadastro completo de cada pessoa atendida pelo estúdio."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/orcamentos"
            className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Orçamentos
          </Link>
          {ehMaster ? (
            <Link
              to="/equipe"
              className="border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
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

      {!podeVer ? (
        <p role="alert" className="mt-10 text-sm text-destructive">
          Seu acesso não tem permissão para ver os clientes. Esta área é da recepção e do
          administrador do estúdio.
        </p>
      ) : (
        <>
          <form onSubmit={salvar} className="mt-10 border border-border bg-card/30 p-6">
            <h3 className="text-lg text-foreground">
              {editandoId ? "Editar cliente" : "Novo cliente"}
            </h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {campos.map((campo) => (
                <label
                  key={campo.chave}
                  className={"block text-sm " + (campo.area ? "sm:col-span-2" : "")}
                >
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {campo.rotulo}
                  </span>
                  {campo.area ? (
                    <textarea
                      rows={3}
                      value={form[campo.chave]}
                      onChange={(e) => setForm((f) => ({ ...f, [campo.chave]: e.target.value }))}
                      className="mt-2 w-full border border-border bg-background px-3 py-2 text-foreground"
                    />
                  ) : (
                    <input
                      type={campo.tipo ?? "text"}
                      value={form[campo.chave]}
                      onChange={(e) => setForm((f) => ({ ...f, [campo.chave]: e.target.value }))}
                      className="mt-2 w-full border border-border bg-background px-3 py-2 text-foreground"
                    />
                  )}
                </label>
              ))}
            </div>

            {error ? (
              <p role="alert" className="mt-5 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {aviso ? <p className="mt-5 text-sm text-muted-foreground">{aviso}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="border border-foreground/80 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Cadastrar cliente"}
              </button>
              {editandoId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setForm(vazio);
                  }}
                  className="border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>

          <div className="mt-10">
            <label className="block text-sm">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Buscar cliente
              </span>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, WhatsApp, e-mail ou cidade"
                className="mt-2 w-full max-w-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </label>
          </div>

          {loading ? (
            <p className="mt-10 text-sm text-muted-foreground">Carregando clientes...</p>
          ) : visiveis.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
          ) : (
            <div className="mt-8 space-y-6">
              {visiveis.map((cliente) => (
                <article key={cliente.id} className="border border-border bg-card/30 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg text-foreground">{cliente.nome}</h3>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Cadastrado em {new Date(cliente.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`https://wa.me/${onlyDigits(cliente.whatsapp)}?text=${encodeURIComponent(
                          `Olá ${cliente.nome}, aqui é do Titans Tattoo Studio.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoId(cliente.id);
                          setForm(paraFormulario(cliente));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Editar
                      </button>
                      {ehMaster ? (
                        <button
                          type="button"
                          onClick={() => excluir(cliente.id)}
                          className="border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-destructive transition-colors hover:text-foreground"
                        >
                          Excluir
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                    <Info label="WhatsApp" value={cliente.whatsapp} />
                    <Info label="E-mail" value={cliente.email ?? "—"} />
                    <Info
                      label="Nascimento"
                      value={
                        cliente.nascimento
                          ? new Date(`${cliente.nascimento}T12:00:00`).toLocaleDateString("pt-BR")
                          : "—"
                      }
                    />
                    <Info label="Documento" value={cliente.documento ?? "—"} />
                    <Info label="Endereço" value={cliente.endereco ?? "—"} />
                    <Info
                      label="Cidade/UF"
                      value={[cliente.cidade, cliente.estado].filter(Boolean).join(" / ") || "—"}
                    />
                    <Info label="CEP" value={cliente.cep ?? "—"} />
                    <Info label="Origem" value={cliente.origem ?? "—"} />
                    <Info label="Alergias" value={cliente.alergias ?? "—"} />
                  </dl>

                  {cliente.observacoes ? (
                    <p className="mt-5 text-sm text-muted-foreground">{cliente.observacoes}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </>
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
