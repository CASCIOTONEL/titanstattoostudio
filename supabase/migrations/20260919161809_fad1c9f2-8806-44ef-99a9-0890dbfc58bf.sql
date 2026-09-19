create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function private.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = _user_id and p.ativo
  )
$$;

revoke execute on function private.has_role(uuid, public.app_role) from public, anon;
grant execute on function private.has_role(uuid, public.app_role) to authenticated;
revoke execute on function private.is_staff(uuid) from public, anon;
grant execute on function private.is_staff(uuid) to authenticated;

drop policy "Equipe ve os perfis" on public.profiles;
drop policy "Master gerencia os perfis" on public.profiles;
drop policy "Usuario ve suas permissoes" on public.user_roles;
drop policy "Master gerencia permissoes" on public.user_roles;
drop policy "Equipe com permissao ve os orcamentos" on public.leads;
drop policy "Equipe com permissao atualiza os orcamentos" on public.leads;
drop policy "Master exclui orcamentos" on public.leads;
drop policy "Equipe com permissao ve referencias" on storage.objects;

create policy "Equipe ve os perfis" on public.profiles
  for select to authenticated
  using (private.is_staff(auth.uid()) or id = auth.uid());
create policy "Master gerencia os perfis" on public.profiles
  for all to authenticated
  using (private.has_role(auth.uid(), 'master'))
  with check (private.has_role(auth.uid(), 'master'));

create policy "Usuario ve suas permissoes" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or private.has_role(auth.uid(), 'master'));
create policy "Master gerencia permissoes" on public.user_roles
  for all to authenticated
  using (private.has_role(auth.uid(), 'master'))
  with check (private.has_role(auth.uid(), 'master'));

create policy "Equipe com permissao ve os orcamentos" on public.leads
  for select to authenticated using (private.is_staff(auth.uid()));
create policy "Equipe com permissao atualiza os orcamentos" on public.leads
  for update to authenticated
  using (private.is_staff(auth.uid())) with check (private.is_staff(auth.uid()));
create policy "Master exclui orcamentos" on public.leads
  for delete to authenticated using (private.has_role(auth.uid(), 'master'));

create policy "Equipe com permissao ve referencias" on storage.objects
  for select to authenticated
  using (bucket_id = 'referencias' and private.is_staff(auth.uid()));

drop function if exists public.has_role(uuid, public.app_role);
drop function if exists public.is_staff(uuid);