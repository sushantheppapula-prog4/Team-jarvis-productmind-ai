export type ReviewSourceType = "review" | "article" | "discussion" | "product page" | "competitor page" | "industry source";
export type ReviewResearchStatus = "AVAILABLE" | "GDELT_RATE_LIMITED" | "NO_REVIEWS_FOUND" | "LIVE_REVIEW_RESEARCH_UNAVAILABLE";
export type LiveReviewSource = { title: string; url: string; domain: string; retrieved_at: string; published_at: string | null; source_type: ReviewSourceType; claim: string; evidence_text: string; is_quote: boolean };

type Candidate = { title: string; url: string; publication_date: string | null; provider: "gdelt" | "google-news"; publisher_url?: string; publisher_name?: string };
function clean(value: unknown) { return String(value || "").replace(/[()\"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100); }
function domainFor(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }
function decode(value: string) { return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">"); }
function stripHtml(html: string) { return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function sourceType(url: string, title: string, productName: string): ReviewSourceType { const value = `${url} ${title}`.toLowerCase(); if (/reddit|forum|discussion|community/.test(value)) return "discussion"; if (/review|rating|customer|complaint|experience/.test(value)) return "review"; if (productName && value.includes(productName.toLowerCase())) return "product page"; return "article"; }
function xmlTag(item: string, name: string) { const match = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i")); return match ? decode(match[1].trim()) : ""; }

async function gdeltCandidates(terms: string[]) {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc"); url.searchParams.set("query", `(${terms.map((term) => `\"${term}\"`).join(" OR ")})`); url.searchParams.set("mode", "artlist"); url.searchParams.set("maxrecords", "12"); url.searchParams.set("timespan", "12months"); url.searchParams.set("sort", "datedesc"); url.searchParams.set("format", "json");
  const response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  if (response.status === 429) throw new Error("GDELT_RATE_LIMITED");
  if (!response.ok) throw new Error(`GDELT_HTTP_${response.status}`);
  const payload = JSON.parse(await response.text()) as { articles?: Array<{ title?: string; url?: string; seendate?: string }> };
  return (payload.articles || []).flatMap((item) => item.title && item.url && /^https?:\/\//i.test(item.url) ? [{ title: item.title.trim(), url: item.url.trim(), publication_date: item.seendate || null, provider: "gdelt" as const }] : []);
}

async function googleNewsCandidates(queries: string[]) {
  const candidates: Candidate[] = [];
  for (const query of queries.slice(0, 10)) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetch(url, { headers: { accept: "application/rss+xml, application/xml, text/xml" }, cache: "no-store" });
    if (!response.ok) continue;
    const xml = await response.text();
    for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
      const item = match[1]; const title = xmlTag(item, "title"); const link = xmlTag(item, "link"); const pub = xmlTag(item, "pubDate"); const source = item.match(/<source[^>]*url=["']([^"']+)["'][^>]*>([\s\S]*?)<\/source>/i);
      const publisherUrl = source ? decode(source[1].trim()) : undefined; const publisherName = source ? decode(source[2].trim()) : undefined;
      if (title && link && /^https?:\/\//i.test(link)) candidates.push({ title, url: link, publication_date: pub && !Number.isNaN(Date.parse(pub)) ? new Date(pub).toISOString() : null, provider: "google-news", publisher_url: publisherUrl, publisher_name: publisherName });
    }
  }
  return candidates;
}

async function validateCandidate(candidate: Candidate, terms: string[], productName: string): Promise<LiveReviewSource | null> {
  try {
    const response = await fetch(candidate.url, { headers: { accept: "text/html,application/xhtml+xml" }, redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(8000) });
    const finalUrl = response.url || candidate.url; const html = response.ok ? await response.text() : ""; const content = stripHtml(html).slice(0, 12000); const lower = content.toLowerCase();
    const relevant = terms.filter(Boolean).some((term) => lower.includes(term.toLowerCase())) || lower.includes(productName.toLowerCase());
    if (response.ok && !/^https?:\/\/(news\.)?google\.|^https?:\/\/consent\.google\./i.test(finalUrl) && relevant && content.length >= 120) {
      const evidenceText = content.slice(0, 600);
      return { title: candidate.title, url: finalUrl, domain: domainFor(finalUrl), retrieved_at: new Date().toISOString(), published_at: candidate.publication_date, source_type: sourceType(finalUrl, `${candidate.title} ${content.slice(0, 1000)}`, productName), claim: `Verified publisher evidence excerpt: ${evidenceText}`, evidence_text: evidenceText, is_quote: false };
    }
    if (candidate.provider === "google-news" && candidate.publisher_url && /^https?:\/\//i.test(candidate.publisher_url) && !/google\./i.test(candidate.publisher_url)) {
      const publisher = await fetch(candidate.publisher_url, { headers: { accept: "text/html,application/xhtml+xml" }, redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(6000) });
      if (publisher.ok) {
        const metadataEvidence = `Google News RSS listed “${candidate.title}” from ${candidate.publisher_name || domainFor(candidate.publisher_url)}. The publisher article URL could not be resolved in this runtime; this source is metadata-level evidence only.`;
        return { title: candidate.title, url: candidate.publisher_url, domain: domainFor(candidate.publisher_url), retrieved_at: new Date().toISOString(), published_at: candidate.publication_date, source_type: sourceType(candidate.publisher_url, candidate.title, productName), claim: metadataEvidence, evidence_text: metadataEvidence, is_quote: false };
      }
    }
    return null;
  } catch { return null; }
}

export async function researchLiveReviews(product: Record<string, unknown>) {
  const name = clean(product.name); const category = clean(product.category); const competitors = clean(product.competitors); const terms = [name, category, competitors].filter(Boolean); if (!terms.length) return { status: "LIVE_REVIEW_RESEARCH_UNAVAILABLE" as const, sources: [] as LiveReviewSource[], failed_sources: 0 };
  const queries = [`${name} review`, `${name} reviews`, `${name} user reviews`, `${name} customer experience`, `${name} problems`, `${name} complaints`, `${name} pros and cons`, `${name} battery review`, `${name} camera review`, `${name} performance review`, `${name} issues`, `${name} long term review`, `${category} customer reviews`, ...(competitors ? competitors.split(/[,;\n]+/).slice(0, 2).map((item) => `${clean(item)} reviews`) : [])];
  let gdelt: Candidate[] = []; let gdeltLimited = false;
  try { gdelt = await gdeltCandidates(terms.concat("customer reviews feedback complaints")); } catch (error) { gdeltLimited = error instanceof Error && error.message === "GDELT_RATE_LIMITED"; }
  let fallback: Candidate[] = []; try { fallback = await googleNewsCandidates(queries); } catch { fallback = []; }
  const candidates = [...gdelt, ...fallback].filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index).slice(0, 36);
  const validated = (await Promise.all(candidates.map((candidate) => validateCandidate(candidate, terms, name)))).filter((value): value is LiveReviewSource => Boolean(value)).filter((source, index, all) => all.findIndex((other) => other.url === source.url) === index).slice(0, 12);
  if (validated.length < 3) return { status: candidates.length === 0 && gdeltLimited ? "LIVE_REVIEW_RESEARCH_UNAVAILABLE" as const : "NO_REVIEWS_FOUND" as const, sources: [] as LiveReviewSource[], failed_sources: candidates.length };
  return { status: "AVAILABLE" as const, sources: validated, failed_sources: candidates.length - validated.length, gdelt_status: gdeltLimited ? "GDELT_RATE_LIMITED" : "AVAILABLE" };
}
