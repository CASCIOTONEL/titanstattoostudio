import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso do estúdio — Titans Tattoo Studio" },
      { name: "description", content: "Área restrita da equipe do Titans Tattoo Studio." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Acesso do estúdio — Titans Tattoo Studio" },
      { property: "og:description", content: "Área restrita da equipe do Titans Tattoo Studio." },
    ],
  }),
  component: AuthPage,
});

const fieldClass =
  "w-full border border-border bg-card/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground";
const labelClass = "mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        await navigate({ to: "/orcamentos" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: `${window.location.origin}/orcamentos` },
        });
        if (error) throw error;
        setMessage(
          "Conta criada! Enviamos um link de confirmação para o seu e-mail. Abra o link para ativar o acesso à Área do estúdio.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section>
      <SectionTitle
        eyebrow="Área restrita"
        title="Acesso do estúdio"
        description="Entre com o e-mail e a senha da equipe para ver os orçamentos recebidos."
      />
      <form onSubmit={handleSubmit} className="mt-10 max-w-md space-y-6">
        <div>
          <label className={labelClass} htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder="equipe@titans.com"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={fieldClass}
            placeholder="••••••••"
          />
        </div>

        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <div className="flex flex-wrap items-center gap-5">
          <button
            type="submit"
            disabled={loading}
            className="border border-foreground/80 px-7 py-4 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
          >
            {loading ? "Aguarde..." : mode === "entrar" ? "Entrar" : "Criar acesso"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "entrar" ? "criar" : "entrar");
              setError(null);
              setMessage(null);
            }}
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "entrar" ? "Criar acesso da equipe" : "Já tenho acesso"}
          </button>
        </div>
      </form>
    </Section>
  );
}
