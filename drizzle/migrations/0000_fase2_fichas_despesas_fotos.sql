CREATE TABLE public.fichas_anamnese (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  expira_em timestamptz NOT NULL DEFAULT now() + interval '7 days',
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  aceite_procedimento boolean NOT NULL DEFAULT false,
  aceite_imagem boolean NOT NULL DEFAULT false,
  aceite_politica boolean NOT NULL DEFAULT false,
  aceite_lgpd boolean NOT NULL DEFAULT false,
  assinatura_path text,
  assinada_em timestamptz,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fichas_anamnese TO authenticated;
GRANT ALL ON public.fichas_anamnese TO service_role;
ALTER TABLE public.fichas_anamnese ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe ve fichas" ON public.fichas_anamnese FOR SELECT TO authenticated USING (private.pode_ver_orcamentos(auth.uid()));
CREATE POLICY "Equipe cria fichas" ON public.fichas_anamnese FOR INSERT TO authenticated WITH CHECK (private.pode_ver_orcamentos(auth.uid()));
CREATE POLICY "Master exclui fichas" ON public.fichas_anamnese FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'master'::app_role));
CREATE TRIGGER update_fichas_updated_at BEFORE UPDATE ON public.fichas_anamnese FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.despesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  categoria text NOT NULL,
  descricao text,
  valor numeric NOT NULL,
  forma text,
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.despesas TO authenticated;
GRANT ALL ON public.despesas TO service_role;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Financeiro ve despesas" ON public.despesas FOR SELECT TO authenticated USING (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Financeiro registra despesas" ON public.despesas FOR INSERT TO authenticated WITH CHECK (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Financeiro edita despesas" ON public.despesas FOR UPDATE TO authenticated USING (private.pode_ver_financeiro(auth.uid())) WITH CHECK (private.pode_ver_financeiro(auth.uid()));
CREATE POLICY "Financeiro exclui despesas" ON public.despesas FOR DELETE TO authenticated USING (private.pode_ver_financeiro(auth.uid()));
CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON public.despesas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cliente_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  path text NOT NULL,
  tipo text NOT NULL DEFAULT 'depois',
  tatuador text,
  data date NOT NULL DEFAULT CURRENT_DATE,
  legenda text,
  enviado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cliente_fotos TO authenticated;
GRANT ALL ON public.cliente_fotos TO service_role;
ALTER TABLE public.cliente_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe ve fotos" ON public.cliente_fotos FOR SELECT TO authenticated USING (private.pode_ver_orcamentos(auth.uid()));
CREATE POLICY "Equipe envia fotos" ON public.cliente_fotos FOR INSERT TO authenticated WITH CHECK (private.pode_ver_orcamentos(auth.uid()));
CREATE POLICY "Master exclui fotos" ON public.cliente_fotos FOR DELETE TO authenticated USING (private.has_role(auth.uid(),'master'::app_role));
CREATE TRIGGER update_cliente_fotos_updated_at BEFORE UPDATE ON public.cliente_fotos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Equipe le trabalhos e assinaturas" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('trabalhos','assinaturas') AND private.pode_ver_orcamentos(auth.uid()));
CREATE POLICY "Equipe envia trabalhos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'trabalhos' AND private.pode_ver_orcamentos(auth.uid()));
CREATE POLICY "Master apaga trabalhos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'trabalhos' AND private.has_role(auth.uid(),'master'::app_role));