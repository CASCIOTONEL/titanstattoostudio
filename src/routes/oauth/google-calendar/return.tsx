import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/oauth/google-calendar/return")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conectando o Google Agenda — Titans Tattoo Studio" },
      { name: "description", content: "Finalizando a conexão com o Google Agenda." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OAuthReturn,
});

function OAuthReturn() {
  const [mensagem, setMensagem] = useState("Finalizando a conexão…");
  const retornoEnviado = useRef(false);

  useEffect(() => {
    if (retornoEnviado.current) return;
    retornoEnviado.current = true;
    const params = new URLSearchParams(window.location.search);
    const avisar = (
      type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed",
      code?: string,
    ) => {
      window.opener?.postMessage(
        { type, connectorId: "google_calendar", code: code ?? null },
        window.location.origin,
      );
      window.close();
    };
    if (params.get("success") !== "true") {
      setMensagem(params.get("error") ?? "A conexão não foi concluída.");
      avisar("appUserConnectorOAuthFailed");
      return;
    }
    const code = params.get("code");
    if (!code) {
      if (params.get("offline_access_allowed") === "false") {
        avisar("appUserConnectorOAuthComplete");
        return;
      }
      setMensagem("A conexão terminou sem o código de confirmação.");
      avisar("appUserConnectorOAuthFailed");
      return;
    }
    avisar("appUserConnectorOAuthComplete", code);
  }, []);

  return <p className="p-8 text-center">{mensagem}</p>;
}
