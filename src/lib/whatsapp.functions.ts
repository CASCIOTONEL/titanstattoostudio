import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

/** Número que recebe os avisos de novos orçamentos (somente dígitos, com DDI). */
export const NUMERO_AVISO = "5551993526883";

/** WhatsApp de cada tatuador — recebe o orçamento quando for o escolhido no site. */
export const WHATSAPP_TATUADORES: Record<string, string> = {
  cascio: "5551993526883",
  braian: "5551997072442",
  ricardo: "5551997025755",
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** Lista de destinatários: o estúdio e, quando houver, o tatuador escolhido. */
function destinatarios(tatuador: string | null) {
  const lista = [NUMERO_AVISO];
  if (tatuador) {
    const numero = WHATSAPP_TATUADORES[normalizar(tatuador)];
    if (numero && !lista.includes(numero)) lista.push(numero);
  }
  return lista;
}

type Lead = {
  id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  endereco: string;
  servico: string;
  ideia: string;
  largura_cm: number;
  altura_cm: number;
  local_corpo: string;
  cor: string | null;
  tipo: string | null;
  tatuador: string | null;
  disponibilidade: string | null;
  referencias: string[];
  created_at: string;
  aviso_wa_id: string | null;
};

function resumo(lead: Lead) {
  return [
    "*Novo orçamento — site Titans*",
    `Nome: ${lead.nome}`,
    `WhatsApp: ${lead.whatsapp}`,
    `E-mail: ${lead.email || "-"}`,
    `Endereço: ${lead.endereco}`,
    `Serviço: ${lead.servico}`,
    `Ideia: ${lead.ideia}`,
    `Tamanho: ${lead.largura_cm} cm x ${lead.altura_cm} cm`,
    `Local do corpo: ${lead.local_corpo}`,
    `Estilo de cor: ${lead.cor || "-"}`,
    `Tipo de trabalho: ${lead.tipo || "-"}`,
    `Tatuador de preferência: ${lead.tatuador || "-"}`,
    `Disponibilidade: ${lead.disponibilidade || "-"}`,
  ].join("\n");
}

async function enviar(para: string, body: Record<string, unknown>) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const whatsappKey = process.env["WHATSAPP_API_KEY"];
  if (!lovableKey || !whatsappKey) throw new Error("Credenciais do WhatsApp não configuradas");

  const response = await fetch(`${GATEWAY_URL}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": whatsappKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", to: para, ...body }),
  });
  const texto = await response.text();
  if (!response.ok) {
    console.error(`Envio de WhatsApp falhou [${response.status}]: ${texto}`);
    throw new Error(`Envio de WhatsApp falhou [${response.status}]: ${texto}`);
  }
  const json = JSON.parse(texto) as { messages?: { id?: string }[] };
  return json.messages?.[0]?.id ?? null;
}

/**
 * Avisa o estúdio no WhatsApp sobre um orçamento recém-enviado pelo site.
 * Endpoint público (o visitante não tem conta): só age sobre orçamentos criados
 * nos últimos 15 minutos e que ainda não foram avisados.
 */
export const avisarNovoOrcamento = createServerFn({ method: "POST" })
  .inputValidator((input: { leadId: string }) => {
    if (!input || typeof input.leadId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.leadId)) {
      throw new Error("Orçamento inválido");
    }
    return { leadId: input.leadId };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", data.leadId)
      .maybeSingle<Lead>();
    if (error) throw new Error(error.message);
    if (!lead) return { enviado: false, motivo: "nao-encontrado" as const };
    if (lead.aviso_wa_id) return { enviado: false, motivo: "ja-avisado" as const };
    if (Date.now() - new Date(lead.created_at).getTime() > 15 * 60 * 1000) {
      return { enviado: false, motivo: "expirado" as const };
    }

    // Marca antes de enviar para evitar avisos duplicados em chamadas simultâneas.
    const { data: reservado } = await supabaseAdmin
      .from("leads")
      .update({ aviso_em: new Date().toISOString(), aviso_wa_id: `pendente:${lead.id}` })
      .eq("id", lead.id)
      .is("aviso_wa_id", null)
      .select("id")
      .maybeSingle();
    if (!reservado) return { enviado: false, motivo: "ja-avisado" as const };

    const texto = resumo(lead);
    const enviados: { id: string; destinatario: string }[] = [];
    const numeros = destinatarios(lead.tatuador);

    // Gera os links das referências uma única vez (valem 7 dias).
    const referencias = Array.isArray(lead.referencias) ? lead.referencias.slice(0, 5) : [];
    const links: string[] = [];
    for (const caminho of referencias) {
      const { data: assinada } = await supabaseAdmin.storage
        .from("referencias")
        .createSignedUrl(caminho, 60 * 60 * 24 * 7);
      if (assinada?.signedUrl) links.push(assinada.signedUrl);
    }

    async function enviarPara(numero: string) {
      if (links.length === 0) {
        const id = await enviar(numero, { type: "text", text: { body: texto } });
        if (id) enviados.push({ id, destinatario: numero });
        return;
      }
      for (const [i, link] of links.entries()) {
        const id = await enviar(numero, {
          type: "image",
          image: { link, caption: i === 0 ? texto : `Referência ${i + 1} — ${lead!.nome}` },
        });
        if (id) enviados.push({ id, destinatario: numero });
      }
    }

    try {
      await enviarPara(numeros[0]!);
    } catch (err) {
      await supabaseAdmin.from("leads").update({ aviso_wa_id: null, aviso_em: null }).eq("id", lead.id);
      throw err;
    }

    // Avisa o tatuador escolhido; uma falha aqui não desfaz o aviso do estúdio.
    for (const numero of numeros.slice(1)) {
      try {
        await enviarPara(numero);
      } catch (err) {
        console.error(`Falha ao avisar o tatuador (${numero}):`, err);
      }
    }

    const principal = enviados[0]?.id ?? null;
    await supabaseAdmin.from("leads").update({ aviso_wa_id: principal }).eq("id", lead.id);

    if (enviados.length > 0) {
      await supabaseAdmin.from("whatsapp_mensagens").upsert(
        enviados.map((m) => ({
          lead_id: lead.id,
          provider_id: m.id,
          destinatario: m.destinatario,
          corpo: texto,
          status: "accepted",
        })),
        { onConflict: "provider_id" },
      );

      // Reconcilia confirmações de entrega que possam ter chegado antes deste registro.
      const { data: pendentes } = await supabaseAdmin
        .from("whatsapp_webhook_events")
        .select("id, payload")
        .eq("event", "whatsapp.status")
        .is("processed_at", null)
        .limit(50);
      for (const evento of pendentes ?? []) {
        await aplicarStatus(supabaseAdmin, evento);
      }
    }

    return { enviado: true, mensagens: enviados.length, destinos: numeros.length };
  });

const ORDEM_STATUS: Record<string, number> = {
  accepted: 0,
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
};

/** Aplica os status de entrega de um evento recebido; marca o evento como processado. */
export async function aplicarStatus(
  admin: { from: (t: string) => any },
  evento: { id: string; payload: any },
) {
  const statuses = evento.payload?.entry?.[0]?.changes?.[0]?.value?.statuses ?? [];
  let pendente = false;

  for (const status of statuses) {
    const { data: msg } = await admin
      .from("whatsapp_mensagens")
      .select("id, status")
      .eq("provider_id", status.id)
      .maybeSingle();
    if (!msg) {
      pendente = true;
      continue;
    }
    const atual = ORDEM_STATUS[msg.status] ?? 0;
    const novo = ORDEM_STATUS[status.status] ?? 0;
    if (novo < atual) continue;
    await admin
      .from("whatsapp_mensagens")
      .update({
        status: status.status,
        status_em: status.timestamp
          ? new Date(Number(status.timestamp) * 1000).toISOString()
          : new Date().toISOString(),
        erro: status.errors ?? null,
      })
      .eq("id", msg.id);
  }

  if (!pendente) {
    await admin
      .from("whatsapp_webhook_events")
      .update({ processed_at: new Date().toISOString(), processing_error: null })
      .eq("id", evento.id);
  }
}
