"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLatestMarketAnalysis } from "./market-actions";

type Rating = "EXCELLENT" | "GOOD" | "MODERATE" | "WEAK" | "CRITICAL";
type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

type PerformanceItem = {
  title: string;
  detail: string;
  evidence: string[];
  impact?: string;
  severity?: Priority;
  priority?: Priority;
};

type PerformanceDimension = {
  name: string;
  score: number;
  rating: Rating;
  reasoning: string;
  supporting_intelligence: string[];
};

export type PerformanceReport = {
  title: "05 PERFORMANCE";
  status: "COMPLETE";
  overall_score: number;
  overall_rating: Rating;
  overall_reason: string;
  dimensions: PerformanceDimension[];
  working_areas: PerformanceItem[];
  weak_areas: PerformanceItem[];
  risks: PerformanceItem[];
  opportunities: PerformanceItem[];
  recommendations: { immediate: string; short_term: string; strategic: string };
  evidence: string[];
  generated_at: string;
};

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function clampScore(value: unknown) {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error("Invalid Performance score.");
  return Math.round(score);
}

function item(value: unknown): PerformanceItem {
  if (!value || typeof value !== "object") throw new Error("Invalid Performance finding.");
  const row = value as Partial<PerformanceItem>;
  if (!text(row.title) || !text(row.detail) || !Array.isArray(row.evidence) || !row.evidence.every(text)) throw new Error("Performance findings require evidence.");
  return { title: row.title, detail: row.detail, evidence: row.evidence, impact: text(row.impact) ? row.impact : undefined, severity: row.severity, priority: row.priority };
}

function validateReport(value: unknown): PerformanceReport {
  if (!value || typeof value !== "object") throw new Error("Gemini returned an invalid Performance report.");
  const row = value as Partial<PerformanceReport>;
  const dimensions = Array.isArray(row.dimensions) ? row.dimensions.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid Performance dimension.");
    const dimension = raw as Partial<PerformanceDimension>;
    if (!text(dimension.name) || !text(dimension.reasoning) || !Array.isArray(dimension.supporting_intelligence) || !dimension.supporting_intelligence.every(text)) throw new Error("Performance dimensions require supporting intelligence.");
    if (!["MARKET_FIT", "CUSTOMER_SATISFACTION", "COMPETITIVE_POSITION", "PRICING_FIT", "FEATURE_FIT", "GROWTH_POTENTIAL"].includes(dimension.name)) throw new Error("Unknown Performance dimension.");
    if (!["EXCELLENT", "GOOD", "MODERATE", "WEAK", "CRITICAL"].includes(String(dimension.rating))) throw new Error("Invalid Performance rating.");
    return { name: dimension.name, score: clampScore(dimension.score), rating: dimension.rating as Rating, reasoning: dimension.reasoning, supporting_intelligence: dimension.supporting_intelligence };
  }) : [];
  if (dimensions.length !== 6 || !text(row.overall_reason) || !["EXCELLENT", "GOOD", "MODERATE", "WEAK", "CRITICAL"].includes(String(row.overall_rating))) throw new Error("Gemini returned an incomplete Performance report.");
  if (!row.recommendations || typeof row.recommendations !== "object") throw new Error("Performance recommendations are required.");
  const recommendations = row.recommendations as Partial<PerformanceReport["recommendations"]>;
  if (!text(recommendations.immediate) || !text(recommendations.short_term) || !text(recommendations.strategic)) throw new Error("Performance recommendations are incomplete.");
  return {
    title: "05 PERFORMANCE",
    status: "COMPLETE",
    overall_score: clampScore(row.overall_score),
    overall_rating: row.overall_rating as Rating,
    overall_reason: row.overall_reason,
    dimensions,
    working_areas: Array.isArray(row.working_areas) ? row.working_areas.map(item) : [],
    weak_areas: Array.isArray(row.weak_areas) ? row.weak_areas.map(item) : [],
    risks: Array.isArray(row.risks) ? row.risks.map(item) : [],
    opportunities: Array.isArray(row.opportunities) ? row.opportunities.map(item) : [],
    recommendations: { immediate: recommendations.immediate, short_term: recommendations.short_term, strategic: recommendations.strategic },
    evidence: Array.isArray(row.evidence) ? row.evidence.filter(text) : [],
    generated_at: new Date().toISOString(),
  };
}

const responseSchema = {
  type: "object",
  properties: {
    overall_score: { type: "number" }, overall_rating: { type: "string" }, overall_reason: { type: "string" },
    dimensions: { type: "array", items: { type: "object", properties: { name: { type: "string" }, score: { type: "number" }, rating: { type: "string" }, reasoning: { type: "string" }, supporting_intelligence: { type: "array", items: { type: "string" } } }, required: ["name", "score", "rating", "reasoning", "supporting_intelligence"] } },
    working_areas: { type: "array", items: { type: "object" } }, weak_areas: { type: "array", items: { type: "object" } }, risks: { type: "array", items: { type: "object" } }, opportunities: { type: "array", items: { type: "object" } },
    recommendations: { type: "object", properties: { immediate: { type: "string" }, short_term: { type: "string" }, strategic: { type: "string" } }, required: ["immediate", "short_term", "strategic"] }, evidence: { type: "array", items: { type: "string" } },
  }, required: ["overall_score", "overall_rating", "overall_reason", "dimensions", "working_areas", "weak_areas", "risks", "opportunities", "recommendations", "evidence"],
};

async function context(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).eq("user_id", user.id).maybeSingle();
  if (error || !product) throw new Error("Product not found.");
  return { supabase, user, product };
}

export async function getPerformanceContext(productId: string) {
  const { supabase, product } = await context(productId);
  const market = await getLatestMarketAnalysis(productId);
  const { data: reviewRow } = await supabase.from("product_intelligence_reports").select("report").eq("product_id", productId).eq("module", "review").maybeSingle();
  const { data: saved } = await supabase.from("performance_analyses").select("report").eq("product_id", productId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return { product, report: (saved?.report as PerformanceReport | null) || null, marketAvailable: Boolean(market.analysis), reviewAvailable: Boolean(reviewRow?.report && (reviewRow.report as { status?: string }).status === "COMPLETE"), market, error: null };
}

async function synthesize(product: Record<string, unknown>, market: Awaited<ReturnType<typeof getLatestMarketAnalysis>>, review: Record<string, unknown>) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini is not configured for Performance analysis.");
  const prompt = [
    "You are Clyra's evidence-bound product performance analyst.",
    "Produce an AI-DERIVED PERFORMANCE ASSESSMENT from ONLY the supplied saved product, market intelligence, and review intelligence.",
    "Do not invent sales, revenue, market size, reviews, sources, statistics, customer opinions, or measured business metrics. Every score is an inference, not a measured metric.",
    "If evidence is insufficient, use conservative scores, explain the limitation, and keep arrays empty rather than fabricating.",
    "Use exactly these dimensions: MARKET_FIT, CUSTOMER_SATISFACTION, COMPETITIVE_POSITION, PRICING_FIT, FEATURE_FIT, GROWTH_POTENTIAL.",
    `PRODUCT:\n${JSON.stringify(product)}`,
    `MARKET INTELLIGENCE:\n${JSON.stringify({ analysis: market.analysis, signals: market.signals, sources: market.sources, recommendations: market.recommendations })}`,
    `REVIEW INTELLIGENCE:\n${JSON.stringify(review)}`,
  ].join("\n\n");
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema } }), cache: "no-store" });
  if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}.`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned no structured Performance report.");
  return validateReport(JSON.parse(raw));
}

export async function analyzePerformance(productId: string, forceRefresh = false) {
  const { supabase, user, product } = await context(productId);
  const market = await getLatestMarketAnalysis(productId);
  if (!market.analysis) return { report: null, status: "MARKET_REQUIRED" as const, message: "MARKET INTELLIGENCE REQUIRED" };
  const { data: reviewRow } = await supabase.from("product_intelligence_reports").select("report").eq("product_id", productId).eq("module", "review").maybeSingle();
  const review = reviewRow?.report as Record<string, unknown> | null;
  if (!review || review.status !== "COMPLETE") return { report: null, status: "REVIEW_REQUIRED" as const, message: "CUSTOMER INTELLIGENCE REQUIRED" };
  if (!forceRefresh) {
    const { data: cached } = await supabase.from("performance_analyses").select("report").eq("product_id", productId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (cached?.report) return { report: cached.report as PerformanceReport, status: "CACHED" as const, message: "COMPLETE" };
  }
  const { data: job, error: jobError } = await supabase.from("performance_analysis_jobs").insert({ user_id: user.id, product_id: productId, status: "LOADING_MARKET_INTELLIGENCE" }).select("id").single();
  if (jobError || !job) throw new Error("Performance migration is not applied.");
  const update = async (status: string, error_message?: string) => { await supabase.from("performance_analysis_jobs").update({ status, error_message: error_message || null, completed_at: ["COMPLETE", "INSUFFICIENT_DATA", "ERROR"].includes(status) ? new Date().toISOString() : null }).eq("id", job.id).eq("user_id", user.id).eq("product_id", productId); };
  try {
    await update("LOADING_CUSTOMER_INTELLIGENCE");
    await update("EVALUATING_PERFORMANCE");
    const report = await synthesize(product, market, review);
    await update("GENERATING_RECOMMENDATIONS");
    const analysis = await supabase.from("performance_analyses").insert({ job_id: job.id, user_id: user.id, product_id: productId, overall_score: report.overall_score, overall_rating: report.overall_rating, report }).select("id").single();
    if (analysis.error || !analysis.data) throw new Error("Unable to save Performance analysis.");
    const dimensions = report.dimensions.map((row) => ({ analysis_id: analysis.data.id, job_id: job.id, user_id: user.id, product_id: productId, dimension: row.name, score: row.score, rating: row.rating, reasoning: row.reasoning, supporting_intelligence: row.supporting_intelligence }));
    if ((await supabase.from("performance_dimensions").insert(dimensions)).error) throw new Error("Unable to save Performance dimensions.");
    const rows = (items: PerformanceItem[], kind: "risk" | "opportunity") => items.map((row) => ({ analysis_id: analysis.data!.id, job_id: job.id, user_id: user.id, product_id: productId, title: row.title, detail: row.detail, evidence: row.evidence, severity: row.severity || row.priority || "MEDIUM", kind }));
    if (report.risks.length && (await supabase.from("performance_risks").insert(rows(report.risks, "risk"))).error) throw new Error("Unable to save Performance risks.");
    if (report.opportunities.length && (await supabase.from("performance_opportunities").insert(rows(report.opportunities, "opportunity"))).error) throw new Error("Unable to save Performance opportunities.");
    const recommendations = [{ phase: "IMMEDIATE", action: report.recommendations.immediate }, { phase: "SHORT_TERM", action: report.recommendations.short_term }, { phase: "STRATEGIC", action: report.recommendations.strategic }].map((row) => ({ analysis_id: analysis.data!.id, job_id: job.id, user_id: user.id, product_id: productId, phase: row.phase, action: row.action }));
    if ((await supabase.from("performance_recommendations").insert(recommendations)).error) throw new Error("Unable to save Performance recommendations.");
    await update("COMPLETE");
    revalidatePath(`/dashboard/product/${productId}/performance`);
    return { report, status: "COMPLETE" as const, message: "COMPLETE" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Performance analysis failed.";
    await update(message.includes("insufficient") ? "INSUFFICIENT_DATA" : "ERROR", message);
    return { report: null, status: "ERROR" as const, message };
  }
}
