"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitContext } from "@/lib/rate-limit";
import { logTelemetryEvent } from "@/lib/analytics";

// Process-level in-memory rate-limiter for API calls
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(userId: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function askConsultant(
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const trimmedQuestion = question.trim();
  
  // 1. Input validation & sanitization
  if (!trimmedQuestion) {
    throw new Error("Question cannot be empty.");
  }
  if (trimmedQuestion.length > 1000) {
    throw new Error("Question exceeds the maximum length of 1000 characters.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  // Log telemetry event
  void logTelemetryEvent("ai_request", { questionLength: trimmedQuestion.length });

  // 2. Rate limiting protection
  if (isRateLimited(user.id)) {
    throw new Error("Too many requests. Please wait a minute before trying again.");
  }

  // Check user subscription plan
  const plan = user.user_metadata?.plan || "free";

  // 3. Extract keywords from the question
  const keywords = trimmedQuestion
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 3);

  // 4. Query Supabase feedback_items & insights (Optimized query fields & limits)
  let itemsQuery = supabase.from("feedback_items").select("content").eq("user_id", user.id);
  if (keywords.length > 0) {
    const orCondition = keywords.map(kw => `content.ilike.%${kw}%`).join(",");
    itemsQuery = itemsQuery.or(orCondition);
  }
  const { data: items } = await itemsQuery.limit(10);

  let insightsQuery = supabase.from("insights").select("title, summary, category").eq("user_id", user.id);
  if (keywords.length > 0) {
    const orCondition = keywords.map(kw => `title.ilike.%${kw}%,summary.ilike.%${kw}%`).join(",");
    insightsQuery = insightsQuery.or(orCondition);
  }
  const { data: insights } = await insightsQuery.limit(5);

  // Fallbacks if no direct match (Optimized limits)
  let relevantItems = items || [];
  if (relevantItems.length === 0) {
    const { data: recentItems } = await supabase
      .from("feedback_items")
      .select("content")
      .eq("user_id", user.id)
      .limit(10);
    relevantItems = recentItems || [];
  }

  let relevantInsights = insights || [];
  if (relevantInsights.length === 0) {
    const { data: recentInsights } = await supabase
      .from("insights")
      .select("title, summary, category")
      .eq("user_id", user.id)
      .limit(5);
    relevantInsights = recentInsights || [];
  }

  // 5. Build RAG context
  const context = `
Relevant Feedback Items:
${relevantItems.map((item, idx) => `- [Feedback #${idx + 1}]: ${item.content}`).join("\n")}

Relevant Insights:
${relevantInsights.map((ins, idx) => `- [Insight #${idx + 1}] (${ins.category}): ${ins.title} - ${ins.summary}`).join("\n")}
`;

  // 6. Send query to configured LLM with history (restricted to Pro/Team plans)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let aiResponse = "";

  if (plan === "free") {
    // Restrict free plans to local fallback responder
    const fallbackAnswer = `Hello! [Free Tier Plan] Based on the customer feedback and insights found in your project:
${relevantInsights.map(i => `- ${i.title} (${i.category}): ${i.summary}`).join("\n") || "No matching product insights found in your project yet. Try uploading more feedback files."}

Upgrade to a Pro or Team plan to unlock conversational Gemini AI consulting capabilities!`;

    aiResponse = `${fallbackAnswer}\n\n[SUGGESTIONS]\n- How do I upgrade my plan?\n- What is the most critical pain point?\n- Can you detail the feature requests?`;
  } else if (apiKey) {
    try {
      const model = "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const systemPrompt = `You are Clyra, an AI-powered customer intelligence platform. Your role is to analyze unstructured customer feedback and related product information to identify patterns, pain points, opportunities and actionable product insights. Answer the user's question using the provided context of customer feedback and extracted product insights. Be concise, direct, and helpful.

At the very end of your response, output a separator line containing exactly "[SUGGESTIONS]" and then list exactly 3 short, relevant follow-up questions that the user might want to ask next, each on a new line prefixed with "- ". Do not add any text after the suggestions.`;

      // Map history to Gemini format (limiting to last 10 messages to prevent token bloat & save payload)
      const contents: any[] = [];
      const recentHistory = history.slice(-10);
      
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content.substring(0, 1000) }],
        });
      }

      // Add current message with RAG context
      contents.push({
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nContext:\n${context}\n\nQuestion: ${trimmedQuestion}` }],
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (llmError: any) {
      console.error("LLM call failed:", llmError);
      const fallbackAns = `The AI consultant encountered a connection issue. Here is the keyword search context compiled from your workspace:
${relevantInsights.map(i => `- ${i.title} (${i.category}): ${i.summary}`).join("\n") || "No insights found."}`;
      aiResponse = `${fallbackAns}\n\n[SUGGESTIONS]\n- What is the most critical pain point?\n- Can you detail the feature requests?\n- Show me the positive feedback highlights.`;
    }
  } else {
    // Local fallback responder for Pro/Team if API key is not configured
    const fallbackAnswer = `Hello! [Pro Tier Fallback] Based on the customer feedback and insights found in your project:
${relevantInsights.map(i => `- ${i.title} (${i.category}): ${i.summary}`).join("\n") || "No matching product insights found in your project yet. Try uploading more feedback files."}

(Note: Set GEMINI_API_KEY in your environment to unlock full conversational AI consulting responses.)`;

    aiResponse = `${fallbackAnswer}\n\n[SUGGESTIONS]\n- What is the most critical pain point?\n- Can you detail the feature requests?\n- Show me the positive feedback highlights.`;
  }

  // Append serialised RAG source list at the very end
  const responseWithSources = `${aiResponse}\n\n[SOURCES]\n${JSON.stringify({
    items: relevantItems,
    insights: relevantInsights,
  })}`;

  return responseWithSources;
}
