# Clyra Performance Design

## Scope

Performance is a product-scoped downstream intelligence module. It consumes only the authenticated product, the latest completed Market Suggestion analysis, and the latest completed Review Report. It does not generate a score when either dependency is unavailable.

## Dependency gates

The server action authenticates the current user, verifies product ownership, loads the latest completed market analysis for the same user and product, and loads the latest completed review analysis for the same user and product. Missing market intelligence returns `MARKET INTELLIGENCE REQUIRED`; missing review intelligence returns `CUSTOMER INTELLIGENCE REQUIRED`. These states include links back to the prerequisite product routes.

## AI-derived contract

The report is labeled `AI-DERIVED PERFORMANCE ASSESSMENT`, not as a measured business metric. The model receives only product context, persisted market intelligence, and persisted review intelligence. It must not invent sales, revenue, market size, reviews, sources, statistics, or unsupported measurements. If the supplied intelligence is insufficient, it returns `INSUFFICIENT DATA` and no fake score is persisted.

The structured result includes `overall_score` (0–100), `overall_rating` (`EXCELLENT`, `GOOD`, `MODERATE`, `WEAK`, or `CRITICAL`), `overall_reason`, six dimensions (`MARKET_FIT`, `CUSTOMER_SATISFACTION`, `COMPETITIVE_POSITION`, `PRICING_FIT`, `FEATURE_FIT`, `GROWTH_POTENTIAL`) with score/rating/reasoning/supporting intelligence, working areas, weak areas, risks, opportunities, and three recommendations (`immediate`, `short_term`, `strategic`). Every item includes supporting evidence text and source references where available.

## Persistence

The normalized schema uses `performance_analysis_jobs`, `performance_analyses`, `performance_dimensions`, `performance_risks`, `performance_opportunities`, and `performance_recommendations`. Every row carries `user_id` and `product_id`. RLS policies require both authenticated ownership and ownership of the referenced product.

## UI contract

The route title is `05 PERFORMANCE` with the subtitle `How the product is performing against market and customer intelligence.` It preserves the Newsprint shell and contains Overall Performance, Performance Dimensions, What's Working, What's Not Working, Top Risks, Top Opportunities, Recommended Actions, and Evidence sections. A saved report loads on refresh without calling Gemini. `ANALYZE PERFORMANCE` is shown when no report exists and `ANALYZE AGAIN` explicitly starts recalculation when one exists.


## Live migration verification

The Clyra Supabase Table Editor was checked after the attempted execution of `005_performance.sql`. The public schema list shows the existing Market Suggestion and Review Report tables but does not show `performance_analysis_jobs`, `performance_analyses`, `performance_dimensions`, `performance_risks`, `performance_opportunities`, or `performance_recommendations`. Therefore the Performance migration is not confirmed as applied and the live Performance workflow must not be marked complete. The SQL Editor result pane remained stale while the query text changed, so no success claim is made.

The local implementation passes TypeScript and the production build, but database-backed verification is blocked until the migration is successfully executed through a working Supabase connection.

<!-- End live verification note -->
