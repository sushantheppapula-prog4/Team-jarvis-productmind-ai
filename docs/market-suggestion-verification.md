
## Provider verification

The exact Atlas Desk GDELT DOC request was tested against `https://api.gdeltproject.org/api/v2/doc/doc`. The provider returned HTTP 429 with the response instruction to limit requests to one every five seconds. Clyra must therefore show `RESEARCH TEMPORARILY UNAVAILABLE` for this run and must not synthesize or persist a market recommendation without verified sources.

No market facts, sources, signals, competitor claims, pricing claims, or launch timing were fabricated from the rate-limited response.

## Current code-path evidence

The Market Suggestion route reads the saved product through the ownership-checked `getProduct` action and loads persisted analyses, signals, sources, and recommendations for that product. The `ANALYZE MARKET` button calls the product-scoped `analyzeMarket` server action. That action creates a researching job, calls the GDELT adapter, stops when its status is not `available`, marks the job failed with the provider-unavailable message, and does not call Gemini or persist fabricated analysis data. Source records require title, URL, domain, retrieval time, claim, and optional publication date before persistence.
