"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { researchLiveReviews } from "@/lib/review-research";

type ReviewStatus = "NO_ANALYSIS" | "COLLECTING_REVIEWS" | "ANALYZING_SENTIMENT" | "IDENTIFYING_PROBLEMS" | "SAVING_REPORT" | "COMPLETE" | "INSUFFICIENT_REVIEW_DATA" | "RESEARCH_PROVIDER_UNAVAILABLE" | "ERROR";
type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Classification = "USER_PREFERENCE" | "USABILITY_ISSUE" | "PRODUCT_DEFECT" | "SERVICE_ISSUE";

export type ReviewSource = { title: string; url: string; domain: string; published_at: string | null; retrieved_at: string; source_type?: string; claim: string; evidence_text?: string; is_quote: boolean; synthetic?: true };
export type ReviewObservation = { source_index: number; sentiment: Sentiment; topic: string; claim: string; evidence: string; severity?: Severity };
export type ReviewFinding = { kind: "COMPLAINT" | "STRENGTH" | "WEAKNESS" | "PROBLEM" | "COMPETITOR_COMPARISON"; title: string; detail: string; impact?: string; severity?: Severity; classification?: Classification; source_indexes: number[] };
export type SyntheticReview = { review_id: string; product_id: string; rating: 1 | 2 | 3 | 4 | 5; sentiment: Sentiment; title: string; review_text: string; topic: string; source_type: "synthetic"; is_synthetic: true; synthetic: true };
export type ReviewReport = { title: string; status: ReviewStatus; summary: string; overall_sentiment: string; sentiment_percentages?: { positive: number; neutral: number; negative: number }; positive_themes: string[]; negative_themes: string[]; emerging_themes: string[]; observations: ReviewObservation[]; complaints: ReviewFinding[]; strengths: ReviewFinding[]; weaknesses: ReviewFinding[]; problems: ReviewFinding[]; competitor_comparison: ReviewFinding[]; customer_needs: string[]; feature_requests: string[]; recommended_actions: string[]; sources: ReviewSource[]; generated_at: string; synthetic_test_data?: true; synthetic_notice?: string; synthetic_score?: number; synthetic_reviews?: SyntheticReview[] };

function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function domainFor(url: string) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }
function clean(value: unknown) { return String(value || "").replace(/[()\"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100); }
function productFacts(product: Record<string, unknown>) { return JSON.stringify({ name: product.name, brand: product.brand, category: product.category, description: product.description, features: product.features, advantages: product.advantages, target_audience: product.target_audience, price: product.price, competitors: product.competitors }); }

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


function productList(value: unknown): string[] { if (Array.isArray(value)) return value.filter(text).map((item) => item.trim()).slice(0, 8); if (text(value)) return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 8); return []; }
function syntheticTopics(product: Record<string, unknown>): string[] { const facts = `${product.name || ""} ${product.category || ""} ${product.features || ""}`.toLowerCase(); if (/phone|mobile|iqoo|smartphone|5g|android/.test(facts)) return ["PERFORMANCE", "GAMING", "BATTERY", "CHARGING", "DISPLAY", "CAMERA", "SOFTWARE", "HEATING", "VALUE", "BUILD QUALITY"]; if (/face|skin|beauty|wash|cosmetic|cream|shampoo/.test(facts)) return ["CLEANSING", "SKIN FEEL", "FRAGRANCE", "DRYNESS", "SUITABILITY", "PRICE", "PACKAGING", "DAILY USE", "IRRITATION", "EFFECTIVENESS"]; return ["QUALITY", "PRICE", "DESIGN", "PERFORMANCE", "RELIABILITY", "USABILITY", "FEATURES", "PACKAGING", "SUPPORT", "VALUE"]; }
function generateSyntheticReviews(product: Record<string, unknown>, productId: string): SyntheticReview[] { const name = clean(product.name) || "the selected product"; const category = clean(product.category) || "this category"; const features = productList(product.features); const audience = clean(product.target_audience) || "the intended audience"; const topics = syntheticTopics(product); const ratings: SyntheticReview["rating"][] = [5, 4, 3, 2, 1, 4, 5, 2, 3, 1, 5, 4, 2, 3, 1, 5, 4, 3, 2, 5]; const sentiments: Sentiment[] = ["POSITIVE", "POSITIVE", "NEUTRAL", "NEGATIVE", "NEGATIVE", "MIXED", "POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED", "POSITIVE", "POSITIVE", "NEGATIVE", "NEUTRAL", "NEGATIVE", "POSITIVE", "MIXED", "NEUTRAL", "NEGATIVE", "POSITIVE"]; const templates = ["The {name} feels aligned with its {category} positioning, especially for {audience}.", "The {name} was easy to use in a normal routine, although the experience depends on expectations.", "The {name} has a noticeable trade-off around {topic}; I would compare the value with alternatives.", "The {name} could improve {topic} before I would recommend it without reservation.", "The {name} delivers a reasonable {topic} experience, but the product details leave room for refinement."]; return ratings.map((rating, index) => { const topic = topics[index % topics.length]; const template = templates[index % templates.length]; const feature = features[index % Math.max(features.length, 1)] || `${topic.toLowerCase()} experience`; return { review_id: `${productId}-synthetic-${index + 1}`, product_id: productId, rating, sentiment: sentiments[index], title: `${topic} feedback for ${name}`, review_text: template.replace("{name}", name).replace("{category}", category).replace("{audience}", audience).replace("{topic}", feature.toLowerCase()), topic, source_type: "synthetic", is_synthetic: true, synthetic: true }; }); }
function analyzeSyntheticReviews(product: Record<string, unknown>, reviews: SyntheticReview[]): ReviewReport { const counts = reviews.reduce((result, review) => { result[review.sentiment] += 1; return result; }, { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, MIXED: 0 } as Record<Sentiment, number>); const total = reviews.length; const observations = reviews.map((review, index) => ({ source_index: index, sentiment: review.sentiment, topic: review.topic, claim: review.review_text, evidence: review.review_text })); const negative = reviews.filter((review) => review.sentiment === "NEGATIVE" || review.sentiment === "MIXED"); const positive = reviews.filter((review) => review.sentiment === "POSITIVE"); const finding = (kind: ReviewFinding["kind"], review: SyntheticReview, severity: Severity, classification?: Classification): ReviewFinding => ({ kind, title: `${review.topic} · ${review.sentiment}`, detail: review.review_text, impact: `${review.rating}/5 synthetic scenario`, severity, classification, source_indexes: [reviews.indexOf(review)] }); const complaints = negative.slice(0, 5).map((review) => finding("COMPLAINT", review, review.rating <= 2 ? "HIGH" : "MEDIUM")); const strengths = positive.slice(0, 5).map((review) => finding("STRENGTH", review, "MEDIUM")); const weaknesses = negative.slice(0, 5).map((review) => finding("WEAKNESS", review, review.rating <= 2 ? "HIGH" : "MEDIUM")); const problems = negative.slice(0, 5).map((review) => finding("PROBLEM", review, review.rating <= 2 ? "HIGH" : "MEDIUM", "USABILITY_ISSUE")); const themes = Array.from(new Set(reviews.map((review) => review.topic))); const score = Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / total * 20); const overall = counts.POSITIVE >= counts.NEGATIVE + counts.MIXED ? "POSITIVE" : counts.NEGATIVE > counts.POSITIVE ? "NEGATIVE" : "MIXED"; return { title: "04 REVIEW REPORT", status: "COMPLETE", summary: `Analytical test report for ${clean(product.name) || "the selected product"}, generated from 20 deterministic product-profile scenarios. These are not real customer reviews or live web evidence.`, overall_sentiment: overall, sentiment_percentages: { positive: Math.round(counts.POSITIVE / total * 100), neutral: Math.round(counts.NEUTRAL / total * 100), negative: Math.round(counts.NEGATIVE / total * 100) }, positive_themes: positive.length ? Array.from(new Set(positive.map((review) => review.topic))).slice(0, 6) : [], negative_themes: negative.length ? Array.from(new Set(negative.map((review) => review.topic))).slice(0, 6) : [], emerging_themes: themes.slice(0, 6), observations, complaints, strengths, weaknesses, problems, competitor_comparison: [], customer_needs: themes.slice(0, 6).map((topic) => `Reliable ${topic.toLowerCase()} experience`), feature_requests: themes.slice(0, 6).map((topic) => `Improve ${topic.toLowerCase()}`), recommended_actions: problems.slice(0, 4).map((problem) => `Prioritize validation of ${problem.title.toLowerCase()} before launch or scale.`), sources: [], generated_at: new Date().toISOString() }; }

function synthesizeSynthetic(product: Record<string, unknown>, reviews: SyntheticReview[]) { return analyzeSyntheticReviews(product, reviews); }

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

export async function generateSyntheticReviewReport(productId: string) {
  const { supabase, user, product } = await context(productId);
  const job = await supabase.from("review_analysis_jobs").insert({ user_id: user.id, product_id: productId, status: "COLLECTING_REVIEWS" }).select("id").single();
  if (job.error || !job.data) throw new Error("Review Report migration is not applied.");
  const jobId = job.data.id;
  const update = async (status: ReviewStatus, error_message?: string) => { await supabase.from("review_analysis_jobs").update({ status, error_message: error_message || null, completed_at: ["COMPLETE", "ERROR"].includes(status) ? new Date().toISOString() : null }).eq("id", jobId).eq("user_id", user.id).eq("product_id", productId); };
  try {
    const reviews = await generateSyntheticReviews(product, productId);
    await update("ANALYZING_SENTIMENT");
    const analyzed = await synthesizeSynthetic(product, reviews);
    const syntheticScore = Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 20); const report: ReviewReport = { ...analyzed, title: "04 REVIEW REPORT · SYNTHETIC TEST DATA", synthetic_test_data: true, synthetic_notice: "These reviews are AI-generated test data and are not real customer reviews or live web evidence.", synthetic_score: syntheticScore, synthetic_reviews: reviews, sources: [], generated_at: new Date().toISOString() };
    const saved = await supabase.from("product_intelligence_reports").upsert({ user_id: user.id, product_id: productId, module: "review", report }, { onConflict: "user_id,product_id,module" });
    if (saved.error) throw new Error("Unable to save synthetic Review Report.");
    if ((await supabase.from("review_analyses").insert({ job_id: jobId, user_id: user.id, product_id: productId, report })).error) throw new Error("Unable to save synthetic Review analysis.");
    await update("COMPLETE");
    revalidatePath(`/dashboard/product/${productId}/review-report`);
    return { success: true as const, report, status: "COMPLETE" as const, message: "ANALYTICAL TEST DATA · AI TEST SCORE ONLY" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Synthetic Review Report generation failed.";
    await update("ERROR", message);
    console.error("[review-report][synthetic]", error);
    return { success: false as const, report: null, status: "ERROR" as const, message: "Unable to generate analytical test data right now.", error: message };
  }
}
