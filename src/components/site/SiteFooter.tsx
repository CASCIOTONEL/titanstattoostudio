import { Link } from "@tanstack/react-router";
import { studio } from "@/lib/studio";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-[0.18em] text-foreground">TITANS</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Tattoo Studio
          </p>
          <p className="mt-5 max-w-xs text-sm text-muted-foreground">
            Estúdio de tatuagem, cobertura, remoção a laser e piercing. Trabalho autoral,
            biossegurança e atendimento com hora marcada.
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-foreground">Navegação</p>
          <p><Link to="/servicos" className="hover:text-foreground">Serviços</Link></p>
          <p><Link to="/portfolio" className="hover:text-foreground">Portfólio</Link></p>
          <p><Link to="/tatuadores" className="hover:text-foreground">Tatuadores</Link></p>
          <p><Link to="/orcamento" className="hover:text-foreground">Solicitar orçamento</Link></p>
          <p><Link to="/faq" className="hover:text-foreground">Dúvidas frequentes</Link></p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-foreground">Contato</p>
          <p>{studio.address}</p>
          <p>{studio.phoneDisplay}</p>
          <p>{studio.email}</p>
          <p>{studio.instagram}</p>
        </div>
      </div>

      <div className="border-t border-border/60 px-5 py-6">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} {studio.name}. Conteúdo de exemplo — dados, fotos e
          endereço serão substituídos pelo material oficial do estúdio.
        </p>
      </div>
    </footer>
  );
}
