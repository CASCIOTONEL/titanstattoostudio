import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/site/Section";
import { services } from "@/lib/studio";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Titans Tattoo Studio" },
      {
        name: "description",
        content:
          "Tattoo autoral, cobertura e conserto, remoção a laser e piercing no Titans Tattoo Studio.",
      },
      { property: "og:title", content: "Serviços — Titans Tattoo Studio" },
      {
        property: "og:description",
        content: "Tattoo, cobertura, remoção a laser e piercing com hora marcada.",
      },
    ],
  }),
  component: ServicosPage,
});

function ServicosPage() {
  return (
    <>
      <Section className="pb-10">
        <SectionTitle
          eyebrow="O que fazemos"
          title="Serviços"
          description="Quatro frentes de trabalho, todas com avaliação prévia, material descartável e orçamento fechado antes de começar."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-px bg-border/60 sm:grid-cols-2">
          {services.map((service) => (
            <article key={service.slug} className="bg-background p-8 md:p-10">
              <h3 className="font-display text-2xl uppercase tracking-[0.06em]">{service.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              {service.image && (
                <img
                  src={service.image}
                  alt={service.name}
                  loading="lazy"
                  className="mt-6 h-64 w-full object-cover"
                />
              )}
              <ul className="mt-6 space-y-2">
                {service.points.map((point) => (
                  <li key={point} className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    — {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <Link
            to="/orcamento"
            className="inline-block border border-foreground/80 px-7 py-4 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
          >
            Solicitar orçamento
          </Link>
        </div>
      </Section>
    </>
  );
}
