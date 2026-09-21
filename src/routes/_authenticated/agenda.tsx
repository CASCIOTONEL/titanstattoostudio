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
    ],
  }),
  component: AgendaPage,
});

const btn =
  "border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground";
const btnForte =
  "border border-foreground/80 px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-40";
const campo = "w-full border border-border bg-transparent px-4 py-3 text-sm";

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
    setErro(null);
    setAviso(null);
    const popup = window.open("", "titans-google", "width=600,height=720");
    if (!popup) {
      setErro("Libere as janelas pop-up no navegador e tente de novo.");
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
      return;
    }
    try {
      if (code) await concluir({ data: { code } });
      const s = await carregarStatus();
      setStatus(s);
      await recarregar(s);
      setAviso("Google Agenda conectado.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar a conexão.");
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
          <button type="button" onClick={conectar} className={btnForte}>
            {status?.conectado ? "Reconectar Google" : "Conectar Google Agenda"}
          </button>
          {status?.conectado ? (
            <button type="button" onClick={remover} className={btn}>
              Desconectar
            </button>
          ) : null}
        </div>
        {status?.podeVerTodos ? (
          <ul className="mt-5 space-y-1 text-sm text-muted-foreground">
            {status.tatuadores.map((t) => (
              <li key={t.tatuador}>
                {t.tatuador}: {t.conectado ? "agenda conectada" : "ainda não conectou"}
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
            >
              <option value="">Selecione</option>
              {status?.tatuadores.map((t) => (
                <option key={t.tatuador} value={t.tatuador}>
                  {t.tatuador}
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
          <div className="flex flex-wrap gap-2">
            {["todos", ...(status?.tatuadores.map((t) => t.tatuador) ?? [])].map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={filtro === t}
                onClick={() => setFiltro(t)}
                className={`${btn} ${filtro === t ? "text-foreground" : ""}`}
              >
                {t === "todos" ? "Todos" : t}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {carregando ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando agenda…</p>
      ) : conectados === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nenhuma agenda conectada ainda. Cada tatuador precisa entrar aqui e conectar a conta
          Google dele.
        </p>
      ) : (
        <div className="mt-8 grid gap-4">
          {dias.map((d) => (
            <div key={d.data.toISOString()} className="border border-border p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {fmtDia(d.data)}
              </p>
              {d.eventos.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Sem compromissos.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {d.eventos.map((ev) => (
                    <li key={`${ev.tatuador}-${ev.id}`} className="flex flex-wrap gap-3 text-sm">
                      <span className="w-28 text-muted-foreground">
                        {fmtHora(ev.inicio, ev.diaInteiro)}
                      </span>
                      <span className="font-medium">{ev.tatuador}</span>
                      <span>{ev.titulo}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
