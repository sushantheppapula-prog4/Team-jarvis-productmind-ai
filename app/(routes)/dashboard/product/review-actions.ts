"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { researchLiveReviews } from "@/lib/review-research";

type ReviewStatus = "NO_ANALYSIS" | "COLLECTING_REVIEWS" | "ANALYZING_SENTIMENT" | "IDENTIFYING_PROBLEMS" | "SAVING_REPORT" | "COMPLETE" | "INSUFFICIENT_REVIEW_DATA" | "RESEARCH_PROVIDER_UNAVAILABLE" | "ERROR";
type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Classification = "USER_PREFERENCE" | "USABILITY_ISSUE" | "PRODUCT_DEFECT" | "SERVICE_ISSUE";

export type ReviewSource = { title: string; url: string; domain: string; published_at: string | null; retrieved_at: string; source_type?: string; claim: string; evidence_text?: string; is_quote: boolean };
export type ReviewObservation = { source_index: number; sentiment: Sentiment; topic: string; claim: string; evidence: string; severity?: Severity };
export type ReviewFinding = { kind: "COMPLAINT" | "STRENGTH" | "WEAKNESS" | "PROBLEM" | "COMPETITOR_COMPARISON"; title: string; detail: string; impact?: string; severity?: Severity; classification?: Classification; source_indexes: number[] };
export type ReviewReport = { title: string; status: ReviewStatus; summary: string; overall_sentiment: string; sentiment_percentages?: { positive: number; neutral: number; negative: number }; positive_themes: string[]; negative_themes: string[]; emerging_themes: string[]; observations: ReviewObservation[]; complaints: ReviewFinding[]; strengths: ReviewFinding[]; weaknesses: ReviewFinding[]; problems: ReviewFinding[]; competitor_comparison: ReviewFinding[]; customer_needs: string[]; feature_requests: string[]; recommended_actions: string[]; sources: ReviewSource[]; generated_at: string };

function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function domainFor(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }
function clean(value: unknown) { return String(value || "").replace(/[()\"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100); }

async function researchReviews(product: Record<string, unknown>) {
  const terms = [clean(product.name), clean(product.category), clean(product.target_market), "customer reviews feedback complaints"] .filter(Boolean).slice(0, 4);
  if (!terms.length) return { status: "RESEARCH_PROVIDER_UNAVAILABLE" as const, sources: [] as ReviewSource[], error: "REVIEW RESEARCH TEMPORARILY UNAVAILABLE" };
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", `(${terms.map((term) => `\"${term}\"`).join(" OR ")})`);
  url.searchParams.set("mode", "artlist"); url.searchParams.set("maxrecords", "20"); url.searchParams.set("timespan", "12months"); url.searchParams.set("sort", "datedesc"); url.searchParams.set("format", "json");
  try {
    const response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
    if (response.status === 429 || response.status >= 500) return { status: "RESEARCH_PROVIDER_UNAVAILABLE" as const, sources: [] as ReviewSource[], error: "REVIEW RESEARCH TEMPORARILY UNAVAILABLE" };
    if (!response.ok) return { status: "RESEARCH_PROVIDER_UNAVAILABLE" as const, sources: [] as ReviewSource[], error: `Review provider returned HTTP ${response.status}.` };
    const payload = JSON.parse(await response.text()) as { articles?: Array<{ title?: string; url?: string; domain?: string; seendate?: string }> };
    const retrieved = new Date().toISOString();
    const sources = (payload.articles || []).flatMap((article) => {
      if (!text(article.title) || !text(article.url) || !/^https?:\/\//i.test(article.url)) return [];
      return [{ title: article.title.trim(), url: article.url.trim(), domain: article.domain || domainFor(article.url), published_at: article.seendate || null, retrieved_at: retrieved, claim: `Candidate public evidence source: ${article.title.trim()}`, is_quote: false }];
    }).slice(0, 20);
    return sources.length ? { status: "AVAILABLE" as const, sources } : { status: "NO_REVIEWS_FOUND" as const, sources: [] as ReviewSource[], error: "NO REVIEWS FOUND" };
  } catch { return { status: "RESEARCH_PROVIDER_UNAVAILABLE" as const, sources: [] as ReviewSource[], error: "REVIEW RESEARCH TEMPORARILY UNAVAILABLE" }; }
}

function validateFinding(value: unknown): ReviewFinding {
  if (!value || typeof value !== "object") throw new Error("Invalid review finding.");
  const item = value as Partial<ReviewFinding>;
  if (!["COMPLAINT", "STRENGTH", "WEAKNESS", "PROBLEM", "COMPETITOR_COMPARISON"].includes(String(item.kind)) || !text(item.title) || !text(item.detail) || !Array.isArray(item.source_indexes) || !item.source_indexes.every((x) => Number.isInteger(x) && x >= 0)) throw new Error("Invalid review finding.");
  if (item.kind === "PROBLEM" && !["USER_PREFERENCE", "USABILITY_ISSUE", "PRODUCT_DEFECT", "SERVICE_ISSUE"].includes(String(item.classification))) throw new Error("Review problem classification is required.");
  return { kind: item.kind as ReviewFinding["kind"], title: item.title, detail: item.detail, impact: text(item.impact) ? item.impact : undefined, severity: item.severity as Severity | undefined, classification: item.classification as Classification | undefined, source_indexes: item.source_indexes };
}

function validateReport(value: unknown, sources: ReviewSource[]): ReviewReport {
  if (!value || typeof value !== "object") throw new Error("Gemini returned an invalid review report.");
  const item = value as Partial<ReviewReport>;
  if (!text(item.summary) || !text(item.overall_sentiment) || !Array.isArray(item.observations) || !Array.isArray(item.complaints) || !Array.isArray(item.strengths) || !Array.isArray(item.weaknesses) || !Array.isArray(item.problems) || !Array.isArray(item.competitor_comparison)) throw new Error("Gemini returned an incomplete review report.");
  const observations = item.observations.map((raw) => { const row = raw as Partial<ReviewObservation>; if (!Number.isInteger(row.source_index) || Number(row.source_index) < 0 || Number(row.source_index) >= sources.length || !["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED"].includes(String(row.sentiment)) || !text(row.topic) || !text(row.claim) || !text(row.evidence)) throw new Error("Invalid review observation."); return { source_index: Number(row.source_index), sentiment: row.sentiment as Sentiment, topic: row.topic, claim: row.claim, evidence: row.evidence, severity: row.severity as Severity | undefined }; });
  const findings = [...item.complaints, ...item.strengths, ...item.weaknesses, ...item.problems, ...item.competitor_comparison].map(validateFinding);
  if (findings.some((finding) => finding.source_indexes.some((index) => index >= sources.length))) throw new Error("Review finding references an unknown source.");
  const percentages = item.sentiment_percentages;
  if (percentages && (!Number.isFinite(percentages.positive) || !Number.isFinite(percentages.neutral) || !Number.isFinite(percentages.negative) || percentages.positive < 0 || percentages.neutral < 0 || percentages.negative < 0 || percentages.positive + percentages.neutral + percentages.negative > 100.01)) throw new Error("Invalid sentiment percentages.");
  return { title: "04 REVIEW REPORT", status: "COMPLETE", summary: item.summary, overall_sentiment: item.overall_sentiment, sentiment_percentages: percentages, positive_themes: (item.positive_themes || []).filter(text), negative_themes: (item.negative_themes || []).filter(text), emerging_themes: (item.emerging_themes || []).filter(text), observations, complaints: findings.filter((x) => x.kind === "COMPLAINT"), strengths: findings.filter((x) => x.kind === "STRENGTH"), weaknesses: findings.filter((x) => x.kind === "WEAKNESS"), problems: findings.filter((x) => x.kind === "PROBLEM"), competitor_comparison: findings.filter((x) => x.kind === "COMPETITOR_COMPARISON"), customer_needs: (item.customer_needs || []).filter(text), feature_requests: (item.feature_requests || []).filter(text), recommended_actions: (item.recommended_actions || []).filter(text), sources, generated_at: new Date().toISOString() };
}

const responseSchema = { type: "object", properties: { summary: { type: "string" }, overall_sentiment: { type: "string" }, sentiment_percentages: { type: "object", properties: { positive: { type: "number" }, neutral: { type: "number" }, negative: { type: "number" } } }, positive_themes: { type: "array", items: { type: "string" } }, negative_themes: { type: "array", items: { type: "string" } }, emerging_themes: { type: "array", items: { type: "string" } }, customer_needs: { type: "array", items: { type: "string" } }, feature_requests: { type: "array", items: { type: "string" } }, recommended_actions: { type: "array", items: { type: "string" } }, observations: { type: "array", items: { type: "object", properties: { source_index: { type: "integer" }, sentiment: { type: "string" }, topic: { type: "string" }, claim: { type: "string" }, evidence: { type: "string" }, severity: { type: "string" } }, required: ["source_index", "sentiment", "topic", "claim", "evidence"] } }, complaints: { type: "array", items: { type: "object" } }, strengths: { type: "array", items: { type: "object" } }, weaknesses: { type: "array", items: { type: "object" } }, problems: { type: "array", items: { type: "object" } }, competitor_comparison: { type: "array", items: { type: "object" } } }, required: ["summary", "overall_sentiment", "positive_themes", "negative_themes", "emerging_themes", "customer_needs", "feature_requests", "recommended_actions", "observations", "complaints", "strengths", "weaknesses", "problems", "competitor_comparison"] };

async function synthesize(product: Record<string, unknown>, sources: ReviewSource[]) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("Gemini is not configured for review analysis.");
  const prompt = ["You are Clyra's evidence-bound customer review analyst.", "Use ONLY the saved product and validated source records below. Candidate sources may be articles rather than reviews: create observations only when the source materially contains customer feedback. Never invent reviews, quotes, ratings, counts, percentages, dates, URLs, competitors, or customer opinions. If evidence is insufficient, return empty finding arrays and explain the limitation. Every source_index must refer to the supplied array. Do not turn user preference into a product defect; classify problems as USER_PREFERENCE, USABILITY_ISSUE, PRODUCT_DEFECT, or SERVICE_ISSUE.", `PRODUCT:\n${JSON.stringify(product)}`, `SOURCES:\n${JSON.stringify(sources)}`].join("\n\n");
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema } }), cache: "no-store" });
  if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}.`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned no structured review report.");
  return validateReport(JSON.parse(raw), sources);
}

async function context(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).eq("user_id", user.id).maybeSingle();
  if (error || !product) throw new Error("Product not found.");
  return { supabase, user, product };
}

export async function getReviewReport(productId: string) {
  const { supabase } = await context(productId);
  const { data } = await supabase.from("product_intelligence_reports").select("report").eq("product_id", productId).eq("module", "review").maybeSingle();
  return (data?.report as ReviewReport | null) || null;
}

export async function analyzeReviews(productId: string) {
  const { supabase, user, product } = await context(productId);
  const job = await supabase.from("review_analysis_jobs").insert({ user_id: user.id, product_id: productId, status: "COLLECTING_REVIEWS" }).select("id").single();
  if (job.error || !job.data) throw new Error("Review Report migration is not applied.");
  const jobId = job.data.id;
  const update = async (status: ReviewStatus, error_message?: string) => { await supabase.from("review_analysis_jobs").update({ status, error_message: error_message || null, completed_at: ["COMPLETE", "INSUFFICIENT_REVIEW_DATA", "RESEARCH_PROVIDER_UNAVAILABLE", "ERROR"].includes(status) ? new Date().toISOString() : null }).eq("id", jobId).eq("user_id", user.id).eq("product_id", productId); };
  const research = await researchLiveReviews(product);
  if (research.status === "LIVE_REVIEW_RESEARCH_UNAVAILABLE") { const message = "error" in research && research.error ? research.error : "LIVE REVIEW RESEARCH UNAVAILABLE"; await update("RESEARCH_PROVIDER_UNAVAILABLE", message); return { report: null, status: "RESEARCH_PROVIDER_UNAVAILABLE" as const, message: `LIVE REVIEW RESEARCH UNAVAILABLE — ${message}` }; }
  if (research.status === "NO_REVIEWS_FOUND") { const message = "error" in research && research.error ? research.error : "NO REVIEWS FOUND"; await update("INSUFFICIENT_REVIEW_DATA", message); return { report: null, status: "INSUFFICIENT_REVIEW_DATA" as const, message: `INSUFFICIENT LIVE REVIEW EVIDENCE — ${message}` }; }
  await update("ANALYZING_SENTIMENT");
  let report: ReviewReport;
  try { report = await synthesize(product, research.sources); } catch (error) { const message = error instanceof Error ? error.message : "Review synthesis failed."; await update("ERROR", message); return { report: null, status: "ERROR" as const, message }; }
  await update("IDENTIFYING_PROBLEMS"); await update("SAVING_REPORT");
  const saved = await supabase.from("product_intelligence_reports").upsert({ user_id: user.id, product_id: productId, module: "review", report }, { onConflict: "user_id,product_id,module" });
  if (saved.error) { await update("ERROR", "Unable to save Review Report."); throw new Error("Unable to save Review Report."); }
  const sourceRows = research.sources.map((source) => ({ job_id: jobId, user_id: user.id, product_id: productId, title: source.title, url: source.url, domain: source.domain, publication_date: source.published_at, retrieved_at: source.retrieved_at, claim: source.claim, evidence_text: source.evidence_text || source.claim, is_quote: source.is_quote, source_type: source.source_type }));
  const insertedSources = await supabase.from("review_sources").insert(sourceRows).select("id");
  if (insertedSources.error) throw new Error("Unable to save review sources.");
  const sourceIds = (insertedSources.data || []).map((row) => row.id as string);
  const observations = report.observations.map((row) => ({ job_id: jobId, user_id: user.id, product_id: productId, source_id: sourceIds[row.source_index], sentiment: row.sentiment, topic: ["QUALITY","PRICE","DESIGN","PERFORMANCE","RELIABILITY","USABILITY","FEATURES","ASSEMBLY","SUPPORT","OTHER"].includes(row.topic) ? row.topic : "OTHER", claim: row.claim, evidence_text: row.evidence, evidence_strength: "SUPPORTED" }));
  if (observations.length && (await supabase.from("review_observations").insert(observations)).error) throw new Error("Unable to save review observations.");
  if ((await supabase.from("review_analyses").insert({ job_id: jobId, user_id: user.id, product_id: productId, report })).error) throw new Error("Unable to save review analysis.");
  const ids = (row: ReviewFinding) => row.source_indexes.map((index) => sourceIds[index]).filter(Boolean);
  const complaints = report.complaints.map((row) => ({ job_id: jobId, user_id: user.id, product_id: productId, complaint: row.title, topic: row.title, severity: row.severity || "MEDIUM", evidence: row.detail, source_ids: ids(row) }));
  const strengths = report.strengths.map((row) => ({ job_id: jobId, user_id: user.id, product_id: productId, strength: row.title, reason: row.detail, evidence: row.detail, source_ids: ids(row) }));
  const weaknesses = report.weaknesses.map((row) => ({ job_id: jobId, user_id: user.id, product_id: productId, weakness: row.title, evidence: row.detail, impact: row.impact || row.detail, severity: row.severity || "MEDIUM", source_ids: ids(row) }));
  const problems = report.problems.map((row) => ({ job_id: jobId, user_id: user.id, product_id: productId, problem: row.title, root_evidence: row.detail, user_impact: row.impact || row.detail, severity: row.severity || "MEDIUM", classification: row.classification || "USABILITY_ISSUE", evidence_strength: "REPEATED_SIGNAL", source_ids: ids(row) }));
  if (complaints.length && (await supabase.from("review_complaints").insert(complaints)).error) throw new Error("Unable to save review complaints.");
  if (strengths.length && (await supabase.from("review_strengths").insert(strengths)).error) throw new Error("Unable to save review strengths.");
  if (weaknesses.length && (await supabase.from("review_weaknesses").insert(weaknesses)).error) throw new Error("Unable to save review weaknesses.");
  if (problems.length && (await supabase.from("review_problems").insert(problems)).error) throw new Error("Unable to save review problems.");
  await update("COMPLETE");
  revalidatePath(`/dashboard/product/${productId}/review-report`);
  return { report, status: "COMPLETE" as const, message: "COMPLETE" };
}
