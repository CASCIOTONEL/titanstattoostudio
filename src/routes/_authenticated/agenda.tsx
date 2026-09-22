import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionTitle } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import {
  concluirConexaoGoogle,
  criarEvento,
  desconectarGoogle,
  iniciarConexaoGoogle,
  listarEventos,
  statusAgenda,
  type AgendaStatus,
  type EventoAgenda,
} from "@/lib/agenda.functions";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Titans Tattoo Studio" },
      {
        name: "description",
        content: "Agenda única do estúdio com os horários dos tatuadores conectados ao Google Agenda.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Agenda — Titans Tattoo Studio" },
      { property: "og:description", content: "Agenda interna do Titans Tattoo Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgendaPage,
});

const btn =
  "border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground";
const btnForte =
  "border border-foreground/80 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-40";
const campo = "w-full border border-border bg-transparent px-4 py-3 text-sm";
const HORA_INICIAL = 8;
const HORA_FINAL = 21;
const ALTURA_HORA = 64;

const coresTatuador: Record<string, { fundo: string; texto: string; ponto: string }> = {
  Cascio: {
    fundo: "bg-artist-cascio",
    texto: "text-artist-cascio-foreground",
    ponto: "bg-artist-cascio",
  },
  Ricardo: {
    fundo: "bg-artist-ricardo",
    texto: "text-artist-ricardo-foreground",
    ponto: "bg-artist-ricardo",
  },
  Braian: {
    fundo: "bg-artist-braian",
    texto: "text-artist-braian-foreground",
    ponto: "bg-artist-braian",
  },
};

const corPadrao = {
  fundo: "bg-secondary",
  texto: "text-secondary-foreground",
  ponto: "bg-muted-foreground",
};

const faixaTatuador: Record<string, string> = {
  Cascio: "left-1 right-[67%]",
  Ricardo: "left-[34%] right-[34%]",
  Braian: "left-[67%] right-1",
};

function corDoTatuador(nome: string) {
  return coresTatuador[nome] ?? corPadrao;
}

function inicioSemana(d: Date) {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dia = (base.getDay() + 6) % 7;
  base.setDate(base.getDate() - dia);
  return base;
}

const fmtDia = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });

const fmtHora = (iso: string, diaInteiro: boolean) =>
  diaInteiro
    ? "Dia inteiro"
    : new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const fmtIntervalo = (evento: EventoAgenda) =>
  evento.diaInteiro
    ? "Dia inteiro"
    : `${fmtHora(evento.inicio, false)}–${fmtHora(evento.fim, false)}`;

function posicaoEvento(evento: EventoAgenda) {
  const inicio = new Date(evento.inicio);
  const fim = new Date(evento.fim);
  const inicioEmMinutos = inicio.getHours() * 60 + inicio.getMinutes();
  const fimEmMinutos = fim.getHours() * 60 + fim.getMinutes();
  const limiteInicial = HORA_INICIAL * 60;
  const limiteFinal = HORA_FINAL * 60;
  const inicioVisivel = Math.max(inicioEmMinutos, limiteInicial);
  const fimVisivel = Math.min(Math.max(fimEmMinutos, inicioVisivel + 30), limiteFinal);
  return {
    top: ((inicioVisivel - limiteInicial) / 60) * ALTURA_HORA,
    height: Math.max(((fimVisivel - inicioVisivel) / 60) * ALTURA_HORA, 34),
  };
}

function esperarOAuth(popup: Window) {
  return new Promise<string | null>((resolve, reject) => {
    let poll: number | undefined;
    const limpar = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.connectorId !== "google_calendar" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      limpar();
      if (type === "appUserConnectorOAuthComplete") {
        resolve(typeof event.data?.code === "string" ? event.data.code : null);
        return;
      }
      popup.close();
      reject(new Error("A conexão com o Google não foi concluída."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      limpar();
      reject(new Error("A janela do Google foi fechada antes de terminar."));
    }, 500);
  });
}

function AgendaPage() {
  const navigate = useNavigate();
  const carregarStatus = useServerFn(statusAgenda);
  const buscarEventos = useServerFn(listarEventos);
  const iniciar = useServerFn(iniciarConexaoGoogle);
  const concluir = useServerFn(concluirConexaoGoogle);
  const desconectar = useServerFn(desconectarGoogle);
  const novoEvento = useServerFn(criarEvento);

  const [status, setStatus] = useState<AgendaStatus | null>(null);
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [reconectar, setReconectar] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [filtro, setFiltro] = useState("todos");

  const [form, setForm] = useState({
    tatuador: "",
    titulo: "",
    data: "",
    hora: "10:00",
    duracao: "120",
    descricao: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [conectando, setConectando] = useState(false);

  const semana = useMemo(() => {
    const ini = inicioSemana(new Date());
    ini.setDate(ini.getDate() + semanaOffset * 7);
    const fim = new Date(ini);
    fim.setDate(fim.getDate() + 7);
    return { ini, fim };
  }, [semanaOffset]);

  async function recarregar(atual?: AgendaStatus) {
    const s = atual ?? status;
    if (!s) return;
    const { eventos: evs, precisamReconectar } = await buscarEventos({
      data: { inicio: semana.ini.toISOString(), fim: semana.fim.toISOString() },
    });
    setEventos(evs);
    setReconectar(precisamReconectar);
  }

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setCarregando(true);
        const s = await carregarStatus();
        if (!ativo) return;
        setStatus(s);
        setForm((f) => ({ ...f, tatuador: f.tatuador || s.tatuadores[0]?.tatuador || "" }));
        const { eventos: evs, precisamReconectar } = await buscarEventos({
          data: { inicio: semana.ini.toISOString(), fim: semana.fim.toISOString() },
        });
        if (!ativo) return;
        setEventos(evs);
        setReconectar(precisamReconectar);
        setErro(null);
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Não foi possível carregar a agenda.");
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanaOffset]);

  async function conectar() {
    if (conectando) return;
    setConectando(true);
    setErro(null);
    setAviso(null);
    const popup = window.open("", "titans-google", "width=600,height=720");
    if (!popup) {
      setErro("Libere as janelas pop-up no navegador e tente de novo.");
      setConectando(false);
      return;
    }
    let code: string | null = null;
    try {
      const { authorizationUrl } = await iniciar();
      const espera = esperarOAuth(popup);
      popup.location.href = authorizationUrl;
      code = await espera;
    } catch (e) {
      popup.close();
      setErro(e instanceof Error ? e.message : "Não foi possível conectar o Google Agenda.");
      setConectando(false);
      return;
    }
    try {
      if (code) await concluir({ data: { code } });
      const s = await carregarStatus();
      setStatus(s);
      await recarregar(s);
      setAviso("Google Agenda conectado.");
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : "";
      setErro(
        mensagem.includes("invalid_exchange_code")
          ? "O código de confirmação do Google expirou ou já foi usado. Clique em conectar novamente para gerar um código novo."
          : mensagem || "Não foi possível salvar a conexão.",
      );
    } finally {
      setConectando(false);
    }
  }

  async function remover() {
    setErro(null);
    setAviso(null);
    try {
      await desconectar();
      const s = await carregarStatus();
      setStatus(s);
      await recarregar(s);
      setAviso("Google Agenda desconectado.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível desconectar.");
    }
  }

  async function agendar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (!form.tatuador || !form.titulo || !form.data || !form.hora) {
      setErro("Preencha tatuador, título, data e hora.");
      return;
    }
    setSalvando(true);
    try {
      const inicio = new Date(`${form.data}T${form.hora}:00`);
      const fim = new Date(inicio.getTime() + Number(form.duracao) * 60000);
      const r = await novoEvento({
        data: {
          tatuador: form.tatuador,
          titulo: form.titulo,
          inicio: inicio.toISOString(),
          fim: fim.toISOString(),
          descricao: form.descricao || undefined,
        },
      });
      if (!r.ok) {
        setErro(`${form.tatuador} precisa reconectar o Google Agenda.`);
        return;
      }
      setAviso("Agendamento criado no Google Agenda.");
      setForm((f) => ({ ...f, titulo: "", descricao: "" }));
      await recarregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível criar o agendamento.");
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  const dias = useMemo(() => {
    const lista: { data: Date; eventos: EventoAgenda[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(semana.ini);
      d.setDate(d.getDate() + i);
      const chave = d.toDateString();
      lista.push({
        data: d,
        eventos: eventos.filter(
          (ev) =>
            new Date(ev.inicio).toDateString() === chave &&
            (filtro === "todos" || ev.tatuador === filtro),
        ),
      });
    }
    return lista;
  }, [eventos, semana, filtro]);

  const horas = useMemo(
    () => Array.from({ length: HORA_FINAL - HORA_INICIAL + 1 }, (_, i) => HORA_INICIAL + i),
    [],
  );

  const conectados = status?.tatuadores.filter((t) => t.conectado).length ?? 0;

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <SectionTitle
          eyebrow="Área do estúdio"
          title="Agenda"
          description="Horários dos tatuadores em um só lugar, direto do Google Agenda de cada um."
        />
        <div className="flex flex-wrap gap-3">
          <Link to="/orcamentos" className={btn}>
            Orçamentos
          </Link>
          <Link to="/pagamentos" className={btn}>
            Financeiro
          </Link>
          <button type="button" onClick={sair} className={btn}>
            Sair
          </button>
        </div>
      </div>

      {erro ? <p className="mt-6 border border-destructive/50 p-4 text-sm">{erro}</p> : null}
      {aviso ? <p className="mt-6 border border-border p-4 text-sm">{aviso}</p> : null}

      <div className="mt-10 border border-border p-6">
        <h3 className="text-sm uppercase tracking-[0.2em]">Minha conta Google</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {status?.conectado
            ? "Sua agenda está conectada. Os compromissos aparecem abaixo e novos agendamentos vão direto para ela."
            : "Conecte sua conta do Google para que seus horários apareçam na agenda do estúdio."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={conectar} className={btnForte} disabled={conectando}>
            {conectando
              ? "Conectando…"
              : status?.conectado
                ? "Reconectar Google"
                : "Conectar Google Agenda"}
          </button>
          {status?.conectado ? (
            <button type="button" onClick={remover} className={btn}>
              Desconectar
            </button>
          ) : null}
        </div>
        {status?.podeVerTodos ? (
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            {status.tatuadores.map((t) => (
              <li key={t.tatuador} className="flex items-center gap-2 border border-border px-3 py-2 text-sm">
                <span className={`size-2 shrink-0 rounded-full ${corDoTatuador(t.tatuador).ponto}`} />
                <span className="font-medium">{t.tatuador}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {t.conectado ? "Conectada" : "Pendente"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {reconectar.length ? (
          <p className="mt-4 text-sm">
            Precisa renovar o acesso: {reconectar.join(", ")}.
          </p>
        ) : null}
      </div>

      <div className="mt-10 border border-border p-6">
        <h3 className="text-sm uppercase tracking-[0.2em]">Novo agendamento</h3>
        <form onSubmit={agendar} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Tatuador
            <select
              className={`${campo} mt-2`}
              value={form.tatuador}
              onChange={(e) => setForm({ ...form, tatuador: e.target.value })}
              disabled={carregando}
            >
              <option value="">{carregando ? "Carregando…" : "Selecione"}</option>
              {status?.tatuadores.map((t) => (
                <option key={t.tatuador} value={t.tatuador}>
                  {t.tatuador}{t.conectado ? "" : " — agenda pendente"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Cliente / título
            <input
              className={`${campo} mt-2`}
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Sessão — nome do cliente"
            />
          </label>
          <label className="text-sm">
            Data
            <input
              type="date"
              className={`${campo} mt-2`}
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              Hora
              <input
                type="time"
                className={`${campo} mt-2`}
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
              />
            </label>
            <label className="text-sm">
              Duração
              <select
                className={`${campo} mt-2`}
                value={form.duracao}
                onChange={(e) => setForm({ ...form, duracao: e.target.value })}
              >
                <option value="60">1 hora</option>
                <option value="120">2 horas</option>
                <option value="180">3 horas</option>
                <option value="240">4 horas</option>
                <option value="360">6 horas</option>
              </select>
            </label>
          </div>
          <label className="text-sm md:col-span-2">
            Observações
            <textarea
              className={`${campo} mt-2 min-h-24`}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className={btnForte} disabled={salvando}>
              {salvando ? "Agendando…" : "Agendar"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <button type="button" className={btn} onClick={() => setSemanaOffset((s) => s - 1)}>
            Semana anterior
          </button>
          <button type="button" className={btn} onClick={() => setSemanaOffset(0)}>
            Esta semana
          </button>
          <button type="button" className={btn} onClick={() => setSemanaOffset((s) => s + 1)}>
            Próxima semana
          </button>
        </div>
        {status?.podeVerTodos ? (
          <div className="flex flex-wrap gap-2" aria-label="Filtrar agenda por tatuador">
            {["todos", ...(status?.tatuadores.map((t) => t.tatuador) ?? [])].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={filtro === t}
                onClick={() => setFiltro(t)}
                className={`${btn} flex items-center gap-2 ${filtro === t ? "border-foreground text-foreground" : ""}`}
              >
                {t !== "todos" ? (
                  <span className={`size-2 rounded-full ${corDoTatuador(t).ponto}`} />
                ) : null}
                {t === "todos" ? "Todos" : t}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {carregando ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando agenda…</p>
      ) : (
        <>
          {conectados === 0 ? (
            <p className="mt-8 border border-border p-4 text-sm text-muted-foreground">
              Nenhuma agenda conectada ainda. O quadro já está pronto; cada tatuador precisa entrar
              com seu usuário e conectar a própria conta Google.
            </p>
          ) : null}
        <div className="mt-8 border border-border">
          <div className="overflow-x-auto">
            <div className="min-w-[1050px]">
              <div className="grid grid-cols-[64px_repeat(7,minmax(140px,1fr))] border-b border-border bg-card">
                <div className="border-r border-border p-3" />
                {dias.map((d) => (
                  <div key={d.data.toISOString()} className="border-r border-border p-3 text-center last:border-r-0">
                    <p className="text-xs uppercase text-muted-foreground">{fmtDia(d.data)}</p>
                    <p className="mt-1 font-display text-2xl">{d.data.getDate()}</p>
                  </div>
                ))}
              </div>

              {dias.some((d) => d.eventos.some((ev) => ev.diaInteiro)) ? (
                <div className="grid grid-cols-[64px_repeat(7,minmax(140px,1fr))] border-b border-border">
                  <div className="border-r border-border p-2 text-center text-[10px] uppercase text-muted-foreground">
                    Dia
                  </div>
                  {dias.map((d) => (
                    <div key={`inteiro-${d.data.toISOString()}`} className="min-h-12 border-r border-border p-1 last:border-r-0">
                      {d.eventos.filter((ev) => ev.diaInteiro).map((ev) => {
                        const cor = corDoTatuador(ev.tatuador);
                        return (
                          <div key={`${ev.tatuador}-${ev.id}`} className={`${cor.fundo} ${cor.texto} mb-1 px-2 py-1 text-xs`}>
                            <strong>{ev.tatuador}</strong> · {ev.titulo}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid grid-cols-[64px_repeat(7,minmax(140px,1fr))]">
                <div className="relative border-r border-border" style={{ height: (HORA_FINAL - HORA_INICIAL) * ALTURA_HORA }}>
                  {horas.slice(0, -1).map((hora) => (
                    <div
                      key={hora}
                      className="absolute right-0 w-full border-t border-border pr-2 pt-1 text-right text-[11px] text-muted-foreground"
                      style={{ top: (hora - HORA_INICIAL) * ALTURA_HORA }}
                    >
                      {String(hora).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>
                {dias.map((d) => (
                  <div
                    key={`grade-${d.data.toISOString()}`}
                    className="relative border-r border-border last:border-r-0"
                    style={{ height: (HORA_FINAL - HORA_INICIAL) * ALTURA_HORA }}
                  >
                    {horas.slice(0, -1).map((hora) => (
                      <div
                        key={hora}
                        className="absolute w-full border-t border-border/70"
                        style={{ top: (hora - HORA_INICIAL) * ALTURA_HORA }}
                      />
                    ))}
                    {d.eventos.filter((ev) => !ev.diaInteiro).map((ev) => {
                      const cor = corDoTatuador(ev.tatuador);
                      const posicao = posicaoEvento(ev);
                      return (
                        <article
                          key={`${ev.tatuador}-${ev.id}`}
                          className={`${cor.fundo} ${cor.texto} inset-x-1 group absolute z-10 overflow-hidden border border-background/30 px-2 py-[2px] shadow-sm transition-all hover:z-30 hover:!h-auto hover:overflow-visible hover:py-1 hover:shadow-lg`}
                          style={{ top: posicao.top, height: posicao.height }}
                          title={`${ev.tatuador} · ${ev.titulo} · ${fmtIntervalo(ev)}`}
                        >
                          <p className="truncate text-[11px] leading-[16px]">
                            <span className="font-semibold">{fmtIntervalo(ev)}</span>{" "}
                            {ev.titulo}
                          </p>
                          <div className="hidden group-hover:block">
                            <p className="mt-1 text-xs font-bold">{ev.titulo}</p>
                            <p className="text-[11px]">{ev.tatuador}</p>
                            <p className="text-[11px]">{fmtIntervalo(ev)}</p>
                          </div>
                        </article>
                      );
                    })}

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </Section>
  );
}
