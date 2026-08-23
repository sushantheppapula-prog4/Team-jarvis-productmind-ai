-- Add the approved Next Generation module to the existing shared intelligence report constraint.
alter table public.product_intelligence_reports drop constraint if exists product_intelligence_reports_module_check;
alter table public.product_intelligence_reports add constraint product_intelligence_reports_module_check check (module in ('review','scalability','improvements','suggestions','next-generation','continuous','agent'));
