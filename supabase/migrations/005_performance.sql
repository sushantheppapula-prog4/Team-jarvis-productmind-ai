create table if not exists public.performance_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null check (status in ('LOADING_MARKET_INTELLIGENCE','LOADING_CUSTOMER_INTELLIGENCE','EVALUATING_PERFORMANCE','GENERATING_RECOMMENDATIONS','SAVING_REPORT','COMPLETE','INSUFFICIENT_DATA','ERROR')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.performance_analyses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.performance_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  overall_rating text not null check (overall_rating in ('EXCELLENT','GOOD','MODERATE','WEAK','CRITICAL')),
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.performance_dimensions (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.performance_analyses(id) on delete cascade,
  job_id uuid not null references public.performance_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  dimension text not null check (dimension in ('MARKET_FIT','CUSTOMER_SATISFACTION','COMPETITIVE_POSITION','PRICING_FIT','FEATURE_FIT','GROWTH_POTENTIAL')),
  score integer not null check (score between 0 and 100),
  rating text not null check (rating in ('EXCELLENT','GOOD','MODERATE','WEAK','CRITICAL')),
  reasoning text not null,
  supporting_intelligence jsonb not null default '[]'::jsonb
);

create table if not exists public.performance_risks (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.performance_analyses(id) on delete cascade,
  job_id uuid not null references public.performance_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  detail text not null,
  evidence jsonb not null default '[]'::jsonb,
  severity text not null check (severity in ('CRITICAL','HIGH','MEDIUM','LOW'))
);

create table if not exists public.performance_opportunities (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.performance_analyses(id) on delete cascade,
  job_id uuid not null references public.performance_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  detail text not null,
  evidence jsonb not null default '[]'::jsonb,
  priority text not null check (priority in ('CRITICAL','HIGH','MEDIUM','LOW'))
);

create table if not exists public.performance_recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.performance_analyses(id) on delete cascade,
  job_id uuid not null references public.performance_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  phase text not null check (phase in ('IMMEDIATE','SHORT_TERM','STRATEGIC')),
  action text not null
);

create index if not exists performance_jobs_owner_idx on public.performance_analysis_jobs(user_id, product_id, created_at desc);
create index if not exists performance_analyses_owner_idx on public.performance_analyses(user_id, product_id, created_at desc);
create index if not exists performance_dimensions_owner_idx on public.performance_dimensions(user_id, product_id, analysis_id);
create index if not exists performance_risks_owner_idx on public.performance_risks(user_id, product_id, analysis_id);
create index if not exists performance_opportunities_owner_idx on public.performance_opportunities(user_id, product_id, analysis_id);
create index if not exists performance_recommendations_owner_idx on public.performance_recommendations(user_id, product_id, analysis_id);

alter table public.performance_analysis_jobs enable row level security;
alter table public.performance_analyses enable row level security;
alter table public.performance_dimensions enable row level security;
alter table public.performance_risks enable row level security;
alter table public.performance_opportunities enable row level security;
alter table public.performance_recommendations enable row level security;

grant select, insert, update, delete on public.performance_analysis_jobs, public.performance_analyses, public.performance_dimensions, public.performance_risks, public.performance_opportunities, public.performance_recommendations to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['performance_analysis_jobs','performance_analyses','performance_dimensions','performance_risks','performance_opportunities','performance_recommendations'] loop
    execute format('drop policy if exists %I on public.%I', 'Users manage ' || table_name, table_name);
    execute format('create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid()))) with check ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid())))', 'Users manage ' || table_name, table_name);
  end loop;
end $$;
