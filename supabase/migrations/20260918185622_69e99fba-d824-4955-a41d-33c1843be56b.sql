CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  endereco TEXT NOT NULL,
  servico TEXT NOT NULL,
  ideia TEXT NOT NULL,
  largura_cm NUMERIC NOT NULL,
  altura_cm NUMERIC NOT NULL,
  local_corpo TEXT NOT NULL,
  cor TEXT,
  tipo TEXT,
  tatuador TEXT,
  disponibilidade TEXT,
  referencias TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'novo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer visitante pode enviar um orcamento"
  ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Equipe autenticada pode ver os orcamentos"
  ON public.leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Equipe autenticada pode atualizar os orcamentos"
  ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Equipe autenticada pode excluir orcamentos"
  ON public.leads FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();