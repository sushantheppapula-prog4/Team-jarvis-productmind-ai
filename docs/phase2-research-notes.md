# Clyra Phase 2 research notes

## Research source

GDELT DOC 2.0 provides a public full-text search API for recent news coverage. The documented article-list mode is available at `https://api.gdeltproject.org/api/v2/doc/doc?query=...&mode=artlist&maxrecords=...&timespan=...&sort=datedesc&format=json`. The service can search a rolling recent window and returns article URLs/titles/date metadata that can be retained as evidence. It is suitable as an optional public research source, not as a guarantee of comprehensive market coverage.

## Structured reasoning

Google’s official Gemini structured-output documentation states that a JSON Schema can be supplied so responses adhere to a predictable structure. Clyra should use a server-side request with `response_format`/JSON schema where supported, parse and validate the returned JSON, and refuse to save results when validation fails. The Gemini API key must remain server-side.

## Data security

Supabase’s official RLS documentation recommends enabling RLS on every exposed table, naming the authenticated role explicitly in policies, using `auth.uid()` for ownership checks, and keeping grants aligned with policy operations. Clyra market-analysis tables should therefore use `user_id` and `product_id` ownership policies for select/insert/update/delete, with server-side ownership checks before research jobs run.

## Implementation decision

Use GDELT DOC as an optional no-key research provider so missing or failed research produces an explicit `INSUFFICIENT_DATA`/research-failure state rather than fabricated intelligence. Use Gemini only for structured synthesis of collected product-specific sources. Persist raw source metadata and structured analysis in Supabase. The UI should support explicit ANALYZE MARKET and ANALYZE AGAIN actions and show cached completed analyses without re-researching automatically.

## References

1. https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/ — GDELT DOC 2.0 API Debuts.
2. https://ai.google.dev/gemini-api/docs/structured-output — Gemini structured outputs.
3. https://supabase.com/docs/guides/database/postgres/row-level-security — Supabase Row Level Security.
