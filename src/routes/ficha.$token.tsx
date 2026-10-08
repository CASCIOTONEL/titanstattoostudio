import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { PERGUNTAS_SAUDE, assinarFicha, buscarFicha } from "@/lib/fichas.functions";

export const Route = createFileRoute("/ficha/$token")({
  head: () => ({
    meta: [
      { title: "Ficha de anamnese — Titans Tattoo Studio" },
      { name: "description", content: "Ficha de saúde e termo de consentimento do Titans Tattoo Studio." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Ficha de anamnese — Titans Tattoo Studio" },
      { property: "og:description", content: "Preencha e assine sua ficha antes da sessão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FichaPage,
});

type Resp = { resposta: "sim" | "nao" | ""; detalhe: string };

function FichaPage() {
  const { token } = Route.useParams();
  const buscar = useServerFn(buscarFicha);
  const enviar = useServerFn(assinarFicha);
  const [estado, setEstado] = useState<string>("carregando");
  const [nome, setNome] = useState("");
  const [resp, setResp] = useState<Record<string, Resp>>(
    Object.fromEntries(PERGUNTAS_SAUDE.map((p) => [p.chave, { resposta: "", detalhe: "" }])),
  );
  const [obs, setObs] = useState("");
  const [aceites, setAceites] = useState({ proc: false, pol: false, lgpd: false, img: false });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [assinou, setAssinou] = useState(false);

  useEffect(() => {
    if (!/^[a-f0-9]{48}$/.test(token)) return setEstado("invalida");
    buscar({ data: { token } })
      .then((r) => {
        setEstado(r.estado);
        if (r.estado === "aberta") setNome(r.primeiroNome);
      })
      .catch(() => setEstado("invalida"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * e.currentTarget.width) / r.width, y: ((e.clientY - r.top) * e.currentTarget.height) / r.height };
  }
  function inicio(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    desenhando.current = true;
    const p = pos(e);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setAssinou(true);
  }
  function limpar() {
    const c = canvas.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    setAssinou(false);
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (Object.values(resp).some((r) => !r.resposta)) return setErro("Responda todas as perguntas de saúde.");
    if (!aceites.proc || !aceites.pol || !aceites.lgpd) return setErro("Marque os termos obrigatórios.");
    if (!assinou || !canvas.current) return setErro("Assine no quadro abaixo.");
    setEnviando(true);
    try {
      await enviar({
        data: {
          token,
          respostas: Object.fromEntries(
            Object.entries(resp).map(([k, v]) => [k, { resposta: v.resposta as "sim" | "nao", detalhe: v.detalhe.slice(0, 300) }]),
          ),
          observacoes: obs.slice(0, 1000),
          aceiteProcedimento: true,
          aceitePolitica: true,
          aceiteLgpd: true,
          aceiteImagem: aceites.img,
          assinatura: canvas.current.toDataURL("image/png"),
        },
      });
      setEstado("concluida");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar.");
    }
    setEnviando(false);
  }

  const mensagens: Record<string, string> = {
    carregando: "Carregando sua ficha...",
    invalida: "Link inválido. Peça um novo link ao estúdio.",
    expirada: "Este link expirou. Peça um novo ao estúdio.",
    assinada: "Esta ficha já foi assinada. Obrigado!",
    concluida: "Ficha assinada com sucesso! Nos vemos na sessão.",
  };

  return (
    <Section>
      <SectionTitle eyebrow="Titans Tattoo Studio" title="Ficha de anamnese" description={nome ? `Olá, ${nome}. Preencha com atenção antes da sua sessão.` : "Preencha com atenção antes da sua sessão."} />
      {estado !== "aberta" ? (
        <p className="mt-10 text-sm text-muted-foreground">{mensagens[estado]}</p>
      ) : (
        <form onSubmit={submeter} className="mt-10 space-y-8">
          <div className="space-y-5 border border-border bg-card/30 p-6">
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Saúde</h3>
            {PERGUNTAS_SAUDE.map((p) => (
              <div key={p.chave}>
                <p className="text-sm text-foreground">{p.rotulo}</p>
                <div className="mt-2 flex gap-2">
                  {(["nao", "sim"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setResp((r) => ({ ...r, [p.chave]: { ...r[p.chave]!, resposta: v } }))}
                      className={"border px-4 py-2 text-[11px] uppercase tracking-[0.16em] " + (resp[p.chave]?.resposta === v ? "border-foreground text-foreground" : "border-border text-muted-foreground")}
                    >
                      {v === "sim" ? "Sim" : "Não"}
                    </button>
                  ))}
                </div>
                {resp[p.chave]?.resposta === "sim" ? (
                  <input
                    placeholder="Explique, por favor"
                    maxLength={300}
                    value={resp[p.chave]?.detalhe ?? ""}
                    onChange={(e) => setResp((r) => ({ ...r, [p.chave]: { ...r[p.chave]!, detalhe: e.target.value } }))}
                    className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm"
                  />
                ) : null}
              </div>
            ))}
            <label className="block text-sm">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Outras observações</span>
              <textarea rows={3} maxLength={1000} value={obs} onChange={(e) => setObs(e.target.value)} className="mt-2 w-full border border-border bg-background px-3 py-2" />
            </label>
          </div>

          <div className="space-y-4 border border-border bg-card/30 p-6 text-sm text-muted-foreground">
            <h3 className="text-sm uppercase tracking-[0.2em]">Termos</h3>
            {[
              { k: "proc", t: "Declaro que as informações acima são verdadeiras e autorizo a realização do procedimento, ciente dos riscos e dos cuidados necessários. (obrigatório)" },
              { k: "pol", t: "Estou ciente da política de sinal e cancelamento: o sinal garante o horário e não é devolvido em caso de falta ou cancelamento com menos de 48h; pode ser usado em um reagendamento. (obrigatório)" },
              { k: "lgpd", t: "Autorizo o estúdio a guardar meus dados e esta ficha para fins de atendimento, conforme a LGPD. (obrigatório)" },
              { k: "img", t: "Autorizo o uso de fotos do meu trabalho nas redes e no portfólio do estúdio. (opcional)" },
            ].map((a) => (
              <label key={a.k} className="flex gap-3">
                <input type="checkbox" checked={aceites[a.k as keyof typeof aceites]} onChange={(e) => setAceites((s) => ({ ...s, [a.k]: e.target.checked }))} className="mt-1" />
                <span>{a.t}</span>
              </label>
            ))}
          </div>

          <div className="border border-border bg-card/30 p-6">
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Assinatura</h3>
            <canvas
              ref={canvas}
              width={800}
              height={250}
              onPointerDown={inicio}
              onPointerMove={mover}
              onPointerUp={() => (desenhando.current = false)}
              className="mt-4 w-full touch-none rounded-sm bg-foreground"
            />
            <button type="button" onClick={limpar} className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline">
              Limpar assinatura
            </button>
          </div>

          {erro ? <p role="alert" className="text-sm text-destructive">{erro}</p> : null}
          <button type="submit" disabled={enviando} className="border border-foreground/80 px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background disabled:opacity-50">
            {enviando ? "Enviando..." : "Assinar e enviar"}
          </button>
        </form>
      )}
    </Section>
  );
}
