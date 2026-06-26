begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

create table if not exists public.settings (
  id text primary key default 'app-settings',
  maintenance_mode boolean not null default false,
  allowed_domains text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.settings enable row level security;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_settings_updated_at on public.settings;
create trigger on_settings_updated_at
before update on public.settings
for each row execute function public.handle_updated_at();

drop policy if exists "Settings are readable by admins" on public.settings;
create policy "Settings are readable by admins"
on public.settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "Settings are editable by admins" on public.settings;
create policy "Settings are editable by admins"
on public.settings
for insert
to authenticated
with check (public.is_admin());

create policy "Settings updates are limited to admins"
on public.settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.settings (id, maintenance_mode, allowed_domains)
values ('app-settings', false, '{}'::text[])
on conflict (id) do nothing;

commit;
