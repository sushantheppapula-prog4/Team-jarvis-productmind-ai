create table if not exists public.review_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null check (status in ('COLLECTING_REVIEWS','ANALYZING_SENTIMENT','IDENTIFYING_PROBLEMS','SAVING_REPORT','COMPLETE','INSUFFICIENT_REVIEW_DATA','RESEARCH_PROVIDER_UNAVAILABLE','ERROR')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.review_analyses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.review_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.review_sources (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.review_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  url text not null,
  domain text not null,
  retrieved_at timestamptz not null default now(),
  publication_date timestamptz,
  source_type text not null check (source_type in ('review','article','discussion','product page','competitor page','industry source')),
  claim text not null,
  evidence_text text not null,
  is_quote boolean not null default false
);

create table if not exists public.review_observations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.review_analysis_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  source_id uuid not null references public.review_sources(id) on delete cascade,
  claim text not null,
  topic text not null check (topic in ('QUALITY','PRICE','DESIGN','PERFORMANCE','RELIABILITY','USABILITY','FEATURES','ASSEMBLY','SUPPORT','OTHER')),
  sentiment text not null check (sentiment in ('POSITIVE','NEUTRAL','NEGATIVE','MIXED')),
  evidence_text text not null,
  evidence_strength text not null check (evidence_strength in ('SUPPORTED','REPEATED_SIGNAL','STRONG_RECURRING_SIGNAL'))
);

create table if not exists public.review_complaints (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.review_analysis_jobs(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade, complaint text not null, topic text not null, severity text not null check (severity in ('CRITICAL','HIGH','MEDIUM','LOW')), evidence text not null, source_ids uuid[] not null default '{}'
);
create table if not exists public.review_strengths (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.review_analysis_jobs(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade, strength text not null, reason text not null, evidence text not null, source_ids uuid[] not null default '{}'
);
create table if not exists public.review_weaknesses (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.review_analysis_jobs(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade, weakness text not null, evidence text not null, impact text not null, severity text not null check (severity in ('CRITICAL','HIGH','MEDIUM','LOW')), source_ids uuid[] not null default '{}'
);
create table if not exists public.review_problems (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.review_analysis_jobs(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade, problem text not null, root_evidence text not null, user_impact text not null, severity text not null check (severity in ('CRITICAL','HIGH','MEDIUM','LOW')), classification text not null check (classification in ('USER_PREFERENCE','USABILITY_ISSUE','PRODUCT_DEFECT','SERVICE_ISSUE')), evidence_strength text not null check (evidence_strength in ('SINGLE_OBSERVATION','REPEATED_SIGNAL','STRONG_RECURRING_SIGNAL')), source_ids uuid[] not null default '{}'
);

create index if not exists review_jobs_owner_idx on public.review_analysis_jobs(user_id, product_id, created_at desc);
create index if not exists review_analyses_owner_idx on public.review_analyses(user_id, product_id, created_at desc);
create index if not exists review_sources_owner_idx on public.review_sources(user_id, product_id, job_id);
create index if not exists review_observations_owner_idx on public.review_observations(user_id, product_id, job_id);
create index if not exists review_complaints_owner_idx on public.review_complaints(user_id, product_id, job_id);
create index if not exists review_strengths_owner_idx on public.review_strengths(user_id, product_id, job_id);
create index if not exists review_weaknesses_owner_idx on public.review_weaknesses(user_id, product_id, job_id);
create index if not exists review_problems_owner_idx on public.review_problems(user_id, product_id, job_id);

alter table public.review_analysis_jobs enable row level security;
alter table public.review_analyses enable row level security;
alter table public.review_sources enable row level security;
alter table public.review_observations enable row level security;
alter table public.review_complaints enable row level security;
alter table public.review_strengths enable row level security;
alter table public.review_weaknesses enable row level security;
alter table public.review_problems enable row level security;

grant select, insert, update, delete on public.review_analysis_jobs, public.review_analyses, public.review_sources, public.review_observations, public.review_complaints, public.review_strengths, public.review_weaknesses, public.review_problems to authenticated;

do $$ declare table_name text; begin foreach table_name in array array['review_analysis_jobs','review_analyses','review_sources','review_observations','review_complaints','review_strengths','review_weaknesses','review_problems'] loop execute format('create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid()))) with check ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid())))', 'Users manage ' || table_name, table_name); end loop; end $$;
