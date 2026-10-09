import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/whatsapp";

function digitos(v: string) {
  return v.replace(/\D/g, "");
}

function numeroCompleto(v: string) {
  const n = digitos(v);
  return n.startsWith("55") ? n : `55${n}`;
}

/** Data de hoje (MM-DD e ano) no fuso de Brasília. */
function hojeBrasil() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [ano, mes, dia] = partes.split("-");
  return { ano: Number(ano), md: `${mes}-${dia}` };
}

export const Route = createFileRoute("/api/public/hooks/aniversariantes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: segredo } = await supabaseAdmin
          .from("rotina_tokens")
          .select("token")
          .eq("nome", "aniversarios")
          .maybeSingle();
        if (!segredo || segredo.token !== token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const whatsappKey = process.env["WHATSAPP_API_KEY"];
        if (!lovableKey || !whatsappKey) {
          return new Response("WhatsApp não configurado", { status: 500 });
        }

        const { ano, md } = hojeBrasil();
        const [{ data: clientes }, { data: leads }] = await Promise.all([
          supabaseAdmin.from("clientes").select("nome, whatsapp, nascimento").not("nascimento", "is", null),
          supabaseAdmin.from("leads").select("nome, whatsapp, nascimento").not("nascimento", "is", null),
        ]);

        const mapa = new Map<string, string>();
        for (const c of [...(leads ?? []), ...(clientes ?? [])]) {
          if (!c.nascimento || c.nascimento.slice(5, 10) !== md) continue;
          const num = digitos(c.whatsapp);
          if (num.length < 10) continue;
          mapa.set(numeroCompleto(c.whatsapp), c.nome);
        }

        let enviados = 0;
        let falhas = 0;
        for (const [whatsapp, nome] of mapa) {
          // Reserva o envio do ano: impede mensagem repetida.
          const { data: reservado } = await supabaseAdmin
            .from("envios_aniversario")
            .insert({ ano, whatsapp, nome })
            .select("id")
            .maybeSingle();
          if (!reservado) continue;

          const primeiro = nome.trim().split(" ")[0];
          const texto = `Parabéns, ${primeiro}! 🤘🎉\n\nUm feliz aniversário de todo mundo aqui do Titans Tattoo! Que seu ano seja formidável.\n\nPra comemorar contigo: durante todo o mês do seu aniversário, preparamos **20% de desconto** pra você marcar essa nova fase na pele com qualquer profissional da casa.\n\nCurte muito seu dia, e conta com a gente quando der aquela vontade de rabiscar de novo!`;
          try {
            const resp = await fetch(`${GATEWAY_URL}/messages`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableKey}`,
                "X-Connection-Api-Key": whatsappKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: whatsapp,
                type: "text",
                text: { body: texto },
              }),
            });
            const corpo = await resp.text();
            if (!resp.ok) throw new Error(`[${resp.status}] ${corpo.slice(0, 500)}`);
            const id = (JSON.parse(corpo) as { messages?: { id?: string }[] }).messages?.[0]?.id ?? null;
            await supabaseAdmin
              .from("envios_aniversario")
              .update({ status: "enviado", provider_id: id })
              .eq("id", reservado.id);
            enviados++;
          } catch (e) {
            falhas++;
            console.error("Falha no parabéns", e);
            await supabaseAdmin
              .from("envios_aniversario")
              .update({ status: "falhou", erro: e instanceof Error ? e.message : String(e) })
              .eq("id", reservado.id);
          }
        }

        return Response.json({ aniversariantes: mapa.size, enviados, falhas });
      },
    },
  },
});
