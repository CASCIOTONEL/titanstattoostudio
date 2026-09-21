ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tatuador text;

CREATE OR REPLACE FUNCTION private.nome_tatuador(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.tatuador
  FROM public.profiles p
  JOIN public.user_roles r ON r.user_id = p.id AND r.role = 'tatuador'::public.app_role
  WHERE p.id = _user_id AND p.ativo AND p.tatuador IS NOT NULL
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION private.nome_tatuador(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.nome_tatuador(uuid) TO authenticated;

DROP POLICY IF EXISTS "Equipe com permissao ve os orcamentos" ON public.leads;
CREATE POLICY "Equipe com permissao ve os orcamentos"
ON public.leads FOR SELECT TO authenticated
USING (
  private.pode_ver_orcamentos(auth.uid())
  OR (private.nome_tatuador(auth.uid()) IS NOT NULL AND leads.tatuador = private.nome_tatuador(auth.uid()))
);

DROP POLICY IF EXISTS "Equipe com permissao atualiza os orcamentos" ON public.leads;
CREATE POLICY "Equipe com permissao atualiza os orcamentos"
ON public.leads FOR UPDATE TO authenticated
USING (
  private.pode_ver_orcamentos(auth.uid())
  OR (private.nome_tatuador(auth.uid()) IS NOT NULL AND leads.tatuador = private.nome_tatuador(auth.uid()))
)
WITH CHECK (
  private.pode_ver_orcamentos(auth.uid())
  OR (private.nome_tatuador(auth.uid()) IS NOT NULL AND leads.tatuador = private.nome_tatuador(auth.uid()))
);

DROP POLICY IF EXISTS "Equipe financeira ve os pagamentos" ON public.pagamentos;
CREATE POLICY "Equipe financeira ve os pagamentos"
ON public.pagamentos FOR SELECT TO authenticated
USING (
  private.pode_ver_financeiro(auth.uid())
  OR (private.nome_tatuador(auth.uid()) IS NOT NULL AND pagamentos.tatuador = private.nome_tatuador(auth.uid()))
);

DROP POLICY IF EXISTS "Equipe financeira ve as comissoes" ON public.comissoes_pagas;
CREATE POLICY "Equipe financeira ve as comissoes"
ON public.comissoes_pagas FOR SELECT TO authenticated
USING (
  private.pode_ver_financeiro(auth.uid())
  OR (private.nome_tatuador(auth.uid()) IS NOT NULL AND comissoes_pagas.tatuador = private.nome_tatuador(auth.uid()))
);