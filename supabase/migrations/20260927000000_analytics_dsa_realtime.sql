-- Applied to production on 2026-09-27.

-- Live updates for RitikOS: stats joins the realtime publication.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='stats') then
    alter publication supabase_realtime add table public.stats;
  end if;
end $$;

-- Anonymous, first-party visitor analytics (no IPs, no user ids, no cookies).
create table if not exists public.page_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null check (char_length(session_id) between 8 and 40),
  type text not null check (type in ('pageview','scroll','project','post','edition','dsa')),
  path text not null check (char_length(path) <= 200),
  source text check (char_length(source) <= 40),
  device text check (device in ('mobile','tablet','desktop')),
  country text check (char_length(country) <= 2),
  value int check (value between 0 and 100000),
  label text check (char_length(label) <= 120)
);
create index if not exists page_events_created_at_idx on public.page_events (created_at desc);
alter table public.page_events enable row level security;
create policy "anyone can record events" on public.page_events for insert to anon, authenticated with check (true);
create policy "admin reads events" on public.page_events for select to authenticated using (is_admin());
create policy "admin deletes events" on public.page_events for delete to authenticated using (is_admin());

-- DSA journal
create table if not exists public.dsa_problems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  number int,
  url text,
  difficulty text check (difficulty in ('Easy','Medium','Hard')),
  topics text[] not null default '{}',
  approach text,
  time_complexity text,
  space_complexity text,
  code text,
  language text,
  notes text,
  revisit boolean not null default false,
  solved_at date not null default current_date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dsa_problems_solved_idx on public.dsa_problems (solved_at desc);
alter table public.dsa_problems enable row level security;
create policy "public reads published dsa" on public.dsa_problems for select to anon, authenticated using (published = true);
create policy "admin manages dsa" on public.dsa_problems for all to authenticated using (is_admin()) with check (is_admin());

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger dsa_problems_touch before update on public.dsa_problems for each row execute function public.touch_updated_at();

alter publication supabase_realtime add table public.dsa_problems;
