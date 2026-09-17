import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/site/BrandLogo";

const nav = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/portfolio", label: "Portfólio" },
  { to: "/tatuadores", label: "Tatuadores" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="block w-36 sm:w-44" onClick={() => setOpen(false)}>
          <BrandLogo priority />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/orcamento"
            className="border border-foreground/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Solicitar orçamento
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div className={cn("border-t border-border/60 md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
          {[...nav, { to: "/orcamento", label: "Solicitar orçamento" } as const].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="py-2 text-sm uppercase tracking-[0.18em] text-muted-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
