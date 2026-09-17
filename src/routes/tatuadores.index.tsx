import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/site/Section";
import { artists } from "@/lib/studio";

export const Route = createFileRoute("/tatuadores/")({
  head: () => ({
    meta: [
      { title: "Tatuadores — Titans Tattoo Studio" },
      {
        name: "description",
        content:
          "Conheça os tatuadores da Titans: realismo preto e cinza, fine line, blackwork e cobertura.",
      },
      { property: "og:title", content: "Tatuadores — Titans Tattoo Studio" },
      {
        property: "og:description",
        content: "Realismo, fine line, blackwork e cobertura com artistas residentes.",
      },
    ],
  }),
  component: ArtistsPage,
});

function ArtistsPage() {
  return (
    <Section>
      <SectionTitle
        eyebrow="Equipe"
        title="Tatuadores"
        description="Cada artista tem especialidade, agenda e estilo próprios. Escolha quem mais combina com a sua ideia."
      />

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {artists.map((artist) => (
          <Link
            key={artist.slug}
            to="/tatuadores/$slug"
            params={{ slug: artist.slug }}
            className="group border border-border/60"
          >
            <img
              src={artist.photo}
              alt={`Retrato do tatuador ${artist.name}`}
              loading="lazy"
              width={912}
              height={1104}
              className="h-80 w-full object-cover object-top transition duration-700 group-hover:scale-[1.02]"
            />
            <div className="p-6">
              <h3 className="font-display text-xl uppercase tracking-[0.08em]">{artist.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {artist.role}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{artist.bio}</p>
              <span className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-foreground">
                Ver perfil →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
