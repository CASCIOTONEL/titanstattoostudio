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
          "Envie sua referência, o tamanho em centímetros e o local do corpo. Respondemos com valor estimado e disponibilidade.",
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

const bodyParts = [
  "Antebraço",
  "Braço / bíceps",
  "Ombro",
  "Mão / dedos",
  "Peito",
  "Costas",
  "Costela / lateral",
  "Abdômen",
  "Coxa",
  "Panturrilha",
  "Pé / tornozelo",
  "Pescoço",
  "Outro (explico no WhatsApp)",
];

const orcamentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo.").max(100),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido com DDD.").max(20),
  email: z.string().trim().email("Informe um e-mail válido.").max(255).or(z.literal("")),
  endereco: z.string().trim().min(5, "Informe seu endereço (cidade e bairro no mínimo).").max(200),
  servico: z.string().trim().min(1),
  ideia: z.string().trim().min(10, "Descreva sua ideia com pelo menos 10 caracteres.").max(1500),
  largura: z.coerce.number().positive("Informe a largura em centímetros.").max(300),
  altura: z.coerce.number().positive("Informe a altura em centímetros.").max(300),
  local: z.string().trim().min(1, "Selecione o local do corpo."),
  cor: z.string(),
  tipo: z.string(),
  tatuador: z.string(),
  disponibilidade: z.string().trim().max(120),
});

function OrcamentoPage() {
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sent, setSent] = useState<null | { nome: string; link: string }>(null);

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(event.target.files ?? []).slice(0, 5);
    setFiles(list);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form.entries());

    const parsed = orcamentoSchema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os campos obrigatórios.");
      return;
    }
    if (files.length === 0) {
      setError("Anexe pelo menos uma imagem de referência.");
      return;
    }
    setError(null);
    setSaving(true);
    const d = parsed.data;

    const linhas = [
      "*Novo orçamento — site Titans*",
      `Nome: ${d.nome}`,
      `WhatsApp: ${d.whatsapp}`,
      `E-mail: ${d.email || "-"}`,
      `Endereço: ${d.endereco}`,
      `Serviço: ${d.servico}`,
      `Ideia: ${d.ideia}`,
      `Tamanho: ${d.largura} cm x ${d.altura} cm`,
      `Local do corpo: ${d.local}`,
      `Estilo de cor: ${d.cor}`,
      `Tipo de trabalho: ${d.tipo}`,
      `Tatuador de preferência: ${d.tatuador}`,
      `Disponibilidade: ${d.disponibilidade || "-"}`,
      `Referências: ${files.length} imagem(ns) — vou anexar aqui na conversa.`,
    ];

    const link = whatsappLink(linhas.join("\n"));
    const janela = window.open(link, "_blank", "noopener");

    try {
      const pasta = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const caminhos: string[] = [];
      for (const [i, file] of files.entries()) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${pasta}/${i + 1}.${ext}`;
        const { error: upErr } = await supabase.storage.from("referencias").upload(path, file, {
          contentType: file.type || "image/jpeg",
        });
        if (!upErr) caminhos.push(path);
      }

      const { error: insertError } = await supabase.from("leads").insert({
        nome: d.nome,
        whatsapp: d.whatsapp,
        email: d.email || null,
        endereco: d.endereco,
        servico: d.servico,
        ideia: d.ideia,
        largura_cm: d.largura,
        altura_cm: d.altura,
        local_corpo: d.local,
        cor: d.cor,
        tipo: d.tipo,
        tatuador: d.tatuador,
        disponibilidade: d.disponibilidade || null,
        referencias: caminhos,
      });
      if (insertError) throw insertError;
    } catch (err) {
      console.error("Falha ao salvar o orçamento", err);
    } finally {
      setSaving(false);
      if (!janela) {
        // pop-up bloqueado: a tela de confirmação oferece o link novamente
      }
      setSent({ nome: d.nome, link });
    }
  }

  if (sent) {
    return (
      <Section>
        <SectionTitle
          eyebrow="Pedido enviado"
          title={`Obrigado, ${sent.nome.split(" ")[0]}!`}
          description="Seu orçamento foi aberto no WhatsApp do estúdio. Envie agora as imagens de referência na conversa para finalizarmos o pedido."
        />
        <div className="mt-10 max-w-2xl space-y-6">
          {previews.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {previews.map((src) => (
                <img key={src} src={src} alt="Referência anexada" className="h-28 w-28 object-cover border border-border" />
              ))}
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Respondemos em horário comercial. Se a janela do WhatsApp não abriu, use o botão abaixo ou ligue para {studio.phoneDisplay}.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={sent.link}
              target="_blank"
              rel="noopener"
              className="border border-foreground/80 px-7 py-4 text-xs uppercase tracking-[0.22em] transition-colors hover:bg-foreground hover:text-background"
            >
              Abrir WhatsApp novamente
            </a>
            <button
              type="button"
              onClick={() => setSent(null)}
              className="border border-border px-7 py-4 text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Fazer outro orçamento
            </button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle
        eyebrow="Primeiro passo"
        title="Solicitar orçamento"
        description="Campos com * são obrigatórios. Quanto mais detalhes, mais preciso o valor. Ao enviar, sua ficha segue direto para o WhatsApp do estúdio."
      />

      <form onSubmit={handleSubmit} noValidate className="mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="nome">Nome completo *</label>
          <input id="nome" name="nome" maxLength={100} className={fieldClass} placeholder="Seu nome" />
        </div>
        <div>
          <label className={labelClass} htmlFor="whatsapp">WhatsApp *</label>
          <input id="whatsapp" name="whatsapp" maxLength={20} className={fieldClass} placeholder="(51) 90000-0000" />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" maxLength={255} className={fieldClass} placeholder="voce@email.com" />
        </div>
        <div>
          <label className={labelClass} htmlFor="endereco">Endereço *</label>
          <input id="endereco" name="endereco" maxLength={200} className={fieldClass} placeholder="Rua, número, bairro, cidade" />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="servico">Serviço *</label>
          <select id="servico" name="servico" defaultValue={search.service ?? services[0]!.name} className={fieldClass}>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="ideia">Sua ideia *</label>
          <textarea id="ideia" name="ideia" rows={5} maxLength={1500} className={fieldClass} placeholder="Descreva o desenho, o significado e o estilo que você quer." />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="referencias">Imagens de referência *</label>
          <input
            id="referencias"
            name="referencias"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="w-full border border-border bg-card/40 px-4 py-3 text-sm text-muted-foreground file:mr-4 file:border file:border-border file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-foreground"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Até 5 imagens. Elas seguem anexadas por você na conversa do WhatsApp que abrimos ao enviar.
          </p>
          {previews.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {previews.map((src) => (
                <img key={src} src={src} alt="Pré-visualização da referência" className="h-24 w-24 object-cover border border-border" />
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="largura">Largura (cm) *</label>
          <input id="largura" name="largura" type="number" min={1} max={300} step="0.5" className={fieldClass} placeholder="Ex: 12" />
        </div>
        <div>
          <label className={labelClass} htmlFor="altura">Altura (cm) *</label>
          <input id="altura" name="altura" type="number" min={1} max={300} step="0.5" className={fieldClass} placeholder="Ex: 18" />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="local">Local do corpo *</label>
          <select id="local" name="local" defaultValue="" className={fieldClass}>
            <option value="" disabled>Selecione o local</option>
            {bodyParts.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
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

        <p className="md:col-span-2 mt-2 border-t border-border pt-6 text-sm text-muted-foreground">
          Após enviar as informações acima, a loja entra em contato com o orçamento em até <span className="text-foreground">24 horas</span>.
        </p>
      </form>
    </Section>
  );
}
