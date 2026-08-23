"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLatestMarketAnalysis } from "./market-actions";

export type ScalabilityItem = { title: string; detail: string; evidence: string[]; impact?: string; priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" };
export type ScalabilityMarket = { market: string; fit: string; demand_signal: string; competition: string; entry_difficulty: string; potential: string; confidence: string; evidence: string[] };
export type ScalabilityReport = { module: "scalability"; title: "06 SCALABILITY"; status: "COMPLETE"; score: number; potential: "HIGH" | "MEDIUM" | "LOW"; reasoning: string; successful_areas: ScalabilityItem[]; expansion_opportunities: ScalabilityItem[]; new_markets: ScalabilityMarket[]; pricing: { current_price: string; price_position: string; premium_opportunity: string; bundling_opportunity: string; discount_strategy: string; recommended_direction: string; evidence: string[] }; distribution: Array<{ channel: string; opportunity: string; effort: string; potential_impact: string; priority: string; evidence: string[] }>; risks: ScalabilityItem[]; opportunities: ScalabilityItem[]; recommendations: ScalabilityItem[]; evidence: string[]; generated_at: string };

type Context = { supabase: Awaited<ReturnType<typeof createClient>>; user: { id: string }; product: Record<string, unknown>; market: Awaited<ReturnType<typeof getLatestMarketAnalysis>>; review: Record<string, unknown> | null; performance: Record<string, unknown> | null };
function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function list(value: unknown): string[] { if (Array.isArray(value)) return value.filter(text); if (text(value)) return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean); return []; }
function clean(value: unknown, fallback: string) { return text(value) ? value.trim() : fallback; }
function clamp(score: number) { return Math.max(0, Math.min(100, Math.round(score))); }
function priority(score: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" { return score < 35 ? "CRITICAL" : score < 55 ? "HIGH" : score < 75 ? "MEDIUM" : "LOW"; }

async function context(productId: string): Promise<Context> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).eq("user_id", user.id).maybeSingle();
  if (error || !product) throw new Error("Product not found.");
  const [market, reviewResult, performanceResult] = await Promise.all([
    getLatestMarketAnalysis(productId),
    supabase.from("product_intelligence_reports").select("report").eq("product_id", productId).eq("user_id", user.id).eq("module", "review").maybeSingle(),
    supabase.from("performance_analyses").select("report").eq("product_id", productId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const review = reviewResult.data?.report as (Record<string, unknown> & { synthetic_test_data?: boolean }) | null;
  return { supabase, user, product, market, review: review?.synthetic_test_data ? null : review, performance: (performanceResult.data?.report as Record<string, unknown> | null) || null };
}

function deterministicReport(context: Context): ScalabilityReport {
  const { product, market, review, performance } = context;
  const name = clean(product.name, "the selected product");
  const features = list(product.features);
  const audience = clean(product.target_audience || product.target_market, "the intended audience");
  const marketSignals = market.signals || [];
  const marketSources = market.sources || [];
  const marketReady = Boolean(market.analysis);
  const reviewObservations = Array.isArray(review?.observations) ? review.observations : [];
  const performanceScore = Number(performance?.overall_score);
  const scoreInputs = [features.length ? 60 : 30, marketReady ? 60 + Math.min(25, marketSignals.length * 5) : 35, reviewObservations.length ? 55 + Math.min(30, reviewObservations.length * 3) : 35, Number.isFinite(performanceScore) ? performanceScore : 35];
  const score = clamp(scoreInputs.reduce((sum, value) => sum + value, 0) / scoreInputs.length);
  const potential = score >= 75 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW";
  const marketEvidence = marketReady ? [`${marketSignals.length} saved Market Suggestion signal(s)`, `${marketSources.length} saved market source(s)`] : ["MARKET EVIDENCE UNAVAILABLE"];
  const reviewEvidence = reviewObservations.length ? [`${reviewObservations.length} saved customer observation(s)`] : ["CUSTOMER EVIDENCE UNAVAILABLE"];
  const performanceEvidence = Number.isFinite(performanceScore) ? [`Saved Performance score: ${performanceScore}/100`] : ["PERFORMANCE EVIDENCE UNAVAILABLE"];
  const successful_areas: ScalabilityItem[] = [];
  if (features.length) successful_areas.push({ title: "Product capability base", detail: `${name} has ${features.length} saved feature(s) that can anchor packaging or channel expansion.`, evidence: [`Saved features: ${features.slice(0, 4).join(", ")}`], impact: "Supports repeatable positioning." });
  if (marketReady) successful_areas.push({ title: "Market signal coverage", detail: "Saved Market Suggestion intelligence provides an evidence base for prioritizing scale experiments.", evidence: marketEvidence, impact: "Supports focused expansion decisions." });
  if (reviewObservations.length) successful_areas.push({ title: "Customer signal coverage", detail: "Saved customer observations can be converted into segment and use-case hypotheses.", evidence: reviewEvidence, impact: "Supports evidence-led messaging." });
  if (Number.isFinite(performanceScore)) successful_areas.push({ title: "Performance baseline", detail: "The saved Performance assessment provides a current operating baseline for scale sequencing.", evidence: performanceEvidence, impact: "Supports measured rollout planning." });
  const expansion_opportunities: ScalabilityItem[] = [
    { title: `Adjacent needs for ${audience}`, detail: "Test whether the existing product capability set solves a neighboring use case for the saved audience.", evidence: features.length ? [`Saved product features: ${features.slice(0, 3).join(", ")}`] : ["PRODUCT FEATURE EVIDENCE UNAVAILABLE"], impact: "Potential audience expansion", priority: features.length >= 2 ? "HIGH" : "MEDIUM" },
    { title: "Channel expansion experiment", detail: "Validate one additional online or partner channel before broad distribution investment.", evidence: marketReady ? marketEvidence : ["MARKET EVIDENCE UNAVAILABLE"], impact: "Potential reach expansion", priority: marketReady ? "HIGH" : "MEDIUM" },
    { title: "Use-case packaging", detail: "Bundle the strongest saved capabilities around one clearly defined customer job to be done.", evidence: reviewObservations.length ? reviewEvidence : ["CUSTOMER EVIDENCE UNAVAILABLE"], impact: "Potential conversion improvement", priority: "MEDIUM" },
  ];
  const new_markets: ScalabilityMarket[] = marketReady ? [{ market: clean(product.target_market || product.category, "Saved target market"), fit: "EVIDENCE-BASED", demand_signal: `${marketSignals.length} saved signal(s)`, competition: "NOT MEASURED", entry_difficulty: "NOT MEASURED", potential: "VALIDATE", confidence: marketSources.length ? "SOURCE-BACKED" : "LOW", evidence: marketEvidence }] : [{ market: "NO MARKET RECOMMENDATION", fit: "MARKET EVIDENCE UNAVAILABLE", demand_signal: "MARKET EVIDENCE UNAVAILABLE", competition: "MARKET EVIDENCE UNAVAILABLE", entry_difficulty: "MARKET EVIDENCE UNAVAILABLE", potential: "MARKET EVIDENCE UNAVAILABLE", confidence: "NONE", evidence: ["MARKET EVIDENCE UNAVAILABLE"] }];
  const price = clean(product.pricing || product.price, "PRICING DATA UNAVAILABLE");
  const pricing = { current_price: price, price_position: price === "PRICING DATA UNAVAILABLE" ? "PRICING DATA UNAVAILABLE" : "POSITION NOT MEASURED", premium_opportunity: features.length ? "Test a premium bundle only after willingness-to-pay validation." : "PRICING DATA UNAVAILABLE", bundling_opportunity: features.length >= 2 ? "Bundle the strongest saved features around one use case." : "PRICING DATA UNAVAILABLE", discount_strategy: "Avoid unvalidated discounting; test a bounded entry offer.", recommended_direction: price === "PRICING DATA UNAVAILABLE" ? "Collect product pricing before making a pricing decision." : "Validate value communication before changing price.", evidence: price === "PRICING DATA UNAVAILABLE" ? ["PRICING DATA UNAVAILABLE"] : [`Saved product pricing: ${price}`] };
  const distribution = ["DIRECT ONLINE", "RETAIL PARTNER", "PARTNERSHIP"].map((channel, index) => ({ channel, opportunity: index === 0 ? "Validate direct demand and repeatable acquisition." : index === 1 ? "Test a limited partner channel before broad rollout." : "Identify a partner whose audience overlaps the saved target audience.", effort: index === 0 ? "MEDIUM" : "HIGH", potential_impact: marketReady ? "SIGNAL-BACKED EXPERIMENT" : "EVIDENCE UNAVAILABLE", priority: index === 0 ? "HIGH" : "MEDIUM", evidence: marketReady ? marketEvidence : ["MARKET EVIDENCE UNAVAILABLE"] }));
  const risks: ScalabilityItem[] = [{ title: "Evidence coverage risk", detail: "Scaling before validating the missing intelligence can create avoidable channel or segment risk.", evidence: [...(!marketReady ? ["MARKET EVIDENCE UNAVAILABLE"] : []), ...(!reviewObservations.length ? ["CUSTOMER EVIDENCE UNAVAILABLE"] : [])], priority: !marketReady || !reviewObservations.length ? "HIGH" : "MEDIUM" }, { title: "Operational validation risk", detail: "A broad rollout is not justified by a score alone; sequence small experiments and measure outcomes.", evidence: performanceEvidence, priority: "MEDIUM" }];
  const opportunities = expansion_opportunities.map((item) => ({ ...item, title: `${item.title} opportunity`, detail: item.detail, priority: item.priority || "MEDIUM" }));
  const recommendations: ScalabilityItem[] = [{ title: "Run one bounded expansion experiment", detail: `Start with the strongest evidence-supported opportunity for ${name} and define a measurable decision gate.`, evidence: [...marketEvidence, ...reviewEvidence], priority: "HIGH" }, { title: "Validate pricing and channel assumptions", detail: "Collect direct response before changing price or committing to broad distribution.", evidence: pricing.evidence, priority: "MEDIUM" }, { title: "Maintain an evidence review cadence", detail: "Refresh Market, Review, and Performance intelligence before each major scale decision.", evidence: performanceEvidence, priority: "MEDIUM" }];
  return { module: "scalability", title: "06 SCALABILITY", status: "COMPLETE", score, potential, reasoning: `Scalability score is derived from saved product structure and available Clyra intelligence. It is an analytical planning score, not a measured market-size or revenue forecast.`, successful_areas, expansion_opportunities, new_markets, pricing, distribution, risks, opportunities, recommendations, evidence: [...new Set([...marketEvidence, ...reviewEvidence, ...performanceEvidence])], generated_at: new Date().toISOString() };
}

export async function getScalabilityReport(productId: string) { const { supabase } = await context(productId); const { data } = await supabase.from("product_intelligence_reports").select("report").eq("product_id", productId).eq("module", "scalability").maybeSingle(); return (data?.report as ScalabilityReport | null) || null; }
export async function analyzeScalability(productId: string, forceRefresh = false) { const ctx = await context(productId); if (!forceRefresh) { const cached = await getScalabilityReport(productId); if (cached) return { report: cached, status: "CACHED" as const, message: "COMPLETE" }; } const report = deterministicReport(ctx); const { error } = await ctx.supabase.from("product_intelligence_reports").upsert({ user_id: ctx.user.id, product_id: productId, module: "scalability", report }, { onConflict: "user_id,product_id,module" }); if (error) throw new Error("Unable to save Scalability Report."); revalidatePath(`/dashboard/product/${productId}/scalability`); return { report, status: "COMPLETE" as const, message: "COMPLETE" }; }
