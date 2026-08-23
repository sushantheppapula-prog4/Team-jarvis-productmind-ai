create table if not exists public.product_intelligence_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  module text not null check (module in ('review','scalability','improvements','suggestions','continuous','agent')),
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, module)
);

create table if not exists public.product_report_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  frequency text not null check (frequency in ('daily','weekly','monthly','custom')),
  custom_interval text,
  active boolean not null default true,
  last_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists product_intelligence_reports_owner_idx on public.product_intelligence_reports(user_id, product_id, module);
create index if not exists product_report_schedules_owner_idx on public.product_report_schedules(user_id, product_id);

alter table public.product_intelligence_reports enable row level security;
alter table public.product_report_schedules enable row level security;

grant select, insert, update, delete on public.product_intelligence_reports, public.product_report_schedules to authenticated;

create policy "Users manage their intelligence reports" on public.product_intelligence_reports for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid()))) with check ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid())));
create policy "Users manage their report schedules" on public.product_report_schedules for all to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid()))) with check ((select auth.uid()) = user_id and exists (select 1 from public.products p where p.id = product_id and p.user_id = (select auth.uid())));
