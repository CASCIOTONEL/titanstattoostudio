import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Section, SectionTitle } from "@/components/site/Section";
import { artists, services, studio, whatsappLink } from "@/lib/studio";

const searchSchema = z.object({
  artist: z.string().optional(),
  service: z.string().optional(),
});

export const Route = createFileRoute("/orcamento")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Solicitar orçamento — Titans Tattoo Studio" },
      {
        name: "description",
        content:
          "Conte sua ideia, tamanho, local do corpo e referências. Respondemos com valor estimado e disponibilidade.",
      },
      { property: "og:title", content: "Solicitar orçamento — Titans Tattoo Studio" },
      {
        property: "og:description",
        content: "Formulário de orçamento de tatuagem, cobertura, remoção a laser e piercing.",
      },
    ],
  }),
  component: OrcamentoPage,
});

const fieldClass =
  "w-full border border-border bg-card/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground";

const labelClass = "mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted-foreground";

function OrcamentoPage() {
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();

    const nome = get("nome");
    const whats = get("whatsapp");
    const ideia = get("ideia");
    if (nome.length < 2 || whats.length < 8 || ideia.length < 10) {
      setError("Preencha nome, WhatsApp e uma descrição da ideia com pelo menos 10 caracteres.");
      return;
    }
    setError(null);

    const linhas = [
      "*Novo orçamento — site Titans*",
      `Nome: ${nome}`,
      `WhatsApp: ${whats}`,
      `E-mail: ${get("email") || "-"}`,
      `Nascimento: ${get("nascimento") || "-"}`,
      `Serviço: ${get("servico")}`,
      `Ideia: ${ideia}`,
      `Tamanho aproximado: ${get("tamanho") || "-"}`,
      `Local do corpo: ${get("local") || "-"}`,
      `Estilo de cor: ${get("cor")}`,
      `Tipo de trabalho: ${get("tipo")}`,
      `Tatuador de preferência: ${get("tatuador")}`,
      `Disponibilidade: ${get("disponibilidade") || "-"}`,
      `Referências: ${get("referencias") || "envio pelo WhatsApp"}`,
    ];

    window.open(whatsappLink(linhas.join("\n")), "_blank", "noopener");
  }

  return (
    <Section>
      <SectionTitle
        eyebrow="Primeiro passo"
        title="Solicitar orçamento"
        description="Quanto mais detalhes, mais preciso o valor. Ao enviar, sua ficha segue direto para o WhatsApp do estúdio."
      />

      <form onSubmit={handleSubmit} className="mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="nome">Nome completo</label>
          <input id="nome" name="nome" maxLength={100} className={fieldClass} placeholder="Seu nome" />
        </div>
        <div>
          <label className={labelClass} htmlFor="whatsapp">WhatsApp</label>
          <input id="whatsapp" name="whatsapp" maxLength={20} className={fieldClass} placeholder="(51) 90000-0000" />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" maxLength={255} className={fieldClass} placeholder="voce@email.com" />
        </div>
        <div>
          <label className={labelClass} htmlFor="nascimento">Data de nascimento</label>
          <input id="nascimento" name="nascimento" type="date" className={fieldClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="servico">Serviço</label>
          <select id="servico" name="servico" defaultValue={search.service ?? services[0]!.name} className={fieldClass}>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="ideia">Sua ideia</label>
          <textarea id="ideia" name="ideia" rows={5} maxLength={1500} className={fieldClass} placeholder="Descreva o desenho, o significado e o estilo que você quer." />
        </div>

        <div>
          <label className={labelClass} htmlFor="tamanho">Tamanho aproximado</label>
          <input id="tamanho" name="tamanho" maxLength={60} className={fieldClass} placeholder="Ex: 15 cm" />
        </div>
        <div>
          <label className={labelClass} htmlFor="local">Local do corpo</label>
          <input id="local" name="local" maxLength={60} className={fieldClass} placeholder="Ex: antebraço direito" />
        </div>

        <div>
          <label className={labelClass} htmlFor="cor">Colorida ou preto e cinza</label>
          <select id="cor" name="cor" className={fieldClass}>
            <option>Preto e cinza</option>
            <option>Colorida</option>
            <option>Ainda não sei</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="tipo">Tipo de trabalho</label>
          <select id="tipo" name="tipo" className={fieldClass}>
            <option>Primeira tatuagem</option>
            <option>Já tenho tatuagens</option>
            <option>Cobertura de tatuagem antiga</option>
            <option>Conserto / reforço</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="tatuador">Tatuador de preferência</label>
          <select id="tatuador" name="tatuador" defaultValue={search.artist ?? "Sem preferência"} className={fieldClass}>
            <option>Sem preferência</option>
            {artists.map((a) => (
              <option key={a.slug} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="disponibilidade">Disponibilidade de datas</label>
          <input id="disponibilidade" name="disponibilidade" maxLength={120} className={fieldClass} placeholder="Ex: sábados pela manhã" />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="referencias">Referências</label>
          <input id="referencias" name="referencias" maxLength={300} className={fieldClass} placeholder="Links de referências (as fotos você envia no WhatsApp)" />
        </div>

        {error ? (
          <p role="alert" className="md:col-span-2 text-sm text-destructive">{error}</p>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="border border-foreground/80 px-7 py-4 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
          >
            Enviar pelo WhatsApp
          </button>
          <p className="text-xs text-muted-foreground">
            Ou fale direto: {studio.phoneDisplay}
          </p>
        </div>
      </form>
    </Section>
  );
}
