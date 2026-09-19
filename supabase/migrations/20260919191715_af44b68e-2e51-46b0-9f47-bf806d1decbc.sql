ALTER TABLE public.pagamentos
  ADD COLUMN tatuador text,
  ADD COLUMN comissao_percentual numeric(5,2) NOT NULL DEFAULT 60;

CREATE TABLE public.comissoes_pagas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tatuador text NOT NULL,
  periodo_inicio date NOT NULL,
  periodo_fim date NOT NULL,
  pagar_em date NOT NULL,
  valor numeric(12,2) NOT NULL CHECK (valor >= 0),
  pago_em timestamptz NOT NULL DEFAULT now(),
  registrado_por uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tatuador, periodo_inicio)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comissoes_pagas TO authenticated;
GRANT ALL ON public.comissoes_pagas TO service_role;

ALTER TABLE public.comissoes_pagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe financeira ve as comissoes" ON public.comissoes_pagas
  FOR SELECT TO authenticated USING (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Equipe financeira registra comissoes" ON public.comissoes_pagas
  FOR INSERT TO authenticated WITH CHECK (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Equipe financeira edita comissoes" ON public.comissoes_pagas
  FOR UPDATE TO authenticated USING (private.pode_ver_financeiro(auth.uid()))
  WITH CHECK (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Master exclui comissoes" ON public.comissoes_pagas
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'master'::app_role));

CREATE INDEX comissoes_pagas_tatuador_idx ON public.comissoes_pagas(tatuador, periodo_inicio DESC);

CREATE TRIGGER update_comissoes_pagas_updated_at BEFORE UPDATE ON public.comissoes_pagas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();