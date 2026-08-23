# Live Clyra database verification

Observed in the Clyra Supabase project `ipsuqiutskpnqgxpestz` on 2026-08-22.

- All 8 Clyra public tables were returned by information_schema.tables.
- RLS verification returned all 8 tables with `rowsecurity = true`.
- Storage verification returned bucket `product-files` with `public = false`.
- Foreign-key verification returned 19 rows. Confirmed product relationships include:
  - product_files.product_id -> products.id
  - product_analysis_jobs.product_id -> products.id
  - market_analysis_jobs.product_id -> products.id
  - market_analyses.job_id -> market_analysis_jobs.id
  - market_analyses.product_id -> products.id
  - market_signals.analysis_id -> market_analyses.id
  - market_signals.product_id -> products.id
  - market_sources.analysis_id -> market_analyses.id
  - market_sources.product_id -> products.id
  - market_recommendations.analysis_id -> market_analyses.id
  - market_recommendations.product_id -> products.id
- User ownership foreign keys to auth.users were also returned for each relevant table; the information_schema join displayed referenced_table as NULL for auth.users because the referenced schema was not selected in the displayed query.

No code or unrelated database objects were modified during verification.

The Supabase SQL Editor foreign-key query visibly returned 19 rows. The screenshot showed links from market analyses to jobs/products, market jobs to products, and signals/sources/recommendations to analyses/products; ownership user_id constraints were also present (the query's referenced-table join displayed NULL for auth.users because referenced schema was omitted).

Local Clyra verification observations:

- Landing route on isolated Clyra server at port 3001 returned HTTP 200 and title `Clyra — AI-Powered Customer Intelligence`.
- TXT parser fixture returned HTTP 200 with extracted Atlas Desk fields.
- CSV parser fixture returned HTTP 200 with extracted Orbit Lamp fields.
- JSON parser fixture returned HTTP 200 with extracted Pulse Kit fields.
- Empty TXT returned HTTP 422 with a readable validation message.
- Invalid JSON returned HTTP 422 with a readable validation message.
- Unsupported `.exe` returned HTTP 415 with a readable validation message.
- A synthetic valid PDF fixture returned HTTP 422. Server log showed `TypeError: Object.defineProperty called on non-object` originating from the `pdf-parse@2.4.5` / `pdfjs-dist` bundle while importing `PDFParse` in `app/api/parse-product/route.ts`. PDF parsing is therefore not PASS in the current local build; no code was changed during verification.

Market research provider verification:

- The exact Clyra GDELT query shape returned HTTP 200 with the provider message: `Queries containing OR'd terms must be surrounded by ().` The current code builds the OR expression without surrounding parentheses.
- A corrected parenthesized request returned HTTP 429 with the provider message requesting no more than one request every 5 seconds. Therefore GDELT is currently rate-limited for this verification session, and the Clyra market-research workflow cannot be marked PASS.
- No workaround or fabricated source was used.
