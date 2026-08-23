"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IntelligenceModule = "review" | "scalability" | "improvements" | "suggestions" | "continuous" | "agent";

type Report = {
  module: IntelligenceModule;
  title: string;
  status: "AI GENERATED" | "DEMO / LIMITED DATA" | "INSUFFICIENT LIVE EVIDENCE";
  summary: string;
  sections: Array<{ heading: string; items: Array<{ label: string; value: string }> }>;
  evidence: string[];
  generated_at: string;
};

const modulePrompts: Record<IntelligenceModule, string> = {
  review: "Review Report: sentiment, satisfaction, loves, dislikes, problems, requested features, customer needs, strengths, weaknesses, recommended actions.",
  scalability: "Scalability Strategy: target/geographic/segment expansion, pricing, features, distribution, retention, partnerships, growth priorities.",
  improvements: "Improvements: weaknesses, pain points, product issues, missing features, usability, value, trust, recommended fixes, next-generation actions.",
  suggestions: "New Product Suggestions: several product ideas, customer need, target users, core features, market opportunity, priority, reasoning.",
  continuous: "Continuous Report: latest product intelligence summary, changes to watch, next update priorities, and recommended monitoring questions.",
  agent: "AI Agent answer: answer the user's question about the product using only the supplied product and evidence context.",
};

function fallback(product: Record<string, unknown>, module: IntelligenceModule, question?: string): Report {
  const name = String(product.name || "this product");
  const audience = String(product.target_audience || "the stated target audience");
  const features = String(product.features || "No feature evidence was supplied.");
  const market = String(product.target_market || "No target market was supplied.");
  const base = { module, status: "DEMO / LIMITED DATA" as const, generated_at: new Date().toISOString(), evidence: [] as string[] };
  if (module === "agent") return { ...base, title: "CLYRA AI AGENT", summary: `No live intelligence report is available yet. I can only ground this answer in the saved product record. Question: ${question || "No question supplied."}`, sections: [{ heading: "AVAILABLE PRODUCT CONTEXT", items: [{ label: "PRODUCT", value: name }, { label: "AUDIENCE", value: audience }, { label: "MARKET", value: market }, { label: "FEATURES", value: features }] }] };
  const content: Record<IntelligenceModule, Report["sections"]> = {
    review: [{ heading: "CUSTOMER EVIDENCE", items: [{ label: "STATUS", value: "No customer reviews, interviews, or support records are attached." }, { label: "WHAT TO COLLECT", value: "Gather customer feedback before assigning sentiment or satisfaction scores." }] }, { heading: "PRODUCT CONTEXT", items: [{ label: "STATED AUDIENCE", value: audience }, { label: "STATED FEATURES", value: features }] }],
    scalability: [{ heading: "SCALABILITY STRATEGY", items: [{ label: "PRIORITY", value: "Validate demand with the stated audience before expanding." }, { label: "OPPORTUNITY", value: `Test adjacent segments related to ${audience}.` }, { label: "REASON", value: "No validated demand or retention evidence is available yet." }] }],
    improvements: [{ heading: "IMPROVEMENT INPUT", items: [{ label: "PROBLEM", value: "No verified customer pain point is available." }, { label: "EVIDENCE", value: "No customer evidence is attached to this product." }, { label: "NEXT ACTION", value: "Collect interviews, support tickets, or survey results before prioritizing fixes." }] }],
    suggestions: [{ heading: "BUILD NEXT", items: [{ label: "PRODUCT IDEA", value: `A companion workflow that helps ${audience} use ${name}.` }, { label: "WHY", value: "This is a hypothesis derived from the saved audience, not validated market evidence." }, { label: "PRIORITY", value: "LOW — validate with customers first." }] }],
    continuous: [{ heading: "REPORT STATUS", items: [{ label: "STATE", value: "DEMO / LIMITED DATA" }, { label: "MONITOR", value: `Track demand and customer feedback for ${name} in ${market}.` }, { label: "NEXT UPDATE", value: "Attach new evidence and manually update the report." }] }],
    agent: [],
  };
  return { ...base, title: module === "review" ? "REVIEW REPORT" : module === "scalability" ? "SCALABILITY STRATEGY" : module === "improvements" ? "IMPROVEMENTS" : module === "suggestions" ? "NEW PRODUCT SUGGESTIONS" : "CONTINUOUS REPORT", summary: `This is a limited-data product brief for ${name}. It does not claim live market or customer evidence.`, sections: content[module] };
}

async function getContext(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");
  const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).eq("user_id", user.id).maybeSingle();
  if (error || !product) throw new Error("Product not found.");
  const { data: market } = await supabase.from("market_analyses").select("market_readiness,readiness_reason,confidence,key_findings,reasoning,created_at").eq("product_id", productId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return { supabase, user, product, market };
}

function extractJson(text: string): unknown { const match = text.match(/\{[\s\S]*\}/); return JSON.parse(match ? match[0] : text); }

export async function generateIntelligence(productId: string, module: IntelligenceModule, question?: string) {
  const { supabase, user, product, market } = await getContext(productId);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let report = fallback(product, module, question);
  if (apiKey) {
    try {
      const prompt = `You are Clyra's evidence-bound product intelligence analyst. ${modulePrompts[module]} Return JSON with keys title, summary, sections (array of {heading,items:[{label,value}]}), evidence (array of URLs). Use only the product and market context below. Never invent customer quotes, statistics, sources, dates, or market facts. If evidence is absent, say so and label the output DEMO / LIMITED DATA. PRODUCT=${JSON.stringify(product)} MARKET=${JSON.stringify(market || {})} QUESTION=${question || ""}`;
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }), cache: "no-store" });
      if (response.ok) {
        const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const parsed = extractJson(payload.candidates?.[0]?.content?.parts?.[0]?.text || "");
        if (parsed && typeof parsed === "object") report = { ...report, ...(parsed as Partial<Report>), status: market ? "AI GENERATED" : "DEMO / LIMITED DATA", generated_at: new Date().toISOString() };
      }
    } catch { /* fall back to explicit limited-data output */ }
  }
  const { error: saveError } = await supabase.from("product_intelligence_reports").upsert({ user_id: user.id, product_id: productId, module, report }, { onConflict: "user_id,product_id,module" });
  if (saveError && !/relation .* does not exist/i.test(saveError.message)) throw new Error("Unable to save intelligence report.");
  revalidatePath(`/dashboard/product/${productId}`);
  revalidatePath(`/dashboard/product/${productId}/${module === "suggestions" ? "new-product-suggestions" : module === "continuous" ? "continuous-reports" : module === "agent" ? "ai-agent" : module}`);
  return { report, persisted: !saveError };
}

export async function getIntelligence(productId: string, module: IntelligenceModule) {
  const { supabase } = await getContext(productId);
  const { data } = await supabase.from("product_intelligence_reports").select("report").eq("product_id", productId).eq("module", module).maybeSingle();
  return (data?.report as Report | null) || null;
}

export async function saveReportSchedule(productId: string, frequency: "daily" | "weekly" | "monthly" | "custom", customInterval?: string) {
  const { supabase, user } = await getContext(productId);
  const { data, error } = await supabase.from("product_report_schedules").upsert({ user_id: user.id, product_id: productId, frequency, custom_interval: customInterval || null, active: true, updated_at: new Date().toISOString() }, { onConflict: "user_id,product_id" }).select("*").single();
  if (error) throw new Error("Unable to save report schedule. Apply migration 003 first.");
  revalidatePath(`/dashboard/product/${productId}/continuous-reports`);
  return data;
}

export async function getReportSchedule(productId: string) {
  const { supabase } = await getContext(productId);
  const { data } = await supabase.from("product_report_schedules").select("*").eq("product_id", productId).maybeSingle();
  return data;
}
