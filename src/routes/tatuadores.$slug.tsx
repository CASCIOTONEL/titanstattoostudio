import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { artists } from "@/lib/studio";

export const Route = createFileRoute("/tatuadores/$slug")({
  loader: ({ params }) => {
    const artist = artists.find((a) => a.slug === params.slug);
    if (!artist) throw notFound();
    return { name: artist.name, role: artist.role };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Tatuador não encontrado — Titans" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — Titans Tattoo Studio`;
    const description = `${loaderData.name}, ${loaderData.role} no Titans Tattoo Studio. Veja trabalhos e solicite orçamento.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ArtistPage,
  errorComponent: ({ error }) => (
    <Section>
      <p role="alert" className="text-sm text-muted-foreground">
        {error.message}
      </p>
    </Section>
  ),
  notFoundComponent: () => (
    <Section>
      <h1 className="font-display text-3xl uppercase">Tatuador não encontrado</h1>
      <Link to="/tatuadores" className="mt-6 inline-block text-xs uppercase tracking-[0.2em]">
        Ver todos os tatuadores →
      </Link>
    </Section>
  ),
});

function ArtistPage() {
  const { slug } = Route.useParams();
  const artist = artists.find((a) => a.slug === slug)!;

  return (
    <Section>
      <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{artist.role}</p>
      <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.06em] md:text-6xl">
        {artist.name}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">{artist.bio}</p>

      <img
        src={artist.photo}
        alt={`Retrato do tatuador ${artist.name}`}
        loading="lazy"
        width={912}
        height={1104}
        className="mt-10 h-[420px] w-full max-w-md border border-border/60 object-cover md:h-[520px]"
      />

      <div className="mt-8 flex flex-wrap gap-3">
        {artist.specialties.map((s) => (
          <span
            key={s}
            className="border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {artist.works.map((work) => (
          <img
            key={work.src}
            src={work.src}
            alt={work.alt}
            loading="lazy"
            width={912}
            height={1104}
            className="h-[460px] w-full border border-border/60 object-cover"
          />
        ))}
      </div>

      <Link
        to="/orcamento"
        search={{ artist: artist.name }}
        className="mt-12 inline-block border border-foreground/80 px-7 py-4 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
      >
        Solicitar orçamento com {artist.name.split(" ")[0]}
      </Link>
    </Section>
  );
}
