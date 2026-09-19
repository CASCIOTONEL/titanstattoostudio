-- 1. Situações do orçamento
ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT 'aberto';

UPDATE public.leads SET status = CASE
  WHEN status IN ('novo', 'aguardando informações') THEN 'aberto'
  WHEN status IN ('realizado', 'arquivado') THEN 'concluído'
  ELSE 'em andamento'
END;

DROP POLICY IF EXISTS "Visitante envia um orcamento valido" ON public.leads;
CREATE POLICY "Visitante envia um orcamento valido" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(nome) BETWEEN 2 AND 120
    AND char_length(whatsapp) BETWEEN 8 AND 30
    AND char_length(endereco) BETWEEN 3 AND 200
    AND char_length(servico) BETWEEN 2 AND 60
    AND char_length(ideia) BETWEEN 3 AND 2000
    AND char_length(local_corpo) BETWEEN 2 AND 80
    AND largura_cm > 0 AND largura_cm <= 300
    AND altura_cm > 0 AND altura_cm <= 300
    AND COALESCE(array_length(referencias, 1), 0) <= 5
    AND status = 'aberto'
    AND observacoes IS NULL
  );

-- 2. Clientes
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  whatsapp text NOT NULL,
  email text,
  nascimento date,
  documento text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  alergias text,
  observacoes text,
  origem text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipe com permissao ve os clientes" ON public.clientes
  FOR SELECT TO authenticated USING (private.pode_ver_orcamentos(auth.uid()));

CREATE POLICY "Equipe com permissao cadastra clientes" ON public.clientes
  FOR INSERT TO authenticated WITH CHECK (private.pode_ver_orcamentos(auth.uid()));

CREATE POLICY "Equipe com permissao edita clientes" ON public.clientes
  FOR UPDATE TO authenticated
  USING (private.pode_ver_orcamentos(auth.uid()))
  WITH CHECK (private.pode_ver_orcamentos(auth.uid()));

CREATE POLICY "Master exclui clientes" ON public.clientes
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'master'::app_role));

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX clientes_nome_idx ON public.clientes (lower(nome));