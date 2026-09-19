import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/site/Section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq } from "@/lib/studio";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Dúvidas frequentes — Titans Tattoo Studio" },
      {
        name: "description",
        content:
          "Sinal, remarcação, cicatrização e retoque: as dúvidas mais comuns sobre tatuar na Titans.",
      },
      { property: "og:title", content: "Dúvidas frequentes — Titans Tattoo Studio" },
      {
        property: "og:description",
        content: "Como funciona orçamento, sinal, remarcação, cicatrização e retoque.",
      },
      { property: "og:url", content: "https://pigmentflow-pro.lovable.app/faq" },
    ],
    links: [{ rel: "canonical", href: "https://pigmentflow-pro.lovable.app/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <Section>
      <SectionTitle as="h1" eyebrow="Antes de tatuar" title="Dúvidas frequentes" />
      <Accordion type="single" collapsible className="mt-10 max-w-3xl">
        {faq.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
