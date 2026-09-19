ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS aviso_wa_id text,
  ADD COLUMN IF NOT EXISTS aviso_em timestamptz;

CREATE TABLE IF NOT EXISTS public.whatsapp_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  provider_id text UNIQUE,
  destinatario text NOT NULL,
  corpo text,
  status text NOT NULL DEFAULT 'accepted',
  status_em timestamptz,
  erro jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.whatsapp_mensagens TO authenticated;
GRANT ALL ON public.whatsapp_mensagens TO service_role;
ALTER TABLE public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe ve as mensagens enviadas" ON public.whatsapp_mensagens
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

CREATE TRIGGER update_whatsapp_mensagens_updated_at BEFORE UPDATE ON public.whatsapp_mensagens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.whatsapp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id text NOT NULL UNIQUE,
  event text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text
);

CREATE INDEX IF NOT EXISTS whatsapp_webhook_events_pendentes
  ON public.whatsapp_webhook_events (received_at) WHERE processed_at IS NULL;

GRANT SELECT ON public.whatsapp_webhook_events TO authenticated;
GRANT ALL ON public.whatsapp_webhook_events TO service_role;
ALTER TABLE public.whatsapp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe ve os avisos recebidos" ON public.whatsapp_webhook_events
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));