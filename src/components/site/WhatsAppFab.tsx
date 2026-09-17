import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/studio";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site da Titans e quero falar sobre uma tatuagem.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border border-foreground/70 bg-background/90 px-4 py-3 text-xs uppercase tracking-[0.18em] text-foreground backdrop-blur transition-colors hover:bg-foreground hover:text-background"
    >
      <MessageCircle className="size-4" />
      WhatsApp
    </a>
  );
}
