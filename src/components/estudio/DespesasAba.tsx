import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIAS = ["Materiais", "Tintas", "Aluguel", "Internet/luz", "Taxas de máquina", "Marketing", "Impostos", "Outros"];
const FORMAS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Boleto", "Transferência"];

type Despesa = { id: string; data: string; categoria: string; descricao: string | null; valor: number; forma: string | null };

const moeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const campo = "mt-2 w-full border border-border bg-background px-3 py-2 text-sm";
const rot = "text-[11px] uppercase tracking-[0.2em] text-muted-foreground";

export function DespesasAba({ mes, recebido, comissao }: { mes: string; recebido: number; comissao: number }) {
  const [lista, setLista] = useState<Despesa[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [f, setF] = useState({ data: new Date().toISOString().slice(0, 10), categoria: CATEGORIAS[0]!, descricao: "", valor: "", forma: FORMAS[0]! });

  useEffect(() => {
    supabase.from("despesas").select("*").order("data", { ascending: false }).then(({ data, error }) => {
      if (error) setErro(error.message);
      else setLista((data ?? []) as Despesa[]);
    });
  }, []);

  const doMes = useMemo(() => lista.filter((d) => d.data.startsWith(mes)), [lista, mes]);
  const total = doMes.reduce((s, d) => s + Number(d.valor), 0);
  const porCategoria = useMemo(() => {
    const m: Record<string, number> = {};
    doMes.forEach((d) => (m[d.categoria] = (m[d.categoria] ?? 0) + Number(d.valor)));
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [doMes]);
  const lucro = recebido - comissao - total;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const valor = Number(f.valor.replace(",", "."));
    if (!(valor > 0) || valor > 1_000_000) return setErro("Informe um valor válido.");
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("despesas")
      .insert({ data: f.data, categoria: f.categoria, descricao: f.descricao.trim().slice(0, 300) || null, valor, forma: f.forma, registrado_por: u.user?.id })
      .select()
      .single();
    if (error) return setErro(error.message);
    setLista((l) => [data as Despesa, ...l]);
    setF((x) => ({ ...x, descricao: "", valor: "" }));
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta despesa?")) return;
    const { error } = await supabase.from("despesas").delete().eq("id", id);
    if (error) setErro(error.message);
    else setLista((l) => l.filter((d) => d.id !== id));
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Recebido", moeda(recebido)],
          ["Comissões", "− " + moeda(comissao)],
          ["Despesas", "− " + moeda(total)],
          ["Lucro líquido", moeda(lucro)],
        ].map(([r, v]) => (
          <div key={r} className="border border-border bg-card/30 p-5">
            <p className={rot}>{r}</p>
            <p className={"mt-2 text-2xl " + (r === "Lucro líquido" && lucro < 0 ? "text-destructive" : "text-foreground")}>{v}</p>
          </div>
        ))}
      </div>

      <form onSubmit={salvar} className="grid gap-4 border border-border bg-card/30 p-6 sm:grid-cols-5">
        <label className="block"><span className={rot}>Data</span><input type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} className={campo} /></label>
        <label className="block"><span className={rot}>Categoria</span><select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} className={campo}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="block"><span className={rot}>Descrição</span><input value={f.descricao} maxLength={300} onChange={(e) => setF({ ...f, descricao: e.target.value })} className={campo} /></label>
        <label className="block"><span className={rot}>Valor (R$)</span><input inputMode="decimal" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} className={campo} required /></label>
        <label className="block"><span className={rot}>Forma</span><select value={f.forma} onChange={(e) => setF({ ...f, forma: e.target.value })} className={campo}>{FORMAS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <div className="sm:col-span-5"><button type="submit" className="border border-foreground/80 px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background">Registrar despesa</button></div>
        {erro ? <p role="alert" className="text-sm text-destructive sm:col-span-5">{erro}</p> : null}
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-border bg-card/30 p-5">
          <p className={rot}>Por categoria no mês</p>
          {porCategoria.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Sem despesas no mês.</p> : (
            <ul className="mt-3 space-y-2 text-sm">{porCategoria.map(([c, v]) => <li key={c} className="flex justify-between"><span className="text-muted-foreground">{c}</span><span>{moeda(v)}</span></li>)}</ul>
          )}
        </div>
        <div className="overflow-x-auto lg:col-span-2">
          <table className="w-full text-sm">
            <thead><tr className={rot + " text-left"}><th className="py-2">Data</th><th>Categoria</th><th>Descrição</th><th>Forma</th><th className="text-right">Valor</th><th /></tr></thead>
            <tbody>
              {doMes.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="py-2">{new Date(`${d.data}T12:00:00`).toLocaleDateString("pt-BR")}</td>
                  <td>{d.categoria}</td><td className="text-muted-foreground">{d.descricao ?? "—"}</td><td>{d.forma ?? "—"}</td>
                  <td className="text-right">{moeda(Number(d.valor))}</td>
                  <td className="text-right"><button type="button" onClick={() => excluir(d.id)} className="text-xs text-destructive">Excluir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
