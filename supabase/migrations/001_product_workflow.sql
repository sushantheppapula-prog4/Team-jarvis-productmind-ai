create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  description text,
  specifications text,
  features text,
  pricing text,
  target_audience text,
  target_market text,
  competitors text,
  planned_launch_date text,
  product_advantages text,
  expected_customer_needs text,
  previous_generation_info text,
  additional_notes text,
  status text not null default 'ready_for_analysis',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued',
  job_type text not null default 'product_analysis',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.product_files enable row level security;
alter table public.product_analysis_jobs enable row level security;

drop policy if exists "Users can manage their own products" on public.products;
create policy "Users can manage their own products" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own product files" on public.product_files;
create policy "Users can manage their own product files" on public.product_files
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own product analysis jobs" on public.product_analysis_jobs;
create policy "Users can manage their own product analysis jobs" on public.product_analysis_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

drop policy if exists "Users can manage their own product files in storage" on storage.objects;
create policy "Users can manage their own product files in storage" on storage.objects
  for all using (bucket_id = 'product-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'product-files' and (storage.foldername(name))[1] = auth.uid()::text);
