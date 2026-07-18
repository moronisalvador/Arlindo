-- Arlindo — initial schema for cloud sync (run ONCE in the Arlindo project's
-- Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor → New query).
-- The app is local-first; this backs the optional cross-device sync. Least-
-- privilege: RLS on, policies scoped TO authenticated, each row owned by its user.

-- One row per saved presentation. `data` holds the full PresentationInputs JSON.
create table if not exists public.presentations (
  id text primary key,
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists presentations_owner_idx on public.presentations (owner);

alter table public.presentations enable row level security;

create policy "presentations_select_own"
  on public.presentations for select to authenticated
  using (owner = auth.uid());

create policy "presentations_insert_own"
  on public.presentations for insert to authenticated
  with check (owner = auth.uid());

create policy "presentations_update_own"
  on public.presentations for update to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

create policy "presentations_delete_own"
  on public.presentations for delete to authenticated
  using (owner = auth.uid());

-- Single agent/company profile per user (branding applied to every presentation).
create table if not exists public.profiles (
  owner uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (owner = auth.uid());

create policy "profiles_upsert_own"
  on public.profiles for insert to authenticated
  with check (owner = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
