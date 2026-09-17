import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/site/Section";
import heroImage from "@/assets/hero-studio.jpg";
import { artists, campaigns, portfolio, services, studio, testimonials, whatsappLink } from "@/lib/studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Titans Tattoo Studio — Tatuagem autoral em São Paulo" },
      {
        name: "description",
        content:
          "Estúdio de tatuagem, cobertura, remoção a laser e piercing. Projeto autoral, biossegurança e agenda com hora marcada.",
      },
      { property: "og:title", content: "Titans Tattoo Studio — Tatuagem autoral" },
      {
        property: "og:description",
        content: "Tattoo, cobertura, remoção a laser e piercing com artistas residentes.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <img
          src={heroImage}
          alt="Tatuador trabalhando no estúdio Titans"
          width={1920}
          height={1280}
          className="absolute inset-0 size-full object-cover opacity-45 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-24">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            São Paulo · desde 2014
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl uppercase leading-[0.95] tracking-[0.02em] text-foreground md:text-8xl">
            A sua história
            <br />
            marcada na pele
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground">
            Projeto autoral, execução precisa e um estúdio que trata cada sessão como um
            compromisso sério. Do primeiro rascunho ao retoque final.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/orcamento"
              className="border border-foreground bg-foreground px-7 py-4 text-xs uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-85"
            >
              Quero fazer minha tattoo
            </Link>
            <a
              href={whatsappLink("Olá! Quero agendar um horário na Titans.")}
              target="_blank"
              rel="noreferrer"
              className="border border-foreground/60 px-7 py-4 text-xs uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Agendar
            </a>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <Section>
        <SectionTitle
          eyebrow="O que fazemos"
          title="Serviços"
          description="Quatro frentes de trabalho, todas com avaliação prévia e orçamento fechado antes de começar."
        />
        <div className="mt-12 grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <article key={service.slug} className="bg-background p-8">
              <span className="text-xs tracking-[0.3em] text-muted-foreground">
                0{i + 1}
              </span>
              <h3 className="mt-6 font-display text-xl uppercase tracking-[0.06em]">
                {service.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.short}</p>
            </article>
          ))}
        </div>
        <Link
          to="/servicos"
          className="mt-10 inline-block text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
        >
          Ver detalhes dos serviços →
        </Link>
      </Section>

      {/* Portfólio */}
      <Section className="border-t border-border/60">
        <SectionTitle eyebrow="Trabalhos" title="Portfólio" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.slice(0, 6).map((item) => (
            <figure key={item.id} className="group overflow-hidden border border-border/60">
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                width={912}
                height={1104}
                className="h-96 w-full object-cover grayscale transition duration-700 group-hover:scale-[1.04]"
              />
            </figure>
          ))}
        </div>
        <Link
          to="/portfolio"
          className="mt-10 inline-block text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
        >
          Ver portfólio completo →
        </Link>
      </Section>

      {/* Tatuadores */}
      <Section className="border-t border-border/60">
        <SectionTitle eyebrow="Equipe" title="Tatuadores" />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {artists.map((artist) => (
            <Link
              key={artist.slug}
              to="/tatuadores/$slug"
              params={{ slug: artist.slug }}
              className="group border border-border/60"
            >
              <img
                src={artist.works[0]!.src}
                alt={artist.works[0]!.alt}
                loading="lazy"
                width={912}
                height={1104}
                className="h-72 w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
              />
              <div className="p-6">
                <h3 className="font-display text-lg uppercase tracking-[0.08em]">{artist.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {artist.role}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Depoimentos */}
      <Section className="border-t border-border/60">
        <SectionTitle eyebrow="Quem já tatuou" title="Depoimentos" />
        <div className="mt-12 grid gap-px bg-border/60 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="bg-background p-8">
              <p className="text-sm leading-relaxed text-muted-foreground">“{t.text}”</p>
              <footer className="mt-6 text-xs uppercase tracking-[0.2em] text-foreground">
                {t.name}
                <span className="ml-2 text-muted-foreground">· {t.service}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </Section>

      {/* Campanhas */}
      <Section className="border-t border-border/60">
        <SectionTitle eyebrow="Agenda promocional" title="Campanhas" />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {campaigns.map((c) => (
            <article key={c.title} className="border border-border/60 p-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                {c.date}
              </p>
              <h3 className="mt-4 font-display text-xl uppercase tracking-[0.06em]">{c.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* CTA final */}
      <Section className="border-t border-border/60">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl uppercase tracking-[0.04em] md:text-5xl">
              Bora tirar a ideia do papel?
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {studio.address} · {studio.phoneDisplay}
            </p>
          </div>
          <Link
            to="/orcamento"
            className="border border-foreground bg-foreground px-7 py-4 text-xs uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-85"
          >
            Solicitar orçamento
          </Link>
        </div>
      </Section>
    </>
  );
}
