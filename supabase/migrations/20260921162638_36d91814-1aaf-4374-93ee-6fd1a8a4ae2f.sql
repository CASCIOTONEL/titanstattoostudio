ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS documento text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS nascimento date;

DROP POLICY IF EXISTS "Visitante envia um orcamento valido" ON public.leads;
CREATE POLICY "Visitante envia um orcamento valido"
ON public.leads FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(nome) >= 2 AND char_length(nome) <= 120
  AND char_length(whatsapp) >= 8 AND char_length(whatsapp) <= 30
  AND char_length(servico) >= 2 AND char_length(servico) <= 60
  AND char_length(ideia) >= 3 AND char_length(ideia) <= 2000
  AND char_length(local_corpo) >= 2 AND char_length(local_corpo) <= 80
  AND largura_cm > 0 AND largura_cm <= 300
  AND altura_cm > 0 AND altura_cm <= 300
  AND COALESCE(array_length(referencias, 1), 0) <= 5
  AND status = 'aberto'
  AND observacoes IS NULL
  AND (documento IS NULL OR char_length(documento) <= 20)
  AND (nascimento IS NULL OR (nascimento > DATE '1900-01-01' AND nascimento < CURRENT_DATE))
);