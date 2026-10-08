import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/site/Section";

export const Route = createFileRoute("/cuidados")({
  head: () => ({
    meta: [
      { title: "Cuidados pós-tattoo — Titans Tattoo Studio" },
      { name: "description", content: "Guia de cicatrização do Titans Tattoo Studio: lavagem, pomada, sol, piscina e retoque." },
      { property: "og:title", content: "Cuidados pós-tattoo — Titans Tattoo Studio" },
      { property: "og:description", content: "Tudo o que você precisa saber para sua tattoo cicatrizar bem." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CuidadosPage,
});

const ETAPAS = [
  { t: "Primeiras horas", i: ["Mantenha o plástico ou filme por 2 a 4 horas (ou conforme o tatuador orientou).", "Retire com as mãos limpas e lave em seguida."] },
  { t: "Lavagem", i: ["Lave 2 a 3 vezes ao dia com água fria ou morna e sabonete neutro.", "Seque com papel toalha, dando leves batidinhas. Não esfregue."] },
  { t: "Pomada", i: ["Aplique uma camada fina da pomada indicada após cada lavagem.", "Excesso de pomada abafa a pele: menos é mais."] },
  { t: "Durante 30 dias, evite", i: ["Sol direto, praia, piscina, sauna e banheira.", "Coçar ou arrancar as casquinhas.", "Roupas apertadas sobre a tattoo e academia que atrite a região nos primeiros dias."] },
  { t: "Alimentação", i: ["Beba bastante água.", "Evite bebida alcoólica nos primeiros dias, e reduza alimentos muito gordurosos e embutidos."] },
  { t: "Retoque", i: ["Depois de cerca de 30 dias, mande uma foto para avaliarmos se precisa de retoque.", "Após cicatrizada, use protetor solar sempre para manter as cores e o traço."] },
];

function CuidadosPage() {
  return (
    <Section>
      <SectionTitle eyebrow="Pós-atendimento" title="Cuidados com sua tattoo" description="Siga estas orientações para uma cicatrização perfeita. Qualquer dúvida, chame a gente no WhatsApp." />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {ETAPAS.map((e) => (
          <article key={e.t} className="border border-border bg-card/30 p-6">
            <h3 className="font-display text-xl uppercase tracking-wide text-foreground">{e.t}</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {e.i.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">Vermelhidão forte, pus, febre ou dor que aumenta depois do 3º dia: procure um médico e avise o estúdio.</p>
    </Section>
  );
}
