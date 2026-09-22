import { encryptConnectionKey, decryptConnectionKey } from "@/lib/connectionKeyCrypto.server";

const TATUADORES = ["Cascio", "Ricardo", "Braian"] as const;

export async function saveConnectionKeyForUser(
  userId: string,
  connectorId: string,
  connectionAPIKey: string,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("app_user_connections").upsert(
    {
      user_id: userId,
      connector_id: connectorId,
      connection_key_ciphertext: encryptConnectionKey(connectionAPIKey),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,connector_id" },
  );
  if (error) throw new Error(error.message);
}

export async function getConnectionKeyForUser(userId: string, connectorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("app_user_connections")
    .select("connection_key_ciphertext")
    .eq("user_id", userId)
    .eq("connector_id", connectorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? decryptConnectionKey(data.connection_key_ciphertext) : null;
}

export async function deleteConnectionForUser(userId: string, connectorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("app_user_connections")
    .delete()
    .eq("user_id", userId)
    .eq("connector_id", connectorId);
  if (error) throw new Error(error.message);
}

/** Tatuadores com perfil ativo e (opcionalmente) com agenda conectada. */
export async function listarTatuadoresComConexao(connectorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: perfis, error: e1 }, { data: conexoes, error: e2 }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, tatuador, ativo").not("tatuador", "is", null),
    supabaseAdmin
      .from("app_user_connections")
      .select("user_id, connection_key_ciphertext")
      .eq("connector_id", connectorId),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  const mapa = new Map((conexoes ?? []).map((c: any) => [c.user_id, c.connection_key_ciphertext]));
  const perfisAtivos = (perfis ?? []).filter((p: any) => p.ativo);

  return TATUADORES.map((tatuador) => {
    const perfil = perfisAtivos.find((p: any) => p.tatuador === tatuador);
    const ciphertext = perfil ? mapa.get(perfil.id) : null;
    return {
      userId: perfil?.id as string | undefined,
      tatuador,
      connectionAPIKey: typeof ciphertext === "string" ? decryptConnectionKey(ciphertext) : null,
    };
  });
}
