CREATE OR REPLACE FUNCTION private.pode_ver_financeiro(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND p.ativo
      AND ur.role IN ('master','financeiro','recepcao')
  )
$$;

REVOKE EXECUTE ON FUNCTION private.pode_ver_financeiro(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.pode_ver_financeiro(uuid) TO authenticated;

CREATE TABLE public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  cliente_nome text NOT NULL,
  valor numeric(12,2) NOT NULL CHECK (valor > 0),
  data date NOT NULL DEFAULT CURRENT_DATE,
  forma text NOT NULL,
  tipo text NOT NULL DEFAULT 'total',
  observacoes text,
  registrado_por uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagamentos TO authenticated;
GRANT ALL ON public.pagamentos TO service_role;

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe financeira ve os pagamentos" ON public.pagamentos
  FOR SELECT TO authenticated USING (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Equipe financeira registra pagamentos" ON public.pagamentos
  FOR INSERT TO authenticated WITH CHECK (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Equipe financeira edita pagamentos" ON public.pagamentos
  FOR UPDATE TO authenticated USING (private.pode_ver_financeiro(auth.uid()))
  WITH CHECK (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Master exclui pagamentos" ON public.pagamentos
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'master'::app_role));

CREATE INDEX pagamentos_lead_id_idx ON public.pagamentos(lead_id);
CREATE INDEX pagamentos_data_idx ON public.pagamentos(data DESC);

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();