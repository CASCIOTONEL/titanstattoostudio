import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { artists, portfolio } from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfólio — Titans Tattoo Studio" },
      {
        name: "description",
        content:
          "Trabalhos do Titans Tattoo Studio em realismo, fine line e blackwork, filtrados por tatuador e estilo.",
      },
      { property: "og:title", content: "Portfólio — Titans Tattoo Studio" },
      {
        property: "og:description",
        content: "Realismo, fine line e blackwork feitos pelos tatuadores da Titans.",
      },
      { property: "og:url", content: "https://titanstattoostudio.com.br/portfolio" },
    ],
    links: [{ rel: "canonical", href: "https://titanstattoostudio.com.br/portfolio" }],
  }),
  component: PortfolioPage,
});

const styles = [
  "Todos",
  "Realismo",
  "Micro-realismo",
  "Fine line",
  "Blackwork",
  "Preto e cinza",
  "Colorido",
  "Geek",
  "Anime",
  "Aquarela",
  "New school",
  "Patch tattoo",
];

function PortfolioPage() {
  const [style, setStyle] = useState("Todos");
  const [artist, setArtist] = useState("Todos");

  const items = portfolio.filter(
    (item) =>
      (style === "Todos" || item.style === style) && (artist === "Todos" || item.artist === artist),
  );

  return (
    <Section>
      <SectionTitle
        as="h1"
        eyebrow="Trabalhos"
        title="Portfólio"
        description="Filtre por estilo ou por tatuador para encontrar a referência mais próxima da sua ideia."
      />

      <div className="mt-10 border-b border-border/60">
        <div className="flex flex-wrap gap-x-8 gap-y-2" role="tablist" aria-label="Tatuadores">
          {["Todos", ...artists.map((a) => a.name)].map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={artist === name}
              onClick={() => setArtist(name)}
              className={cn(
                "relative pb-3 font-display text-sm uppercase tracking-[0.22em] transition-colors md:text-base",
                artist === name
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Filters label="Estilo" options={styles} value={style} onChange={setStyle} />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <figure key={item.id} className="group relative overflow-hidden border border-border/60">
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              width={912}
              height={1104}
              className={`h-[420px] w-full object-cover transition duration-700 group-hover:scale-[1.03] ${item.id === "cascio" || item.id === "ricardo" ? "grayscale group-hover:grayscale-0 object-top" : "object-center"}`}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-background/80 px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              {item.style} · {item.artist}
            </figcaption>
          </figure>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">
          Nenhum trabalho com esses filtros ainda.
        </p>
      ) : null}
    </Section>
  );
}

function Filters({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-20 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors",
            value === option
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
