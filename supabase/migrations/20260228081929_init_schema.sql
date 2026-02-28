-- ============================================================
-- AreBet init_schema migration
-- Tables: profiles, favorites, user_preferences
-- ============================================================

-- 1. profiles
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  display_name text,
  default_league text,
  timezone    text,
  onboarding_completed boolean not null default false
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 2. favorites
create table public.favorites (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  entity_type text        not null check (entity_type in ('team', 'league', 'match')),
  entity_id   text        not null,
  label       text        not null,
  meta        jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.favorites enable row level security;

create unique index favorites_user_entity_uniq
  on public.favorites (user_id, entity_type, entity_id);

create index favorites_user_created
  on public.favorites (user_id, created_at desc);

create policy "Users can view own favorites"
  on public.favorites for select
  using (user_id = auth.uid());

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (user_id = auth.uid());

create policy "Users can update own favorites"
  on public.favorites for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (user_id = auth.uid());

-- 3. user_preferences
create table public.user_preferences (
  user_id              uuid        primary key references auth.users(id) on delete cascade,
  density              text        not null default 'compact'  check (density in ('compact', 'comfortable')),
  default_sort         text        not null default 'kickoff'  check (default_sort in ('kickoff', 'confidence', 'odds', 'league')),
  default_filter_status text       not null default 'live'     check (default_filter_status in ('live', 'upcoming', 'all')),
  show_favorites_first boolean     not null default true,
  hide_finished        boolean     not null default false,
  odds_format          text        not null default 'decimal'  check (odds_format in ('decimal', 'fractional', 'american')),
  updated_at           timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (user_id = auth.uid());

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (user_id = auth.uid());

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. auto-update updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function public.set_updated_at();
