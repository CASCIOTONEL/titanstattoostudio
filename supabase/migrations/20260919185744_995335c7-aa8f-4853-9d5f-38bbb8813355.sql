CREATE OR REPLACE FUNCTION private.pode_ver_orcamentos(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = _user_id
      and p.ativo
      and ur.role in ('master'::app_role, 'recepcao'::app_role)
  )
$$;

REVOKE ALL ON FUNCTION private.pode_ver_orcamentos(uuid) FROM public;
GRANT EXECUTE ON FUNCTION private.pode_ver_orcamentos(uuid) TO authenticated;

DROP POLICY IF EXISTS "Equipe com permissao ve os orcamentos" ON public.leads;
CREATE POLICY "Equipe com permissao ve os orcamentos" ON public.leads
  FOR SELECT TO authenticated USING (private.pode_ver_orcamentos(auth.uid()));

DROP POLICY IF EXISTS "Equipe com permissao atualiza os orcamentos" ON public.leads;
CREATE POLICY "Equipe com permissao atualiza os orcamentos" ON public.leads
  FOR UPDATE TO authenticated
  USING (private.pode_ver_orcamentos(auth.uid()))
  WITH CHECK (private.pode_ver_orcamentos(auth.uid()));

DROP POLICY IF EXISTS "Equipe ve as referencias" ON storage.objects;
CREATE POLICY "Equipe ve as referencias" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'referencias' AND private.pode_ver_orcamentos(auth.uid()));