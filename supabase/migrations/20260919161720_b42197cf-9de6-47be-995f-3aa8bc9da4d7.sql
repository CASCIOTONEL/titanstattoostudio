-- 1. Roles enum
create type public.app_role as enum ('master', 'recepcao', 'financeiro', 'tatuador');

-- 2. Team profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- 3. User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- 4. Security definer helpers
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.user_id
    where ur.user_id = _user_id and p.ativo
  )
$$;

-- 5. Policies: profiles
create policy "Equipe ve os perfis" on public.profiles
  for select to authenticated
  using (public.is_staff(auth.uid()) or id = auth.uid());

create policy "Usuario atualiza o proprio perfil" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Master gerencia os perfis" on public.profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'master'))
  with check (public.has_role(auth.uid(), 'master'));

-- 6. Policies: user_roles
create policy "Usuario ve suas permissoes" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'master'));

create policy "Master gerencia permissoes" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'master'))
  with check (public.has_role(auth.uid(), 'master'));

-- 7. Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name'), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- 8. Backfill existing users + master role
insert into public.profiles (id, nome, email)
select u.id, coalesce(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1)), u.email
from auth.users u
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select u.id, 'master'::public.app_role from auth.users u
where u.email = 'titans.tattoo@gmail.com'
on conflict (user_id, role) do nothing;

-- 9. Tighten leads policies
drop policy if exists "Equipe autenticada pode ver os orcamentos" on public.leads;
drop policy if exists "Equipe autenticada pode atualizar os orcamentos" on public.leads;
drop policy if exists "Equipe autenticada pode excluir orcamentos" on public.leads;

create policy "Equipe com permissao ve os orcamentos" on public.leads
  for select to authenticated
  using (public.is_staff(auth.uid()));

create policy "Equipe com permissao atualiza os orcamentos" on public.leads
  for update to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create policy "Master exclui orcamentos" on public.leads
  for delete to authenticated
  using (public.has_role(auth.uid(), 'master'));

-- 10. Storage: referencias bucket
drop policy if exists "Equipe autenticada pode ver referencias" on storage.objects;
create policy "Equipe com permissao ve referencias" on storage.objects
  for select to authenticated
  using (bucket_id = 'referencias' and public.is_staff(auth.uid()));