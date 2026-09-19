import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";
import { aplicarStatus } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const segredo = process.env["WHATSAPP_API_KEY"];
        if (!segredo) return new Response("Configuração ausente", { status: 500 });

        let corpo: string;
        try {
          const resultado = await verifyWebhookRequest(request, {
            secret: segredo,
            maxBodyBytes: 4 * 1024 * 1024,
          });
          corpo = typeof resultado === "string" ? resultado : ((resultado as any)?.body ?? "");
        } catch {
          return new Response("Assinatura inválida", { status: 401 });
        }

        const deliveryId = request.headers.get("X-Lovable-Delivery");
        const evento = request.headers.get("X-Lovable-Event");
        if (!deliveryId || !evento) return new Response("Cabeçalhos ausentes", { status: 400 });

        let payload: unknown;
        try {
          payload = JSON.parse(corpo);
        } catch {
          return new Response("Corpo inválido", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: existente } = await supabaseAdmin
          .from("whatsapp_webhook_events")
          .select("id, payload, processed_at")
          .eq("delivery_id", deliveryId)
          .maybeSingle();

        let linha = existente;
        if (!linha) {
          const { data: inserido, error } = await supabaseAdmin
            .from("whatsapp_webhook_events")
            .insert({ delivery_id: deliveryId, event: evento, payload })
            .select("id, payload, processed_at")
            .single();
          if (error || !inserido) {
            console.error("Falha ao gravar o aviso do WhatsApp", error);
            return new Response("Falha ao gravar", { status: 500 });
          }
          linha = inserido;
        }

        if (linha.processed_at) return new Response("ok");

        try {
          if (evento === "whatsapp.status") {
            await aplicarStatus(supabaseAdmin as any, { id: linha.id, payload: linha.payload });
          } else {
            await supabaseAdmin
              .from("whatsapp_webhook_events")
              .update({ processed_at: new Date().toISOString() })
              .eq("id", linha.id);
          }
        } catch (err) {
          console.error("Falha ao processar o aviso do WhatsApp", err);
          await supabaseAdmin
            .from("whatsapp_webhook_events")
            .update({ processing_error: String(err) })
            .eq("id", linha.id);
          return new Response("Falha ao processar", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
