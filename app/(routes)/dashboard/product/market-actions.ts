"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { researchMarket, synthesizeMarketAnalysis } from "@/lib/market-analysis";

export async function getLatestMarketAnalysis(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { analysis: null, signals: [], sources: [], recommendations: [], error: "You must be logged in to view market intelligence." };

  const { data: product } = await supabase.from("products").select("id").eq("id", productId).eq("user_id", user.id).maybeSingle();
  if (!product) return { analysis: null, signals: [], sources: [], recommendations: [], error: "Product not found." };

  const { data: analysis, error } = await supabase.from("market_analyses").select("*").eq("product_id", productId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return { analysis: null, signals: [], sources: [], recommendations: [], error: "Unable to load the market analysis." };
  if (!analysis) return { analysis: null, signals: [], sources: [], recommendations: [], error: null };

  const [{ data: signals }, { data: sources }, { data: recommendations }] = await Promise.all([
    supabase.from("market_signals").select("*").eq("analysis_id", analysis.id).eq("user_id", user.id).order("created_at"),
    supabase.from("market_sources").select("*").eq("analysis_id", analysis.id).eq("user_id", user.id).order("created_at"),
    supabase.from("market_recommendations").select("*").eq("analysis_id", analysis.id).eq("user_id", user.id).order("created_at"),
  ]);
  return { analysis, signals: signals || [], sources: sources || [], recommendations: recommendations || [], error: null };
}

export async function analyzeMarket(productId: string, forceRefresh = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to analyze a product." };

  const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", productId).eq("user_id", user.id).maybeSingle();
  if (productError || !product) return { error: "Unauthorized or invalid product." };

  if (!forceRefresh) {
    const { data: cached } = await supabase.from("market_analyses").select("id").eq("product_id", productId).eq("user_id", user.id).limit(1).maybeSingle();
    if (cached) return { cached: true };
  }

  const { data: job, error: jobError } = await supabase.from("market_analysis_jobs").insert({ product_id: productId, user_id: user.id, status: "researching" }).select("id").single();
  if (jobError || !job) return { error: "Unable to create the market-analysis job." };

  try {
    const research = await researchMarket(product);
    if (research.status !== "available") throw new Error(research.error || "RESEARCH TEMPORARILY UNAVAILABLE");
    const sources = research.sources;
    if (!sources.length) throw new Error("Insufficient evidence available.");
    await supabase.from("market_analysis_jobs").update({ status: "analyzing", updated_at: new Date().toISOString() }).eq("id", job.id).eq("user_id", user.id);
    const result = await synthesizeMarketAnalysis(product, sources);

    if (forceRefresh) {
      const { data: oldAnalyses } = await supabase.from("market_analyses").select("id").eq("product_id", productId).eq("user_id", user.id);
      const oldIds = (oldAnalyses || []).map((item) => item.id);
      if (oldIds.length) await supabase.from("market_analyses").delete().in("id", oldIds).eq("user_id", user.id);
    }

    const { data: analysis, error: analysisError } = await supabase.from("market_analyses").insert({
      job_id: job.id,
      user_id: user.id,
      product_id: productId,
      market_readiness: result.market_readiness,
      readiness_reason: result.readiness_reason,
      recommended_launch_window: result.recommended_launch_window,
      launch_reasoning: result.launch_reasoning,
      confidence: result.confidence,
      confidence_reason: result.confidence_reason,
      reasoning: result.reasoning,
      key_findings: result.key_findings,
    }).select("*").single();
    if (analysisError || !analysis) throw new Error("Unable to save the market analysis.");

    const signalRows = result.signals.map((signal) => ({ analysis_id: analysis.id, user_id: user.id, product_id: productId, signal_type: signal.signal_type, rating: signal.rating, explanation: signal.explanation, evidence: signal.evidence }));
    const recommendationRows = result.recommendations.map((item) => ({ analysis_id: analysis.id, user_id: user.id, product_id: productId, recommendation_type: item.recommendation_type, priority: item.priority, title: item.title, detail: item.detail, evidence: item.evidence }));
    const sourceRows = sources.map((source) => ({ analysis_id: analysis.id, user_id: user.id, product_id: productId, title: source.title, url: source.url, domain: source.domain, publication_date: source.publication_date, retrieved_at: source.retrieved_at, claim: source.claim }));
    const [{ error: signalError }, { error: recommendationError }, { error: sourceError }] = await Promise.all([
      supabase.from("market_signals").insert(signalRows),
      supabase.from("market_recommendations").insert(recommendationRows),
      supabase.from("market_sources").insert(sourceRows),
    ]);
    if (signalError || recommendationError || sourceError) throw new Error("Unable to save all market evidence and recommendations.");

    await supabase.from("market_analysis_jobs").update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", job.id).eq("user_id", user.id);
    revalidatePath(`/dashboard/product/${productId}/market-suggestion`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Market research failed.";
    await supabase.from("market_analysis_jobs").update({ status: "failed", error_message: message.slice(0, 500), updated_at: new Date().toISOString() }).eq("id", job.id).eq("user_id", user.id);
    return { error: message };
  }
}
