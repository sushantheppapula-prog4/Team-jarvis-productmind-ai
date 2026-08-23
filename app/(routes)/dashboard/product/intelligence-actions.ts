"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IntelligenceModule = "scalability" | "improvements" | "suggestions" | "next-generation" | "continuous" | "agent";
type Report = { module: IntelligenceModule; title: string; status: "AI GENERATED" | "INSUFFICIENT LIVE EVIDENCE"; summary: string; sections: Array<{ heading: string; items: Array<{ label: string; value: string }> }>; evidence: string[]; metrics?: Array<{ label: string; value: number; qualifier?: string; reasoning?: string }>; generated_at: string };
type Context = { supabase: Awaited<ReturnType<typeof createClient>>; user: { id: string }; product: Record<string, unknown>; market: Record<string, unknown> | null; review: Record<string, unknown> | null; performance: Record<string, unknown> | null; saved: Record<string, unknown>[] };

const modulePrompts: Record<IntelligenceModule, string> = {
  scalability: "Scalability: evaluate successful areas, expansion opportunities, new customer segments, geographic markets, pricing and distribution opportunities, operational risks, and scaling recommendations.",
  improvements: "Improvements: identify only evidence-supported problems, root causes, customer impact, severity, priority, recommended fixes, and expected benefits.",
  suggestions: "New Product Suggestions: propose multiple grounded opportunities with product name, problem, target customer, market gap, evidence, solution, features, differentiation, reasoning, and confidence.",
  "next-generation": "Next Generation: create a grounded next-version strategy with target customer, positioning, features, differentiation, product changes, and launch direction.",
  continuous: "Continuous Report: compare the saved intelligence context to any previous continuous report and state only supported changes, sentiment, demand, complaints, problems, opportunities, and recommendation changes.",
  agent: "AI Agent: answer the user's question using only the saved Clyra product intelligence and explicitly state when data is insufficient.",
};

function baseReport(product: Record<string, unknown>, module: IntelligenceModule, question?: string): Report {
  const name = String(product.name || "this product");
  return { module, title: module === "agent" ? "CLYRA AI AGENT" : module === "next-generation" ? "NEXT GENERATION" : module === "suggestions" ? "NEW PRODUCT SUGGESTIONS" : module.toUpperCase(), status: "INSUFFICIENT LIVE EVIDENCE", summary: `No complete saved intelligence context is available for ${name}. Clyra will not invent findings, sources, quotes, ratings, or statistics.${question ? ` Question: ${question}` : ""}`, sections: [{ heading: "DATA STATUS", items: [{ label: "PRODUCT", value: name }, { label: "REQUIRED INPUT", value: "Complete Market Suggestion, Review Report, and the module's prerequisite intelligence before making a grounded assessment." }] }], evidence: [], generated_at: new Date().toISOString() };
}

async function getContext(productId: string): Promise<Context> {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("You must be logged in.");
  const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).eq("user_id", user.id).maybeSingle(); if (error || !product) throw new Error("Product not found.");
  const [{ data: market }, { data: review }, { data: performance }, { data: saved }] = await Promise.all([
    supabase.from("market_analyses").select("*").eq("product_id", productId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("review_analyses").select("*").eq("product_id", productId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("performance_analyses").select("*").eq("product_id", productId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("product_intelligence_reports").select("*").eq("product_id", productId).eq("user_id", user.id),
  ]);
  return { supabase, user, product, market: market || null, review: review || null, performance: performance || null, saved: saved || [] };
}

function completeFor(module: IntelligenceModule, context: Context) { const market = Boolean(context.market); const review = Boolean(context.review); const performance = Boolean(context.performance); if (module === "agent" || module === "continuous") return market || review || performance; if (module === "scalability" || module === "improvements" || module === "next-generation") return market && review && performance; return market && review; }
function extractJson(text: string): unknown { const match = text.match(/\{[\s\S]*\}/); return JSON.parse(match ? match[0] : text); }
function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function safeMetrics(value: unknown) { if (!Array.isArray(value)) return undefined; const metrics = value.flatMap((raw) => { if (!raw || typeof raw !== "object") return []; const row = raw as { label?: unknown; value?: unknown; qualifier?: unknown; reasoning?: unknown }; const value = Number(row.value); if (!text(row.label) || !Number.isFinite(value) || value < 0 || value > 100) return []; return [{ label: row.label as string, value: Math.round(value), qualifier: text(row.qualifier) ? row.qualifier as string : "AI ANALYTICAL SCORE", reasoning: text(row.reasoning) ? row.reasoning as string : undefined }]; }); return metrics.length ? metrics : undefined; }

export async function generateIntelligence(productId: string, module: IntelligenceModule, question?: string) {
  const context = await getContext(productId); let report = baseReport(context.product, module, question); const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey && completeFor(module, context)) {
    try {
      const prompt = `You are Clyra's evidence-bound product intelligence analyst. ${modulePrompts[module]} Return JSON with keys title, summary, sections (array of {heading,items:[{label,value}]}), metrics (optional array of {label,value,qualifier,reasoning}; values must be 0-100 AI analytical or projected scores derived only from supplied context), and evidence (array of exact source URLs already present in the supplied context). Never invent quotes, statistics, sources, dates, prices, ratings, or market facts. If a requested conclusion is unsupported, say so. PRODUCT=${JSON.stringify(context.product)} MARKET=${JSON.stringify(context.market || {})} REVIEW=${JSON.stringify(context.review || {})} PERFORMANCE=${JSON.stringify(context.performance || {})} SAVED_MODULE_REPORTS=${JSON.stringify(context.saved)} QUESTION=${question || ""}`;
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }), cache: "no-store" });
      if (!response.ok) throw new Error(`GEMINI_HTTP_${response.status}`);
      const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }; const parsed = extractJson(payload.candidates?.[0]?.content?.parts?.[0]?.text || "");
      if (parsed && typeof parsed === "object") { const candidate = parsed as Partial<Report>; report = { ...report, ...candidate, metrics: safeMetrics(candidate.metrics), module, status: "AI GENERATED", generated_at: new Date().toISOString() }; }
    } catch { report = { ...report, status: "INSUFFICIENT LIVE EVIDENCE", summary: "Gemini was unavailable or returned an invalid structured response. No unsupported intelligence was generated." }; }
  }
  const { error: saveError } = await context.supabase.from("product_intelligence_reports").upsert({ user_id: context.user.id, product_id: productId, module, report }, { onConflict: "user_id,product_id,module" }); if (saveError) throw new Error(`Unable to save intelligence report: ${saveError.message}`);
  revalidatePath(`/dashboard/product/${productId}`); revalidatePath(`/dashboard/product/${productId}/${module === "suggestions" ? "new-product-suggestions" : module}`); return { report, persisted: true };
}

export async function getIntelligence(productId: string, module: IntelligenceModule) { const { supabase } = await getContext(productId); const { data } = await supabase.from("product_intelligence_reports").select("report").eq("product_id", productId).eq("module", module).maybeSingle(); return (data?.report as Report | null) || null; }
export async function saveReportSchedule(productId: string, frequency: "daily" | "weekly" | "monthly" | "custom", customInterval?: string) { const { supabase, user } = await getContext(productId); const { data, error } = await supabase.from("product_report_schedules").upsert({ user_id: user.id, product_id: productId, frequency, custom_interval: customInterval || null, active: true, updated_at: new Date().toISOString() }, { onConflict: "user_id,product_id" }).select("*").single(); if (error) throw new Error("Unable to save report schedule. Apply migration 003 first."); revalidatePath(`/dashboard/product/${productId}/continuous-reports`); return data; }
export async function getReportSchedule(productId: string) { const { supabase } = await getContext(productId); const { data } = await supabase.from("product_report_schedules").select("*").eq("product_id", productId).maybeSingle(); return data; }
