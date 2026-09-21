import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import {
  NOMES_TATUADORES,
  PAPEIS,
  ROTULO_PAPEL,
  criarUsuario,
  definirAtivo,
  definirPapeis,
  definirTatuador,
  listarEquipe,
  redefinirSenha,
  removerUsuario,
  type MembroEquipe,
  type Papel,
} from "@/lib/equipe.functions";

export const Route = createFileRoute("/_authenticated/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe e permissões — Titans Tattoo Studio" },
      { name: "description", content: "Painel interno de usuários e níveis de permissão." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Equipe e permissões — Titans Tattoo Studio" },
      { property: "og:description", content: "Painel interno do Titans Tattoo Studio." },
    ],
  }),
  component: EquipePage,
});

const fieldClass =
  "w-full border border-border bg-card/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground";
const labelClass = "mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground";
const btnClass =
  "border border-foreground/80 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50";

function EquipePage() {
  const carregar = useServerFn(listarEquipe);
  const criar = useServerFn(criarUsuario);
  const salvarPapeis = useServerFn(definirPapeis);
  const alternarAtivo = useServerFn(definirAtivo);
  const trocarSenha = useServerFn(redefinirSenha);
  const excluir = useServerFn(removerUsuario);
  const salvarTatuador = useServerFn(definirTatuador);


  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papeisNovos, setPapeisNovos] = useState<Papel[]>(["recepcao"]);
  const [salvando, setSalvando] = useState(false);

  async function recarregar() {
    try {
      const lista = await carregar();
      setMembros(lista);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar a equipe.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function acao(fn: () => Promise<unknown>, mensagem: string) {
    setErro(null);
    setAviso(null);
    try {
      await fn();
      setAviso(mensagem);
      await recarregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir a ação.");
    }
  }

  async function handleCriar(event: React.FormEvent) {
    event.preventDefault();
    setSalvando(true);
    await acao(
      () => criar({ data: { nome, email, senha, papeis: papeisNovos } }),
      "Usuário criado com sucesso.",
    );
    setSalvando(false);
    setNome("");
    setEmail("");
    setSenha("");
    setPapeisNovos(["recepcao"]);
  }

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <SectionTitle
          eyebrow="Área do estúdio"
          title="Equipe e permissões"
          description="Crie os acessos da equipe e defina o que cada pessoa pode ver no sistema."
        />
        <Link to="/orcamentos" className={btnClass}>
          Orçamentos
        </Link>
      </div>

      {erro ? <p role="alert" className="mt-8 text-sm text-destructive">{erro}</p> : null}
      {aviso ? <p className="mt-8 text-sm text-muted-foreground">{aviso}</p> : null}

      <form onSubmit={handleCriar} className="mt-10 grid gap-6 border border-border bg-card/30 p-6 md:grid-cols-2">
        <h3 className="md:col-span-2 text-lg text-foreground">Novo usuário</h3>
        <div>
          <label className={labelClass} htmlFor="nome">Nome</label>
          <input id="nome" className={fieldClass} required value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">E-mail</label>
          <input id="email" type="email" className={fieldClass} required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="senha">Senha provisória</label>
          <input id="senha" type="text" minLength={8} className={fieldClass} required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="mínimo 8 caracteres" />
        </div>
        <div>
          <span className={labelClass}>Permissões</span>
          <div className="flex flex-wrap gap-2">
            {PAPEIS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() =>
                  setPapeisNovos((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
                }
                className={
                  "border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors " +
                  (papeisNovos.includes(p)
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground")
                }
              >
                {ROTULO_PAPEL[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className={btnClass} disabled={salvando}>
            {salvando ? "Criando..." : "Criar usuário"}
          </button>
        </div>
      </form>

      {carregando ? (
        <p className="mt-10 text-sm text-muted-foreground">Carregando equipe...</p>
      ) : (
        <div className="mt-10 space-y-6">
          {membros.map((m) => (
            <MembroCard
              key={m.id}
              membro={m}
              onPapeis={(papeis) =>
                acao(() => salvarPapeis({ data: { userId: m.id, papeis } }), "Permissões atualizadas.")
              }
              onAtivo={(ativo) =>
                acao(() => alternarAtivo({ data: { userId: m.id, ativo } }), "Situação atualizada.")
              }
              onSenha={(nova) =>
                acao(() => trocarSenha({ data: { userId: m.id, senha: nova } }), "Senha redefinida.")
              }
              onExcluir={() => acao(() => excluir({ data: { userId: m.id } }), "Usuário removido.")}
              onTatuador={(nome) =>
                acao(
                  () => salvarTatuador({ data: { userId: m.id, tatuador: nome } }),
                  "Tatuador vinculado.",
                )
              }
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function MembroCard({
  membro,
  onPapeis,
  onAtivo,
  onSenha,
  onExcluir,
  onTatuador,
}: {
  membro: MembroEquipe;
  onPapeis: (papeis: Papel[]) => void;
  onAtivo: (ativo: boolean) => void;
  onSenha: (senha: string) => void;
  onExcluir: () => void;
  onTatuador: (tatuador: string | null) => void;
}) {
  const [papeis, setPapeis] = useState<Papel[]>(membro.papeis);
  const [novaSenha, setNovaSenha] = useState("");
  const [tatuador, setTatuador] = useState<string>(membro.tatuador ?? "");

  useEffect(() => setPapeis(membro.papeis), [membro.papeis]);
  useEffect(() => setTatuador(membro.tatuador ?? ""), [membro.tatuador]);

  return (
    <article className="border border-border bg-card/30 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg text-foreground">{membro.nome || membro.email}</h3>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {membro.email} · {membro.ativo ? "ativo" : "inativo"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnClass} onClick={() => onAtivo(!membro.ativo)}>
            {membro.ativo ? "Desativar" : "Ativar"}
          </button>
          <button
            type="button"
            className="border border-destructive/70 px-5 py-3 text-xs uppercase tracking-[0.2em] text-destructive transition-colors hover:bg-destructive hover:text-background"
            onClick={() => {
              if (confirm(`Excluir o acesso de ${membro.email}?`)) onExcluir();
            }}
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="mt-6">
        <span className={labelClass}>Permissões</span>
        <div className="flex flex-wrap items-center gap-2">
          {PAPEIS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                setPapeis((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
              }
              className={
                "border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors " +
                (papeis.includes(p)
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {ROTULO_PAPEL[p]}
            </button>
          ))}
          <button type="button" className={btnClass} onClick={() => onPapeis(papeis)}>
            Salvar permissões
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label className={labelClass} htmlFor={`senha-${membro.id}`}>Nova senha</label>
          <input
            id={`senha-${membro.id}`}
            className={fieldClass}
            minLength={8}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="mínimo 8 caracteres"
          />
        </div>
        <button
          type="button"
          className={btnClass}
          disabled={novaSenha.length < 8}
          onClick={() => {
            onSenha(novaSenha);
            setNovaSenha("");
          }}
        >
          Redefinir senha
        </button>
      </div>
    </article>
  );
}
