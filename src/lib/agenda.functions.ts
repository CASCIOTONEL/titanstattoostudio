import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  appUserReconnectRequired,
  authorizeAppUserOAuth,
  callAsAppUser,
  disconnectAppUser,
  exchangeAppUserOAuthCode,
} from "@/integrations/lovable/appUserConnector";
import {
  deleteConnectionForUser,
  getConnectionKeyForUser,
  listarTatuadoresComConexao,
  saveConnectionKeyForUser,
} from "@/lib/appUserConnections.server";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
export const CONNECTOR_ID = "google_calendar";
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar",
];

export type EventoAgenda = {
  id: string;
  tatuador: string;
  titulo: string;
  inicio: string;
  fim: string;
  diaInteiro: boolean;
};

export type AgendaStatus = {
  tatuador: string | null;
  podeVerTodos: boolean;
  conectado: boolean;
  reconectar: boolean;
  tatuadores: { tatuador: string; conectado: boolean }[];
};

async function perfilDoUsuario(supabase: any, userId: string) {
  const [{ data: papeis, error: e1 }, { data: perfil, error: e2 }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("profiles").select("tatuador").eq("id", userId).maybeSingle(),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  const lista: string[] = (papeis ?? []).map((r: { role: string }) => r.role);
  return {
    papeis: lista,
    tatuador: (perfil?.tatuador as string | null) ?? null,
    podeVerTodos: lista.includes("master") || lista.includes("recepcao"),
  };
}

export const statusAgenda = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AgendaStatus> => {
    const perfil = await perfilDoUsuario(context.supabase, context.userId);
    const minhaChave = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    let tatuadores: { tatuador: string; conectado: boolean }[] = [];
    if (perfil.podeVerTodos) {
      const todos = await listarTatuadoresComConexao(CONNECTOR_ID);
      tatuadores = todos.map((t) => ({ tatuador: t.tatuador, conectado: !!t.connectionAPIKey }));
    } else if (perfil.tatuador) {
      tatuadores = [{ tatuador: perfil.tatuador, conectado: !!minhaChave }];
    }
    return {
      tatuador: perfil.tatuador,
      podeVerTodos: perfil.podeVerTodos,
      conectado: !!minhaChave,
      reconectar: false,
      tatuadores,
    };
  });

export const iniciarConexaoGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientKey = process.env['GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY'];
    if (!clientKey) throw new Error("A conexão com o Google Agenda ainda não está configurada.");
    const request = getRequest();
    if (!request) throw new Error("A conexão precisa começar por uma página do site.");
    const url = new URL(request.url);
    const sandboxHost =
      url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL(
      "/oauth/google-calendar/return",
      sandboxHost ? `https://${sandboxHost}` : url.origin,
    ).toString();

    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey: clientKey,
      returnUrl,
      ...(connectionAPIKey ? { connectionAPIKey } : {}),
      credentialsConfiguration: { scopes: GOOGLE_SCOPES },
    });
    return { authorizationUrl };
  });

export const concluirConexaoGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ code: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      data.code,
    );
    if (connectorId !== CONNECTOR_ID) throw new Error("Conexão retornou o serviço errado.");
    await saveConnectionKeyForUser(context.userId, connectorId, connectionAPIKey);
    return { ok: true };
  });

export const desconectarGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const chave = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (chave) {
      await disconnectAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey: chave,
        connectorId: CONNECTOR_ID,
      });
      await deleteConnectionForUser(context.userId, CONNECTOR_ID);
    }
    return { ok: true };
  });

type Alvo = { tatuador: string; connectionAPIKey: string | null };

async function alvosVisiveis(supabase: any, userId: string): Promise<Alvo[]> {
  const perfil = await perfilDoUsuario(supabase, userId);
  if (perfil.podeVerTodos) {
    const todos = await listarTatuadoresComConexao(CONNECTOR_ID);
    return todos.map((t) => ({ tatuador: t.tatuador, connectionAPIKey: t.connectionAPIKey }));
  }
  if (!perfil.tatuador) return [];
  const chave = await getConnectionKeyForUser(userId, CONNECTOR_ID);
  return [{ tatuador: perfil.tatuador, connectionAPIKey: chave }];
}

export const listarEventos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ inicio: z.string().min(1), fim: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const alvos = await alvosVisiveis(context.supabase, context.userId);
    const eventos: EventoAgenda[] = [];
    const precisamReconectar: string[] = [];

    await Promise.all(
      alvos
        .filter((a) => a.connectionAPIKey)
        .map(async (alvo) => {
          const params = new URLSearchParams({
            timeMin: data.inicio,
            timeMax: data.fim,
            singleEvents: "true",
            orderBy: "startTime",
            maxResults: "250",
          });
          if (!alvo.connectionAPIKey) return;
          const res = await callAsAppUser({
            gatewayBaseUrl: GATEWAY_BASE_URL,
            connectionAPIKey: alvo.connectionAPIKey,
            connectorId: CONNECTOR_ID,
            path: `/calendar/v3/calendars/primary/events?${params.toString()}`,
            requiredScopes: GOOGLE_SCOPES,
          });
          if (await appUserReconnectRequired(res)) {
            precisamReconectar.push(alvo.tatuador);
            return;
          }
          if (!res.ok) {
            const corpo = await res.text();
            console.error(`Google Agenda falhou [${res.status}]: ${corpo}`);
            throw new Error(`Não foi possível ler a agenda de ${alvo.tatuador}.`);
          }
          const body = (await res.json()) as { items?: any[] };
          for (const item of body.items ?? []) {
            if (item.status === "cancelled") continue;
            const diaInteiro = !!item.start?.date;
            eventos.push({
              id: String(item.id),
              tatuador: alvo.tatuador,
              titulo: item.summary ?? "(sem título)",
              inicio: item.start?.dateTime ?? item.start?.date,
              fim: item.end?.dateTime ?? item.end?.date,
              diaInteiro,
            });
          }
        }),
    );

    eventos.sort((a, b) => a.inicio.localeCompare(b.inicio));
    return { eventos, precisamReconectar };
  });

export const criarEvento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        tatuador: z.string().min(1),
        titulo: z.string().trim().min(2).max(160),
        inicio: z.string().min(1),
        fim: z.string().min(1),
        descricao: z.string().trim().max(2000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const alvos = await alvosVisiveis(context.supabase, context.userId);
    const alvo = alvos.find((a) => a.tatuador === data.tatuador);
    if (!alvo) throw new Error("Você não pode agendar para esse tatuador.");
    if (!alvo.connectionAPIKey) throw new Error(`${data.tatuador} ainda não conectou o Google Agenda.`);

    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey: alvo.connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: "/calendar/v3/calendars/primary/events",
      requiredScopes: GOOGLE_SCOPES,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: data.titulo,
          description: data.descricao || undefined,
          start: { dateTime: data.inicio, timeZone: "America/Sao_Paulo" },
          end: { dateTime: data.fim, timeZone: "America/Sao_Paulo" },
        }),
      },
    });
    if (await appUserReconnectRequired(res)) {
      return { ok: false, reconectar: true } as const;
    }
    if (!res.ok) {
      const corpo = await res.text();
      console.error(`Criação no Google Agenda falhou [${res.status}]: ${corpo}`);
      throw new Error("Não foi possível criar o agendamento no Google Agenda.");
    }
    return { ok: true, reconectar: false } as const;
  });
