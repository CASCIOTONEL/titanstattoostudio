create extension if not exists pg_cron;
create extension if not exists pg_net;

create table public.envios_aniversario (
  id uuid primary key default gen_random_uuid(),
  ano int not null,
  whatsapp text not null,
  nome text not null,
  status text not null default 'pendente',
  erro text,
  provider_id text,
  created_at timestamptz not null default now(),
  unique (ano, whatsapp)
);
grant select on public.envios_aniversario to authenticated;
grant all on public.envios_aniversario to service_role;
alter table public.envios_aniversario enable row level security;
create policy "Equipe ve envios de aniversario" on public.envios_aniversario
  for select to authenticated using (private.is_staff(auth.uid()));

create table public.rotina_tokens (
  nome text primary key,
  token text not null default encode(extensions.gen_random_bytes(32), 'hex')
);
grant all on public.rotina_tokens to service_role;
alter table public.rotina_tokens enable row level security;
insert into public.rotina_tokens (nome) values ('aniversarios') on conflict do nothing;