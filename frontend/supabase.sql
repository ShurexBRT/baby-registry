
-- Enable extension
create extension if not exists pgcrypto;

-- ITEMS table
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  description text,
  quantity int not null default 1,
  unit text default 'kom',
  price_estimate numeric(12,2),
  store_link text,
  image_url text,
  priority text check (priority in ('high','med','low')) default 'med',
  status text check (status in ('available','reserved','purchased')) default 'available',
  reserved_by text,
  reserved_at timestamptz,
  purchased_by text,
  purchased_at timestamptz,
  updated_at timestamptz not null default now()
);

-- AUDIT LOG
create table if not exists public.audit_log (
  id bigserial primary key,
  ts timestamptz not null default now(),
  action text not null,
  item_id uuid references public.items(id) on delete set null,
  actor text,
  details jsonb
);

-- ADMINS (store emails with admin rights)
create table if not exists public.admins (
  email text primary key
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_items_updated_at on public.items;
create trigger trg_items_updated_at
before update on public.items
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.items enable row level security;
alter table public.audit_log enable row level security;
alter table public.admins enable row level security;

-- Policies
-- public read on items
drop policy if exists "public can select items" on public.items;
create policy "public can select items" on public.items
for select using (true);

-- insert to audit via functions
drop policy if exists "audit insert via function" on public.audit_log;
create policy "audit insert via function" on public.audit_log
for insert to anon, authenticated
with check (true);

-- admins: only service role can modify list of admins (optional: or restrict to specific email)
drop policy if exists "read admins self" on public.admins;
create policy "read admins self" on public.admins for select
to authenticated using (auth.email() = email);

drop policy if exists "admin manage admins" on public.admins;
create policy "admin manage admins" on public.admins
for all
to service_role
using (true)
with check (true);

-- items write policies for admins (by email)
drop policy if exists "admins insert items" on public.items;
create policy "admins insert items" on public.items
for insert to authenticated
with check (exists (select 1 from public.admins a where a.email = auth.email()));

drop policy if exists "admins update items" on public.items;
create policy "admins update items" on public.items
for update to authenticated
using (exists (select 1 from public.admins a where a.email = auth.email()))
with check (exists (select 1 from public.admins a where a.email = auth.email()));

drop policy if exists "admins delete items" on public.items;
create policy "admins delete items" on public.items
for delete to authenticated
using (exists (select 1 from public.admins a where a.email = auth.email()));

-- Helper + RPC functions
drop function if exists public.is_valid_url(text);
create or replace function public.is_valid_url(url text)
returns boolean language plpgsql immutable as $$
begin
  return url ~* '^(http|https)://';
end;
$$;

create or replace function public.reserve_item(p_item uuid, p_name text)
returns table (ok boolean, new_status text) language plpgsql security definer as $$
begin
  update public.items
     set status = 'reserved',
         reserved_by = left(coalesce(p_name,'Anon'), 80),
         reserved_at = now()
   where id = p_item
     and status = 'available'
  returning true, status into ok, new_status;

  if not found then
    return query select false, (select status from public.items where id = p_item);
  end if;

  insert into public.audit_log(action, item_id, actor, details)
  values ('reserve', p_item, 'public', '{}'::jsonb);

  return;
end; $$;

create or replace function public.purchase_item(p_item uuid, p_name text)
returns table (ok boolean, new_status text) language plpgsql security definer as $$
begin
  update public.items
     set status = 'purchased',
         purchased_by = left(coalesce(p_name,'Anon'), 80),
         purchased_at = now()
   where id = p_item
     and status in ('available','reserved')
  returning true, status into ok, new_status;

  if not found then
    return query select false, (select status from public.items where id = p_item);
  end if;

  insert into public.audit_log(action, item_id, actor, details)
  values ('purchase', p_item, 'public', '{}'::jsonb);

  return;
end; $$;

-- Grants for RPC
revoke all on function public.reserve_item(uuid, text) from public;
revoke all on function public.purchase_item(uuid, text) from public;
grant execute on function public.reserve_item(uuid, text) to anon, authenticated;
grant execute on function public.purchase_item(uuid, text) to anon, authenticated;
