import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import planilha from "@/data/clientes-planilha.json";

type LinhaPlanilha = {
  nome: string;
  whatsapp: string;
  email: string | null;
  documento: string | null;
  nascimento: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  origem: string | null;
  observacoes: string | null;
};

function chave(nome: string, whatsapp: string) {
  return `${nome.trim().toLowerCase()}|${whatsapp.replace(/\D/g, "")}`;
}

export type ResultadoImportacao = {
  total: number;
  inseridos: number;
  jaExistiam: number;
};

export const importarClientesPlanilha = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ResultadoImportacao> => {
    const { data: master, error: erroPapel } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "master")
      .maybeSingle();
    if (erroPapel) throw new Error(erroPapel.message);
    if (!master) throw new Error("Apenas o usuário master pode importar a base de clientes.");

    const linhas = planilha as LinhaPlanilha[];

    const { data: existentes, error: erroLista } = await context.supabase
      .from("clientes")
      .select("nome, whatsapp");
    if (erroLista) throw new Error(erroLista.message);

    const jaTem = new Set((existentes ?? []).map((c: any) => chave(c.nome ?? "", c.whatsapp ?? "")));

    const novos = linhas
      .filter((l) => l.nome && !jaTem.has(chave(l.nome, l.whatsapp ?? "")))
      .map((l) => ({
        nome: l.nome,
        whatsapp: l.whatsapp || "sem telefone",
        email: l.email,
        documento: l.documento,
        nascimento: l.nascimento,
        endereco: l.endereco,
        cidade: l.cidade,
        estado: l.estado,
        origem: l.origem,
        observacoes: l.observacoes,
      }));

    let inseridos = 0;
    for (let i = 0; i < novos.length; i += 100) {
      const lote = novos.slice(i, i + 100);
      const { error } = await context.supabase.from("clientes").insert(lote);
      if (error) throw new Error(error.message);
      inseridos += lote.length;
    }

    return { total: linhas.length, inseridos, jaExistiam: linhas.length - novos.length };
  });
