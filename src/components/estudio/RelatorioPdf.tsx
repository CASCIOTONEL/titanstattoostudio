import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const moeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBR = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR");

export function RelatorioPdfBotao({ mes }: { mes: string }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setGerando(true);
    setErro(null);
    try {
      const [ano, m] = mes.split("-").map(Number) as [number, number];
      const inicio = `${mes}-01`;
      const fim = new Date(ano, m, 0).toISOString().slice(0, 10);
      const [{ data: pgs, error: e1 }, { data: dps, error: e2 }] = await Promise.all([
        supabase.from("pagamentos").select("*").gte("data", inicio).lte("data", fim).order("data"),
        supabase.from("despesas").select("*").gte("data", inicio).lte("data", fim).order("data"),
      ]);
      if (e1 || e2) throw new Error((e1 ?? e2)!.message);
      const pagamentos = pgs ?? [];
      const despesas = dps ?? [];

      const receita = pagamentos.reduce((s, p) => s + Number(p.valor), 0);
      const comissao = pagamentos.reduce((s, p) => s + (Number(p.valor) * Number(p.comissao_percentual)) / 100, 0);
      const totalDesp = despesas.reduce((s, d) => s + Number(d.valor), 0);
      const lucro = receita - comissao - totalDesp;

      const porTat: Record<string, { r: number; c: number; q: number }> = {};
      pagamentos.forEach((p) => {
        const k = p.tatuador || "Sem tatuador";
        const a = (porTat[k] ??= { r: 0, c: 0, q: 0 });
        a.r += Number(p.valor);
        a.c += (Number(p.valor) * Number(p.comissao_percentual)) / 100;
        a.q += 1;
      });
      const porForma: Record<string, number> = {};
      pagamentos.forEach((p) => (porForma[p.forma] = (porForma[p.forma] ?? 0) + Number(p.valor)));
      const porCat: Record<string, number> = {};
      despesas.forEach((d) => (porCat[d.categoria] = (porCat[d.categoria] ?? 0) + Number(d.valor)));

      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      const nomeMes = new Date(ano, m - 1, 15).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      const head = { fillColor: [20, 20, 20] as [number, number, number], textColor: 255 };

      doc.setFontSize(18);
      doc.text("Titans Tattoo Studio", 14, 18);
      doc.setFontSize(12);
      doc.text(`Relatório financeiro - ${nomeMes}`, 14, 26);
      doc.setFontSize(9);
      doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 32);

      const ultimoY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      autoTable(doc, {
        startY: 38,
        head: [["Resumo", "Valor"]],
        body: [
          ["Receitas", moeda(receita)],
          ["Comissões dos tatuadores", `- ${moeda(comissao)}`],
          ["Despesas", `- ${moeda(totalDesp)}`],
          ["Lucro líquido", moeda(lucro)],
        ],
        headStyles: head,
        columnStyles: { 1: { halign: "right" } },
        didParseCell: (d) => { if (d.section === "body" && d.row.index === 3) d.cell.styles.fontStyle = "bold"; },
      });
      autoTable(doc, {
        startY: ultimoY(),
        head: [["Tatuador", "Atendimentos", "Receita", "Comissão"]],
        body: Object.entries(porTat).map(([k, v]) => [k, String(v.q), moeda(v.r), moeda(v.c)]),
        headStyles: head,
      });
      autoTable(doc, {
        startY: ultimoY(),
        head: [["Forma de pagamento", "Valor"]],
        body: Object.entries(porForma).map(([k, v]) => [k, moeda(v)]),
        headStyles: head,
      });
      autoTable(doc, {
        startY: ultimoY(),
        head: [["Categoria de despesa", "Valor"]],
        body: Object.entries(porCat).length ? Object.entries(porCat).map(([k, v]) => [k, moeda(v)]) : [["Sem despesas", "-"]],
        headStyles: head,
      });
      autoTable(doc, {
        startY: ultimoY(),
        head: [["Data", "Cliente", "Tatuador", "Forma", "Valor"]],
        body: pagamentos.map((p) => [dataBR(p.data), p.cliente_nome, p.tatuador ?? "-", p.forma, moeda(Number(p.valor))]),
        headStyles: head,
      });
      autoTable(doc, {
        startY: ultimoY(),
        head: [["Data", "Categoria", "Descrição", "Valor"]],
        body: despesas.map((d) => [dataBR(d.data), d.categoria, d.descricao ?? "-", moeda(Number(d.valor))]),
        headStyles: head,
      });
      doc.save(`relatorio-financeiro-titans-${mes}.pdf`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar o relatório.");
    }
    setGerando(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={gerar}
        disabled={gerando}
        className="border border-foreground/80 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {gerando ? "Gerando PDF..." : "Relatório do mês (PDF)"}
      </button>
      {erro ? <p role="alert" className="mt-2 text-sm text-destructive">{erro}</p> : null}
    </div>
  );
}
