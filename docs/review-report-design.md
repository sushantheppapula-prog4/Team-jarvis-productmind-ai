# Review Report Design Contract

## Evidence states

The review workflow has explicit states: `NO_ANALYSIS`, `COLLECTING_REVIEWS`, `ANALYZING_SENTIMENT`, `IDENTIFYING_PROBLEMS`, `SAVING_REPORT`, `COMPLETE`, `INSUFFICIENT_REVIEW_DATA`, `RESEARCH_PROVIDER_UNAVAILABLE`, and `ERROR`.

`RESEARCH_PROVIDER_UNAVAILABLE` is reserved for provider HTTP 429/5xx, timeout, invalid response, or provider failure. `NO_REVIEWS_FOUND` / `INSUFFICIENT_REVIEW_DATA` is used only when the provider responds successfully but returns no valid review evidence. No report containing invented reviews, quotes, ratings, percentages, URLs, dates, or customer opinions may be persisted.

## Source record

Each retained source must have `title`, `url`, `domain`, `published_at` when available, `retrieved_at`, `claim`, and `is_quote`. URLs must be absolute HTTP(S) URLs. Source records are the only evidence references passed to Gemini.

## Observation record

Each review observation has `source_index`, `sentiment` (`POSITIVE`, `NEUTRAL`, `NEGATIVE`, or `MIXED`), `topic`, `claim`, `evidence`, and optional `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`).

## Synthesis record

The validated synthesis contains `overall_sentiment`, optional percentages only when there is sufficient evidence, `positive_themes`, `negative_themes`, `emerging_themes`, `complaints`, `strengths`, `weaknesses`, `problems`, and `competitor_comparison`. Every synthesis item contains evidence/source indexes. Problems explicitly classify the issue as `USER_PREFERENCE`, `USABILITY_ISSUE`, `PRODUCT_DEFECT`, or `SERVICE_ISSUE` and must include root evidence, user impact, severity, and supporting source indexes.

## Persistence

The existing `product_intelligence_reports` table is reused for the top-level validated report to avoid duplicate generic report storage. A focused review migration adds `review_analysis_jobs` and normalized child tables for sources, observations, complaints, strengths, weaknesses, and problems. Every row is product-scoped, user-scoped, protected by RLS, and written only after the authenticated product ownership check.

## Provider

The provider uses the existing fetch-based research architecture with a review-specific query. Search results are treated as candidate evidence only; the server validates URLs and required metadata before retaining them. A successful empty result is distinct from a provider error. Gemini is server-side only and receives product context plus validated evidence and observations, never raw untrusted instructions.

## UI

The existing Newsprint/editorial shell is preserved. The Review Report page displays `04 REVIEW REPORT`, `CUSTOMER EVIDENCE / PRODUCT INTELLIGENCE`, the required sections, explicit failure states, `ANALYZE REVIEWS`, and `ANALYZE AGAIN`. Saved Supabase state is loaded on page render; no localStorage is used as source of truth.
