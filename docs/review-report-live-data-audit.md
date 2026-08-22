# Live-Data Review Report Audit

The current Review Report implementation is product-scoped and server-side, but it is not yet sufficient for the revised live-data requirement.

| Requirement | Current state | Gap |
|---|---|---|
| Saved product context | Implemented through authenticated `products` ownership query | No material gap |
| Live research | One GDELT request with review terms | No provider abstraction and no configured fallback provider |
| GDELT 429 handling | Returns an explicit unavailable state | Does not attempt a fallback provider |
| Source validation | Validates URL shape and GDELT metadata | Does not fetch each page, extract page text, or confirm relevance |
| Source metadata | Title, URL, domain, dates, claim, quote flag | Missing `source_type` and extracted content/evidence provenance |
| Evidence extraction | Delegated to Gemini from candidate headline records | Cannot guarantee evidence came from actual page content |
| Sentiment/findings | Structured schema exists | Must be gated on validated page evidence and source IDs |
| Gemini security | Server-side API key | Synthesis prompt must receive only fetched, validated content and source IDs |
| Persistence | Generic report JSON plus focused jobs/sources/observations/findings | Focused tables exist in local migration but migration is not yet applied to live Supabase |
| Refresh | Reads saved report from Supabase | Depends on successful migration and persistence |
| UI | Newsprint page with explicit no-report state | Needs required live-data wording and staged loading states |

The implementation must therefore add a provider abstraction with search/fetch/extract/validate behavior, a configured fallback that does not rely exclusively on GDELT, actual page fetching and relevance checks, `source_type`, evidence strength, and a hard stop when all providers fail. It must never substitute static review data.

## Live migration execution checkpoint

The Review Report migration SQL was inserted into the confirmed Clyra Supabase SQL Editor and executed. The editor remained in a `Running...` state during the verification snapshot, so the migration is not yet marked successful. A subsequent result check is required before querying the new tables or testing the application flow.

## Definitive live database result

The direct schema verification query returned **0 rows** and the Supabase SQL Editor displayed: `Error: query: Too small: expected string to have >=1 characters`. The Review Report tables therefore cannot be marked applied or verified in the live project. The editor accepted the visible query text but submitted an empty query internally, matching the previously observed SQL Editor failure. No further SQL Editor retries should be made in this session.

## Live schema confirmation

The user-provided screenshot confirms all eight required Review Report tables exist in the confirmed Clyra Supabase project: `review_analysis_jobs`, `review_analyses`, `review_sources`, `review_observations`, `review_complaints`, `review_strengths`, `review_weaknesses`, and `review_problems`.

The SQL Editor currently displays the updated RLS query text but its visible result pane remains stale from the preceding eight-row table-name query. The migration itself enables RLS on all eight tables and creates ownership policies; a fresh result pane or Table Editor inspection is still needed for an independently displayed RLS result.
