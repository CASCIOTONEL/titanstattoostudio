import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/site/Section";
import { studio, whatsappLink } from "@/lib/studio";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e localização — Titans Tattoo Studio" },
      {
        name: "description",
        content: "Endereço, horários de funcionamento, telefone e WhatsApp do Titans Tattoo Studio.",
      },
      { property: "og:title", content: "Contato e localização — Titans Tattoo Studio" },
      {
        property: "og:description",
        content: "Onde estamos, horários de atendimento e canais de contato.",
      },
      { property: "og:url", content: "https://pigmentflow-pro.lovable.app/contato" },
    ],
    links: [{ rel: "canonical", href: "https://pigmentflow-pro.lovable.app/contato" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TattooParlor",
          name: studio.name,
          url: "https://pigmentflow-pro.lovable.app/",
          telephone: "+55" + studio.whatsapp.slice(2),
          email: studio.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Rua Mathias Velho, 170 — Sala 201",
            addressLocality: "Canoas",
            addressRegion: "RS",
            postalCode: "92310-300",
            addressCountry: "BR",
          },
          sameAs: [`https://instagram.com/${studio.instagram.replace("@", "")}`],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "10:00",
              closes: "19:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday"],
              opens: "10:00",
              closes: "17:00",
            },
          ],
        }),
      },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <Section>
      <SectionTitle
        as="h1"
        eyebrow="Onde estamos"
        title="Contato"
        description="Atendimento com hora marcada. Para tirar dúvidas rápidas, chame no WhatsApp."
      />

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div className="space-y-6 text-sm text-muted-foreground">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground">Endereço</p>
            <p className="mt-2">{studio.address}</p>
            <p>{studio.cep}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground">Horários</p>
            <ul className="mt-2 space-y-1">
              {studio.hours.map((h) => (
                <li key={h.day}>
                  {h.day}: {h.time}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground">Canais</p>
            <p className="mt-2">{studio.phoneDisplay}</p>
            <p>{studio.email}</p>
            <p>
              <a
                href={`https://instagram.com/${studio.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                Instagram {studio.instagram}
              </a>
            </p>
            <p>
              <a
                href="https://facebook.com/titanstattoo"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                Facebook {studio.facebook}
              </a>
            </p>
          </div>
          <a
            href={whatsappLink("Olá! Gostaria de tirar uma dúvida com a Titans.")}
            target="_blank"
            rel="noreferrer"
            className="inline-block border border-foreground/80 px-7 py-4 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
          >
            Chamar no WhatsApp
          </a>
        </div>

        <div className="min-h-80 border border-border/60">
          <iframe
            title="Mapa da localização do estúdio"
            className="h-full min-h-80 w-full grayscale"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Rua%20Mathias%20Velho%2C%20170%2C%20Canoas%2C%20RS&output=embed"
          />
        </div>
      </div>
    </Section>
  );
}
