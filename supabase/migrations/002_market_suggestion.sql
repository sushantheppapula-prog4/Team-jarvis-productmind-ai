create table if not exists public.market_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','researching','analyzing','completed','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.market_analyses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.market_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  market_readiness text not null check (market_readiness in ('HIGH','MEDIUM','LOW','INSUFFICIENT DATA')),
  readiness_reason text not null,
  recommended_launch_window text not null,
  launch_reasoning text not null,
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  confidence_reason text not null,
  reasoning text not null,
  key_findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.market_signals (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.market_analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  signal_type text not null,
  rating text not null,
  explanation text not null,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.market_sources (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.market_analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  url text not null,
  domain text not null,
  publication_date timestamptz,
  retrieved_at timestamptz not null default now(),
  claim text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.market_recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.market_analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  recommendation_type text not null check (recommendation_type in ('opportunity','risk','action')),
  priority text not null check (priority in ('HIGH','MEDIUM','LOW')),
  title text not null,
  detail text not null,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists market_analysis_jobs_owner_idx on public.market_analysis_jobs(user_id, product_id, created_at desc);
create index if not exists market_analyses_owner_idx on public.market_analyses(user_id, product_id, created_at desc);
create index if not exists market_signals_owner_idx on public.market_signals(user_id, product_id);
create index if not exists market_sources_owner_idx on public.market_sources(user_id, product_id);
create index if not exists market_recommendations_owner_idx on public.market_recommendations(user_id, product_id);

alter table public.market_analysis_jobs enable row level security;
alter table public.market_analyses enable row level security;
alter table public.market_signals enable row level security;
alter table public.market_sources enable row level security;
alter table public.market_recommendations enable row level security;

revoke all on table public.market_analysis_jobs, public.market_analyses, public.market_signals, public.market_sources, public.market_recommendations from anon;
grant select, insert, update, delete on table public.market_analysis_jobs, public.market_analyses, public.market_signals, public.market_sources, public.market_recommendations to authenticated;

drop policy if exists "Users can view their market jobs" on public.market_analysis_jobs;
drop policy if exists "Users can create their market jobs" on public.market_analysis_jobs;
drop policy if exists "Users can update their market jobs" on public.market_analysis_jobs;
drop policy if exists "Users can delete their market jobs" on public.market_analysis_jobs;
create policy "Users can view their market jobs" on public.market_analysis_jobs for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their market jobs" on public.market_analysis_jobs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their market jobs" on public.market_analysis_jobs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their market jobs" on public.market_analysis_jobs for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.market_owner_check(target_user_id uuid, target_product_id uuid)
returns boolean language sql stable security invoker set search_path = public
as $$ select (select auth.uid()) = target_user_id and exists (select 1 from public.products p where p.id = target_product_id and p.user_id = (select auth.uid())) $$;

drop policy if exists "Users can view their market analyses" on public.market_analyses;
drop policy if exists "Users can create their market analyses" on public.market_analyses;
drop policy if exists "Users can update their market analyses" on public.market_analyses;
drop policy if exists "Users can delete their market analyses" on public.market_analyses;
create policy "Users can view their market analyses" on public.market_analyses for select to authenticated using (public.market_owner_check(user_id, product_id));
create policy "Users can create their market analyses" on public.market_analyses for insert to authenticated with check (public.market_owner_check(user_id, product_id));
create policy "Users can update their market analyses" on public.market_analyses for update to authenticated using (public.market_owner_check(user_id, product_id)) with check (public.market_owner_check(user_id, product_id));
create policy "Users can delete their market analyses" on public.market_analyses for delete to authenticated using (public.market_owner_check(user_id, product_id));

create or replace function public.market_child_owner_check(target_user_id uuid, target_product_id uuid)
returns boolean language sql stable security invoker set search_path = public
as $$ select (select auth.uid()) = target_user_id and exists (select 1 from public.products p where p.id = target_product_id and p.user_id = (select auth.uid())) $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['market_signals','market_sources','market_recommendations'] LOOP
    EXECUTE format('drop policy if exists "Users can view their %1$s" on public.%1$s', t);
    EXECUTE format('drop policy if exists "Users can create their %1$s" on public.%1$s', t);
    EXECUTE format('drop policy if exists "Users can update their %1$s" on public.%1$s', t);
    EXECUTE format('drop policy if exists "Users can delete their %1$s" on public.%1$s', t);
    EXECUTE format('create policy "Users can view their %1$s" on public.%1$s for select to authenticated using (public.market_child_owner_check(user_id, product_id))', t);
    EXECUTE format('create policy "Users can create their %1$s" on public.%1$s for insert to authenticated with check (public.market_child_owner_check(user_id, product_id))', t);
    EXECUTE format('create policy "Users can update their %1$s" on public.%1$s for update to authenticated using (public.market_child_owner_check(user_id, product_id)) with check (public.market_child_owner_check(user_id, product_id))', t);
    EXECUTE format('create policy "Users can delete their %1$s" on public.%1$s for delete to authenticated using (public.market_child_owner_check(user_id, product_id))', t);
  END LOOP;
END $$;
