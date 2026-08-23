export type Evidence = {
  title: string;
  url: string;
  domain: string;
  publication_date?: string | null;
  retrieved_at: string;
  claim: string;
  evidence_text?: string;
};

export type MarketSignal = {
  signal_type: "MARKET DEMAND" | "COMPETITION" | "CUSTOMER INTEREST" | "MARKET TREND" | "MARKET GAP" | "PRICING FIT";
  rating: string;
  explanation: string;
  evidence: string[];
};

export type Recommendation = {
  recommendation_type: "opportunity" | "risk" | "action";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  detail: string;
  evidence: string[];
};

export type MarketAnalysis = {
  market_readiness: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT DATA";
  readiness_reason: string;
  recommended_launch_window: string;
  launch_reasoning: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidence_reason: string;
  reasoning: string;
  key_findings: string[];
  signals: MarketSignal[];
  recommendations: Recommendation[];
};

function nonEmpty(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function domainFor(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }
function cleanTerm(value: string | null | undefined) { return (value || "").replace(/["()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120); }
function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function decodeXml(value: string) { return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">" ).replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(); }
function xmlField(xml: string, tag: string) { const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i")); return match ? decodeXml(match[1]) : ""; }
function stripHtml(value: string) { return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }

function validateEvidence(value: unknown): Evidence {
  if (!value || typeof value !== "object") throw new Error("Invalid evidence record.");
  const item = value as Partial<Evidence>;
  if (!nonEmpty(item.title) || !nonEmpty(item.url) || !/^https?:\/\//i.test(item.url) || !nonEmpty(item.domain) || !nonEmpty(item.retrieved_at) || !nonEmpty(item.claim)) throw new Error("Invalid evidence record.");
  return { title: item.title, url: item.url, domain: item.domain, publication_date: item.publication_date || null, retrieved_at: item.retrieved_at, claim: item.claim, evidence_text: item.evidence_text || item.claim };
}

function validateAnalysis(value: unknown): MarketAnalysis {
  if (!value || typeof value !== "object") throw new Error("Gemini returned an invalid market analysis.");
  const item = value as Partial<MarketAnalysis>;
  const readiness = ["HIGH", "MEDIUM", "LOW", "INSUFFICIENT DATA"];
  const confidence = ["HIGH", "MEDIUM", "LOW"];
  if (!readiness.includes(String(item.market_readiness)) || !confidence.includes(String(item.confidence)) || !nonEmpty(item.readiness_reason) || !nonEmpty(item.recommended_launch_window) || !nonEmpty(item.launch_reasoning) || !nonEmpty(item.confidence_reason) || !nonEmpty(item.reasoning) || !Array.isArray(item.key_findings) || item.key_findings.length < 1 || !item.key_findings.every(nonEmpty) || !Array.isArray(item.signals) || !Array.isArray(item.recommendations)) throw new Error("Gemini returned an incomplete market analysis.");
  const signals = item.signals.map((signal) => {
    if (!signal || typeof signal !== "object") throw new Error("Gemini returned an invalid market signal.");
    const row = signal as Partial<MarketSignal>;
    if (!nonEmpty(row.signal_type) || !nonEmpty(row.rating) || !nonEmpty(row.explanation) || !Array.isArray(row.evidence) || !row.evidence.every(nonEmpty)) throw new Error("Gemini returned an invalid market signal.");
    return { signal_type: row.signal_type as MarketSignal["signal_type"], rating: row.rating, explanation: row.explanation, evidence: row.evidence };
  });
  const recommendations = item.recommendations.map((recommendation) => {
    if (!recommendation || typeof recommendation !== "object") throw new Error("Gemini returned an invalid recommendation.");
    const row = recommendation as Partial<Recommendation>;
    if (!["opportunity", "risk", "action"].includes(String(row.recommendation_type)) || !["HIGH", "MEDIUM", "LOW"].includes(String(row.priority)) || !nonEmpty(row.title) || !nonEmpty(row.detail) || !Array.isArray(row.evidence) || !row.evidence.every(nonEmpty)) throw new Error("Gemini returned an invalid recommendation.");
    return { recommendation_type: row.recommendation_type as Recommendation["recommendation_type"], priority: row.priority as Recommendation["priority"], title: row.title, detail: row.detail, evidence: row.evidence };
  });
  return { market_readiness: item.market_readiness as MarketAnalysis["market_readiness"], readiness_reason: item.readiness_reason, recommended_launch_window: item.recommended_launch_window, launch_reasoning: item.launch_reasoning, confidence: item.confidence as MarketAnalysis["confidence"], confidence_reason: item.confidence_reason, reasoning: item.reasoning, key_findings: item.key_findings.slice(0, 5), signals, recommendations };
}

export type ResearchStatus = "available" | "rate_limited" | "unavailable";
export type ResearchProvider = "gdelt" | "google_news_rss";
export type ResearchResult = { provider: ResearchProvider; status: ResearchStatus; sources: Evidence[]; claims: string[]; retrievedAt: string | null; error?: string };

async function fetchPublisherEvidence(title: string, candidateUrl: string, publisherUrl: string | null, publicationDate: string | null, retrievedAt: string, terms: string[]): Promise<Evidence | null> {
  if (!/^https?:\/\//i.test(candidateUrl)) return null;
  try {
    const response = await fetch(candidateUrl, { headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Clyra/1.0 research validation" }, redirect: "follow", cache: "no-store" });
    if (!response.ok) return null;
    const finalUrl = response.url;
    const finalDomain = domainFor(finalUrl);
    if (finalDomain === "news.google.com") {
      if (!publisherUrl || !/^https?:\/\//i.test(publisherUrl)) return null;
      const publisherResponse = await fetch(publisherUrl, { headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Clyra/1.0 research validation" }, redirect: "follow", cache: "no-store" });
      if (!publisherResponse.ok) return null;
      const publisherText = stripHtml(await publisherResponse.text()).slice(0, 12000);
      if (!publisherText) return null;
      const claim = `The live Google News result from ${finalDomainFor(publisherUrl)} is titled: ${title}`;
      return validateEvidence({ title, url: publisherUrl, domain: domainFor(publisherUrl), publication_date: publicationDate, retrieved_at: retrievedAt, claim, evidence_text: `${title}. Publisher page text was retrieved from ${publisherUrl}.` });
    }
    const text = stripHtml(await response.text()).slice(0, 18000);
    if (!text) return null;
    const haystack = `${title} ${text}`.toLowerCase();
    const relevant = terms.some((term) => term.length >= 3 && haystack.includes(term.toLowerCase())) || haystack.includes(finalDomain.toLowerCase());
    if (!relevant) return null;
    const claim = `The publisher page reports: ${title}`;
    return validateEvidence({ title, url: finalUrl, domain: finalDomain, publication_date: publicationDate, retrieved_at: retrievedAt, claim, evidence_text: text.slice(0, 2000) });
  } catch { return null; }
}

function finalDomainFor(url: string) { return domainFor(url); }

async function researchGoogleNews(terms: string[], gdeltError: string): Promise<ResearchResult> {
  const query = terms.map((term) => `"${term}"`).join(" OR ");
  const rssUrl = new URL("https://news.google.com/rss/search");
  rssUrl.searchParams.set("q", query);
  rssUrl.searchParams.set("hl", "en-US"); rssUrl.searchParams.set("gl", "US"); rssUrl.searchParams.set("ceid", "US:en");
  const retrievedAt = new Date().toISOString();
  try {
    const response = await fetch(rssUrl, { headers: { accept: "application/rss+xml, application/xml", "user-agent": "Clyra/1.0 research" }, cache: "no-store" });
    if (!response.ok) return { provider: "google_news_rss", status: "unavailable", sources: [], claims: [], retrievedAt, error: `LIVE MARKET RESEARCH UNAVAILABLE (GDELT ${gdeltError}; Google News RSS HTTP ${response.status})` };
    const xml = await response.text();
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    const sources: Evidence[] = [];
    for (const item of itemMatches.slice(0, 18)) {
      const title = xmlField(item, "title"); const link = xmlField(item, "link"); const publicationDate = xmlField(item, "pubDate") || null;
      const sourceMatch = item.match(/<source(?:\s+url=["']([^"']+)["'])?>([\s\S]*?)<\/source>/i);
      const publisherUrl = sourceMatch?.[1] ? decodeXml(sourceMatch[1]) : null;
      if (!title || !link) continue;
      const evidence = await fetchPublisherEvidence(title, link, publisherUrl, publicationDate, retrievedAt, terms);
      if (evidence) sources.push(evidence);
      if (sources.length >= 12) break;
    }
    if (!sources.length) return { provider: "google_news_rss", status: "unavailable", sources: [], claims: [], retrievedAt, error: `LIVE MARKET RESEARCH UNAVAILABLE (GDELT ${gdeltError}; Google News RSS returned no validated publisher evidence)` };
    return { provider: "google_news_rss", status: "available", sources, claims: sources.map((source) => source.claim), retrievedAt, error: `GDELT ${gdeltError}; Google News RSS fallback used.` };
  } catch { return { provider: "google_news_rss", status: "unavailable", sources: [], claims: [], retrievedAt: null, error: `LIVE MARKET RESEARCH UNAVAILABLE (GDELT ${gdeltError}; Google News RSS request failed)` }; }
}

export async function researchMarket(product: Record<string, unknown>): Promise<ResearchResult> {
  const terms = [String(product.name || ""), String(product.category || ""), String(product.target_market || ""), String(product.competitors || "")].map(cleanTerm).filter(Boolean).slice(0, 4);
  if (!terms.length) return { provider: "gdelt", status: "unavailable", sources: [], claims: [], retrievedAt: null, error: "LIVE MARKET RESEARCH UNAVAILABLE" };
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", `(${terms.map((term) => `"${term}"`).join(" OR ")})`); url.searchParams.set("mode", "artlist"); url.searchParams.set("maxrecords", "12"); url.searchParams.set("timespan", "3months"); url.searchParams.set("sort", "datedesc"); url.searchParams.set("format", "json");
  try {
    const response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    if (response.status === 429) return researchGoogleNews(terms, "GDELT_RATE_LIMITED");
    if (!response.ok) return researchGoogleNews(terms, `GDELT_HTTP_${response.status}`);
    const payload = JSON.parse(await response.text()) as { articles?: Array<{ title?: string; url?: string; seendate?: string; domain?: string }> };
    const retrievedAt = new Date().toISOString();
    const sources: Evidence[] = [];
    for (const article of payload.articles || []) {
      if (!article.url || !article.title) continue;
      const evidence = await fetchPublisherEvidence(article.title.trim(), article.url.trim(), null, article.seendate ? String(article.seendate) : null, retrievedAt, terms);
      if (evidence) sources.push(evidence);
      if (sources.length >= 12) break;
    }
    if (!sources.length) return researchGoogleNews(terms, "GDELT_NO_VALIDATED_EVIDENCE");
    return { provider: "gdelt", status: "available", sources, claims: sources.map((source) => source.claim), retrievedAt };
  } catch { return researchGoogleNews(terms, "GDELT_REQUEST_FAILED"); }
}

const responseSchema = {
  type: "object", properties: {
    market_readiness: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "INSUFFICIENT DATA"] }, readiness_reason: { type: "string" }, recommended_launch_window: { type: "string" }, launch_reasoning: { type: "string" }, confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] }, confidence_reason: { type: "string" }, reasoning: { type: "string" }, key_findings: { type: "array", items: { type: "string" } },
    signals: { type: "array", items: { type: "object", properties: { signal_type: { type: "string" }, rating: { type: "string" }, explanation: { type: "string" }, evidence: { type: "array", items: { type: "string" } } }, required: ["signal_type", "rating", "explanation", "evidence"] } },
    recommendations: { type: "array", items: { type: "object", properties: { recommendation_type: { type: "string", enum: ["opportunity", "risk", "action"] }, priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] }, title: { type: "string" }, detail: { type: "string" }, evidence: { type: "array", items: { type: "string" } } }, required: ["recommendation_type", "priority", "title", "detail", "evidence"] } },
  }, required: ["market_readiness", "readiness_reason", "recommended_launch_window", "launch_reasoning", "confidence", "confidence_reason", "reasoning", "key_findings", "signals", "recommendations"],
};

function classifyGeminiError(status: number) {
  if (status === 401 || status === 403) return "GEMINI_AUTH_ERROR";
  if (status === 404) return "GEMINI_MODEL_ERROR";
  if (status === 429) return "GEMINI_RATE_LIMIT";
  if (status >= 500) return "GEMINI_ENDPOINT_ERROR";
  return "GEMINI_ENDPOINT_ERROR";
}

export async function synthesizeMarketAnalysis(product: Record<string, unknown>, sources: Evidence[]): Promise<MarketAnalysis> {
  if (!sources.length) throw new Error("Insufficient evidence available.");
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Gemini is not configured for market analysis.");
  const prompt = ["You are Clyra's market intelligence analyst. Produce a cautious, evidence-based report for the supplied product.", "Use only the supplied product details and source records. Do not invent demand, prices, customer statements, competitors, dates, or URLs.", "If the evidence is weak or only consists of headlines, set market_readiness to INSUFFICIENT DATA or LOW, set confidence to LOW, and say so.", "Never guarantee success or claim an exact success date. If seasonality or timing evidence is insufficient, set recommended_launch_window to 'Launch timing recommendation unavailable due to insufficient evidence.'", "Every evidence array must contain only source URLs from the supplied records.", `PRODUCT:\n${JSON.stringify(product, null, 2)}`, `SOURCES:\n${JSON.stringify(sources, null, 2)}`].join("\n\n");
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema } }), cache: "no-store" });
  if (!response.ok) {
    const providerBody = (await response.text()).slice(0, 240).replace(/\s+/g, " ");
    throw new Error(`${classifyGeminiError(response.status)}: Gemini returned HTTP ${response.status}${providerBody ? ` — ${providerBody}` : ""}`);
  }
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("GEMINI_INVALID_RESPONSE: Gemini returned no structured market analysis.");
  let parsed: unknown; try { parsed = JSON.parse(text); } catch { throw new Error("GEMINI_INVALID_RESPONSE: Gemini returned invalid structured market analysis."); }
  return validateAnalysis(parsed);
}
