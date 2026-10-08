import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PERGUNTAS_SAUDE } from "@/lib/fichas.functions";
import { artists } from "@/lib/studio";

type Ficha = {
  id: string;
  token: string;
  expira_em: string;
  assinada_em: string | null;
  assinatura_path: string | null;
  respostas: Record<string, { resposta?: string; detalhe?: string } | string>;
  aceite_imagem: boolean;
  created_at: string;
};
type Foto = { id: string; path: string; tipo: string; tatuador: string | null; data: string; legenda: string | null; url?: string };

const btn = "border border-border px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50";

function digitos(v: string) {
  const d = v.replace(/\D/g, "");
  return d.startsWith("55") ? d : `55${d}`;
}

export function ClienteExtras({ clienteId, nome, whatsapp, ehMaster }: { clienteId: string; nome: string; whatsapp: string; ehMaster: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [tipo, setTipo] = useState("depois");
  const [tatuador, setTatuador] = useState("");
  const [ampliada, setAmpliada] = useState<string | null>(null);
  const [assinaturaUrl, setAssinaturaUrl] = useState<Record<string, string>>({});

  async function carregar() {
    const [{ data: fs }, { data: ft }] = await Promise.all([
      supabase.from("fichas_anamnese").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false }),
      supabase.from("cliente_fotos").select("*").eq("cliente_id", clienteId).order("data", { ascending: false }),
    ]);
    const lista = (fs ?? []) as unknown as Ficha[];
    setFichas(lista);
    const assinadas = lista.filter((f) => f.assinatura_path);
    if (assinadas.length) {
      const { data } = await supabase.storage.from("assinaturas").createSignedUrls(assinadas.map((f) => f.assinatura_path!), 3600);
      const m: Record<string, string> = {};
      data?.forEach((d, i) => d.signedUrl && (m[assinadas[i]!.id] = d.signedUrl));
      setAssinaturaUrl(m);
    }
    const fl = (ft ?? []) as Foto[];
    if (fl.length) {
      const { data } = await supabase.storage.from("trabalhos").createSignedUrls(fl.map((f) => f.path), 3600);
      fl.forEach((f, i) => (f.url = data?.[i]?.signedUrl ?? undefined));
    }
    setFotos(fl);
  }

  useEffect(() => {
    if (aberto) void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  async function gerarFicha() {
    setErro(null);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("fichas_anamnese").insert({ cliente_id: clienteId, criado_por: u.user?.id }).select("token").single();
    if (error || !data) return setErro(error?.message ?? "Erro ao gerar ficha.");
    const link = `${window.location.origin}/ficha/${data.token}`;
    window.open(`https://wa.me/${digitos(whatsapp)}?text=${encodeURIComponent(`Olá ${nome.split(" ")[0]}, aqui é do Titans Tattoo Studio. Antes da sua sessão, preencha e assine sua ficha: ${link}`)}`, "_blank");
    await carregar();
  }

  async function enviarFotos(files: FileList | null) {
    if (!files?.length) return;
    setEnviando(true);
    setErro(null);
    const { data: u } = await supabase.auth.getUser();
    for (const file of Array.from(files).slice(0, 10)) {
      if (!file.type.startsWith("image/")) continue;
      const path = `${clienteId}/${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
      const { error: e1 } = await supabase.storage.from("trabalhos").upload(path, file, { contentType: file.type });
      if (e1) { setErro(e1.message); continue; }
      await supabase.from("cliente_fotos").insert({ cliente_id: clienteId, path, tipo, tatuador: tatuador || null, enviado_por: u.user?.id });
    }
    setEnviando(false);
    await carregar();
  }

  async function excluirFoto(f: Foto) {
    if (!confirm("Excluir esta foto?")) return;
    await supabase.storage.from("trabalhos").remove([f.path]);
    await supabase.from("cliente_fotos").delete().eq("id", f.id);
    await carregar();
  }

  function imprimir(f: Ficha) {
    const linhas = PERGUNTAS_SAUDE.map((p) => {
      const r = f.respostas[p.chave];
      const o = typeof r === "object" ? r : {};
      return `<tr><td>${p.rotulo}</td><td>${o.resposta === "sim" ? "Sim" : "Não"} ${o.detalhe ? "— " + o.detalhe.replace(/</g, "&lt;") : ""}</td></tr>`;
    }).join("");
    const obs = typeof f.respostas.observacoes === "string" ? f.respostas.observacoes.replace(/</g, "&lt;") : "";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Ficha ${nome}</title><style>body{font-family:sans-serif;padding:24px}td{border:1px solid #ccc;padding:6px}table{border-collapse:collapse;width:100%}</style></head><body><h2>Titans Tattoo Studio — Ficha de anamnese</h2><p><b>Cliente:</b> ${nome.replace(/</g, "&lt;")}<br/><b>Assinada em:</b> ${f.assinada_em ? new Date(f.assinada_em).toLocaleString("pt-BR") : "-"}</p><table>${linhas}</table><p><b>Observações:</b> ${obs}</p><p>Termos aceitos: procedimento, política de sinal/cancelamento, LGPD. Uso de imagem: ${f.aceite_imagem ? "autorizado" : "não autorizado"}.</p>${assinaturaUrl[f.id] ? `<img src="${assinaturaUrl[f.id]}" style="max-width:400px;border-bottom:1px solid #000"/>` : ""}<script>setTimeout(()=>print(),600)</script></body></html>`);
    w.document.close();
  }

  return (
    <div className="mt-5 border-t border-border pt-4">
      <button type="button" className={btn} onClick={() => setAberto((a) => !a)}>
        {aberto ? "Fechar ficha e fotos" : "Ficha de anamnese e fotos"}
      </button>
      {aberto ? (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Fichas</h4>
              <button type="button" className={btn} onClick={gerarFicha}>Gerar ficha e enviar</button>
            </div>
            {fichas.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhuma ficha ainda.</p> : (
              <ul className="mt-3 space-y-2 text-sm">
                {fichas.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 border border-border px-3 py-2">
                    <span className="text-muted-foreground">
                      {f.assinada_em ? `Assinada em ${new Date(f.assinada_em).toLocaleString("pt-BR")}` : new Date(f.expira_em) < new Date() ? "Link expirado" : "Aguardando assinatura"}
                    </span>
                    {f.assinada_em ? (
                      <button type="button" className={btn} onClick={() => imprimir(f)}>Ver / imprimir</button>
                    ) : (
                      <button type="button" className={btn} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/ficha/${f.token}`)}>Copiar link</button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Trabalhos realizados</h4>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border border-border bg-background px-3 py-2 text-xs">
                <option value="antes">Antes</option>
                <option value="depois">Depois</option>
              </select>
              <select value={tatuador} onChange={(e) => setTatuador(e.target.value)} className="border border-border bg-background px-3 py-2 text-xs">
                <option value="">Tatuador</option>
                {artists.map((a) => <option key={a.name} value={a.name}>{a.name}</option>)}
              </select>
              <label className={btn + " cursor-pointer"}>
                {enviando ? "Enviando..." : "Enviar fotos"}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => void enviarFotos(e.target.files)} />
              </label>
            </div>
            {fotos.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhuma foto ainda.</p> : (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {fotos.map((f) => (
                  <figure key={f.id} className="relative">
                    <button type="button" onClick={() => f.url && setAmpliada(f.url)} className="block w-full">
                      <img src={f.url} alt={`Trabalho ${f.tipo}`} className="aspect-square w-full object-cover" />
                    </button>
                    <figcaption className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {f.tipo} · {new Date(`${f.data}T12:00:00`).toLocaleDateString("pt-BR")}{f.tatuador ? ` · ${f.tatuador}` : ""}
                    </figcaption>
                    {ehMaster ? (
                      <button type="button" onClick={() => excluirFoto(f)} className="absolute right-1 top-1 bg-background/80 px-2 text-xs text-destructive">×</button>
                    ) : null}
                  </figure>
                ))}
              </div>
            )}
          </div>
          {erro ? <p role="alert" className="text-sm text-destructive">{erro}</p> : null}
        </div>
      ) : null}
      {ampliada ? (
        <button type="button" onClick={() => setAmpliada(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6">
          <img src={ampliada} alt="Trabalho ampliado" className="max-h-full max-w-full object-contain" />
        </button>
      ) : null}
    </div>
  );
}
