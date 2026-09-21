import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const PAPEIS = ["master", "recepcao", "financeiro", "tatuador"] as const;
export type Papel = (typeof PAPEIS)[number];

export const ROTULO_PAPEL: Record<Papel, string> = {
  master: "Master (acesso total)",
  recepcao: "Recepção",
  financeiro: "Financeiro",
  tatuador: "Tatuador",
};

const papelSchema = z.enum(PAPEIS);

async function assertMaster(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "master")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Apenas o usuário master pode gerenciar a equipe.");
}

export type MembroEquipe = {
  id: string;
  nome: string | null;
  email: string | null;
  ativo: boolean;
  tatuador: string | null;
  papeis: Papel[];
};

export const meusPapeis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Papel[]> => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: { role: Papel }) => r.role);
  });

export const listarEquipe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MembroEquipe[]> => {
    await assertMaster(context.supabase, context.userId);
    const [{ data: perfis, error: e1 }, { data: papeis, error: e2 }] = await Promise.all([
      context.supabase.from("profiles").select("id, nome, email, ativo").order("created_at"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    return (perfis ?? []).map((p: any) => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      ativo: p.ativo,
      papeis: (papeis ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role as Papel),
    }));
  });

export const criarUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        nome: z.string().trim().min(2, "Informe o nome."),
        email: z.string().trim().email("E-mail inválido."),
        senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
        papeis: z.array(papelSchema).min(1, "Selecione ao menos uma permissão."),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertMaster(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
      user_metadata: { nome: data.nome },
    });
    if (error) throw new Error(error.message);
    const novoId = created.user!.id;

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: novoId, nome: data.nome, email: data.email, ativo: true });
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert(data.papeis.map((role) => ({ user_id: novoId, role })));
    if (roleError) throw new Error(roleError.message);

    return { id: novoId };
  });

export const definirPapeis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ userId: z.string().uuid(), papeis: z.array(papelSchema) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertMaster(context.supabase, context.userId);
    if (data.userId === context.userId && !data.papeis.includes("master")) {
      throw new Error("Você não pode remover o seu próprio acesso master.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: delError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    if (delError) throw new Error(delError.message);
    if (data.papeis.length > 0) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert(data.papeis.map((role) => ({ user_id: data.userId, role })));
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const definirAtivo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ userId: z.string().uuid(), ativo: z.boolean() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertMaster(context.supabase, context.userId);
    if (data.userId === context.userId && !data.ativo) {
      throw new Error("Você não pode desativar o seu próprio acesso.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ ativo: data.ativo })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const redefinirSenha = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        userId: z.string().uuid(),
        senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertMaster(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.senha,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removerUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await assertMaster(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("Você não pode excluir o seu próprio acesso.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const NOMES_TATUADORES = ["Cascio", "Ricardo", "Braian"] as const;

export type MeuAcesso = { papeis: Papel[]; tatuador: string | null };

export const meuAcesso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MeuAcesso> => {
    const [{ data: papeis, error: e1 }, { data: perfil, error: e2 }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("profiles").select("tatuador").eq("id", context.userId).maybeSingle(),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    return {
      papeis: (papeis ?? []).map((r: { role: Papel }) => r.role),
      tatuador: (perfil as { tatuador: string | null } | null)?.tatuador ?? null,
    };
  });

export const definirTatuador = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({ userId: z.string().uuid(), tatuador: z.string().trim().max(60).nullable() })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertMaster(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ tatuador: data.tatuador || null })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
