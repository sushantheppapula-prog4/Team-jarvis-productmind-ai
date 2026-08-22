export type Evidence = {
  title: string;
  url: string;
  domain: string;
  publication_date?: string | null;
  retrieved_at: string;
  claim: string;
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

function validateEvidence(value: unknown): Evidence {
  if (!value || typeof value !== "object") throw new Error("Invalid evidence record.");
  const item = value as Partial<Evidence>;
  if (!nonEmpty(item.title) || !nonEmpty(item.url) || !/^https?:\/\//i.test(item.url) || !nonEmpty(item.domain) || !nonEmpty(item.retrieved_at) || !nonEmpty(item.claim)) throw new Error("Invalid evidence record.");
  return { title: item.title, url: item.url, domain: item.domain, publication_date: item.publication_date || null, retrieved_at: item.retrieved_at, claim: item.claim };
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

function cleanTerm(value: string | null | undefined) { return (value || "").replace(/["()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120); }
function domainFor(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }

export type ResearchStatus = "available" | "rate_limited" | "unavailable";

export type ResearchResult = {
  provider: "gdelt";
  status: ResearchStatus;
  sources: Evidence[];
  claims: string[];
  retrievedAt: string | null;
  error?: string;
};

export async function researchMarket(product: Record<string, unknown>): Promise<ResearchResult> {
  const terms = [cleanTerm(String(product.name || "")), cleanTerm(String(product.category || "")), cleanTerm(String(product.target_market || "")), cleanTerm(String(product.competitors || ""))].filter(Boolean).slice(0, 4);
  if (!terms.length) return { provider: "gdelt", status: "unavailable", sources: [], claims: [], retrievedAt: null, error: "RESEARCH TEMPORARILY UNAVAILABLE" };
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", `(${terms.map((term) => `"${term}"`).join(" OR ")})`);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("maxrecords", "12");
  url.searchParams.set("timespan", "3months");
  url.searchParams.set("sort", "datedesc");
  url.searchParams.set("format", "json");
  try {
    const response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    if (response.status === 429) return { provider: "gdelt", status: "rate_limited", sources: [], claims: [], retrievedAt: null, error: "RESEARCH TEMPORARILY UNAVAILABLE" };
    if (!response.ok) return { provider: "gdelt", status: "unavailable", sources: [], claims: [], retrievedAt: null, error: `Market research provider returned HTTP ${response.status}.` };
    const raw = await response.text();
    let payload: { articles?: Array<{ title?: string; url?: string; seendate?: string; domain?: string }> };
    try {
      payload = JSON.parse(raw) as { articles?: Array<{ title?: string; url?: string; seendate?: string; domain?: string }> };
    } catch {
      return { provider: "gdelt", status: "unavailable", sources: [], claims: [], retrievedAt: null, error: "RESEARCH TEMPORARILY UNAVAILABLE" };
    }
    const retrievedAt = new Date().toISOString();
    const sources = (payload.articles || []).flatMap((article) => {
      if (!article.url || !article.title || !/^https?:\/\//i.test(article.url)) return [];
      return [validateEvidence({ title: article.title.trim(), url: article.url.trim(), domain: article.domain || domainFor(article.url), publication_date: article.seendate ? String(article.seendate) : null, retrieved_at: retrievedAt, claim: `The source headline reports: ${article.title.trim()}` })];
    }).slice(0, 12);
    if (!sources.length) return { provider: "gdelt", status: "unavailable", sources: [], claims: [], retrievedAt, error: "Insufficient evidence available." };
    return { provider: "gdelt", status: "available", sources, claims: sources.map((source) => source.claim), retrievedAt };
  } catch {
    return { provider: "gdelt", status: "unavailable", sources: [], claims: [], retrievedAt: null, error: "RESEARCH TEMPORARILY UNAVAILABLE" };
  }
}

const responseSchema = {
  type: "object",
  properties: {
    market_readiness: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "INSUFFICIENT DATA"] },
    readiness_reason: { type: "string" }, recommended_launch_window: { type: "string" }, launch_reasoning: { type: "string" }, confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] }, confidence_reason: { type: "string" }, reasoning: { type: "string" },
    key_findings: { type: "array", items: { type: "string" } },
    signals: { type: "array", items: { type: "object", properties: { signal_type: { type: "string" }, rating: { type: "string" }, explanation: { type: "string" }, evidence: { type: "array", items: { type: "string" } } }, required: ["signal_type", "rating", "explanation", "evidence"] } },
    recommendations: { type: "array", items: { type: "object", properties: { recommendation_type: { type: "string", enum: ["opportunity", "risk", "action"] }, priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] }, title: { type: "string" }, detail: { type: "string" }, evidence: { type: "array", items: { type: "string" } } }, required: ["recommendation_type", "priority", "title", "detail", "evidence"] } },
  },
  required: ["market_readiness", "readiness_reason", "recommended_launch_window", "launch_reasoning", "confidence", "confidence_reason", "reasoning", "key_findings", "signals", "recommendations"],
};

export async function synthesizeMarketAnalysis(product: Record<string, unknown>, sources: Evidence[]): Promise<MarketAnalysis> {
  if (!sources.length) throw new Error("Insufficient evidence available.");
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Gemini is not configured for market analysis.");
  const prompt = ["You are Clyra's market intelligence analyst. Produce a cautious, evidence-based report for the supplied product.", "Use only the supplied product details and source records. Do not invent demand, prices, customer statements, competitors, dates, or URLs.", "If the evidence is weak or only consists of headlines, set market_readiness to INSUFFICIENT DATA or LOW, set confidence to LOW, and say so.", "Never guarantee success or claim an exact success date. If seasonality or timing evidence is insufficient, set recommended_launch_window to 'Launch timing recommendation unavailable due to insufficient evidence.'", "Every evidence array must contain only source URLs from the supplied records.", `PRODUCT:\n${JSON.stringify(product, null, 2)}`, `SOURCES:\n${JSON.stringify(sources, null, 2)}`].join("\n\n");
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema } }), cache: "no-store" });
  if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}.`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no structured market analysis.");
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error("Gemini returned invalid structured market analysis."); }
  return validateAnalysis(parsed);
}
