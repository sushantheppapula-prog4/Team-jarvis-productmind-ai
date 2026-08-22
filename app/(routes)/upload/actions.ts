"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitContext } from "@/lib/rate-limit";
import { PDFParse } from "pdf-parse";
import { logTelemetryEvent } from "@/lib/analytics";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_FILES = {
  csv: { mimeTypes: ["text/csv", "application/csv"], sourceType: "other" },
  json: { mimeTypes: ["application/json", "text/json"], sourceType: "other" },
  pdf: { mimeTypes: ["application/pdf"], sourceType: "other" },
  txt: { mimeTypes: ["text/plain"], sourceType: "other" },
} as const;

const sourceTypes: Record<string, string> = {
  Interviews: "interview",
  "Support Tickets": "support_ticket",
  Surveys: "survey",
  Reviews: "review",
  "Feature Requests": "feature_request",
  Other: "other",
};

function fail(message: string) {
  redirect(`/upload?error=${encodeURIComponent(message)}`);
}

async function parseFile(buffer: Buffer, fileType: string, fileName: string): Promise<string[]> {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "txt" || fileType.includes("text/plain")) {
    const text = buffer.toString("utf-8");
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  if (extension === "json" || fileType.includes("application/json")) {
    const text = buffer.toString("utf-8");
    const data = JSON.parse(text);
    let entries: string[] = [];
    if (Array.isArray(data)) {
      entries = data.map(item => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return item.content || item.text || item.feedback || JSON.stringify(item);
        }
        return String(item);
      });
    } else if (data && typeof data === "object") {
      const content = data.content || data.text || data.feedback;
      if (content) {
        entries = [String(content)];
      } else {
        entries = [JSON.stringify(data)];
      }
    }
    return entries.map(s => s.trim()).filter(Boolean);
  }

  if (extension === "csv" || fileType.includes("text/csv") || fileType.includes("application/csv")) {
    const text = buffer.toString("utf-8");
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];

    const parseCSVLine = (line: string) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ""));
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    let contentIdx = headers.findIndex(h => ["content", "feedback", "text", "body", "message"].includes(h));
    if (contentIdx === -1) {
      contentIdx = 0; // fallback to first column
    }

    const entries: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = parseCSVLine(line);
      const cellVal = cells[contentIdx];
      if (cellVal) {
        entries.push(cellVal);
      }
    }
    return entries;
  }

  if (extension === "pdf" || fileType.includes("application/pdf")) {
    const parser = new PDFParse(buffer);
    const result = await parser.getText();
    const text = result.text || "";
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 5);
  }

  throw new Error(`Unsupported file type for parsing: ${extension || fileType}`);
}

function generateLocalInsights(feedbackTexts: string[], projectId: string, userId: string, jobId: string) {
  const insights: any[] = [];

  // Group feedback items using standard text patterns
  const bugEntries = feedbackTexts.filter(t => /\b(bug|error|crash|fail|broken|issue|incorrect|wrong|not working)\b/i.test(t));
  const painEntries = feedbackTexts.filter(t => /\b(slow|hard|difficult|confusing|annoying|hate|bad|missing|fail)\b/i.test(t));
  const featureEntries = feedbackTexts.filter(t => /\b(want|need|add|please|feature|would be great|allow|support|export)\b/i.test(t));
  const positiveEntries = feedbackTexts.filter(t => /\b(good|great|love|awesome|thanks|best|easy|clean|happy)\b/i.test(t));

  if (bugEntries.length > 0) {
    insights.push({
      project_id: projectId,
      analysis_job_id: jobId,
      user_id: userId,
      category: "pain_point",
      title: "System Error Reports & Bug Logs",
      summary: `Identified ${bugEntries.length} feedback item(s) reporting errors: ${bugEntries.slice(0, 2).map(e => `"${e}"`).join(", ")}`,
      confidence: 0.85,
      metadata: {
        sentiment: "negative",
        is_bug: true,
        sub_type: "bug",
        count: bugEntries.length,
      },
    });
  }

  if (painEntries.length > 0) {
    insights.push({
      project_id: projectId,
      analysis_job_id: jobId,
      user_id: userId,
      category: "pain_point",
      title: "Usability Friction Points",
      summary: `Found ${painEntries.length} occurrences describing frustration or complexity: ${painEntries.slice(0, 2).map(e => `"${e}"`).join(", ")}`,
      confidence: 0.80,
      metadata: {
        sentiment: "negative",
        is_bug: false,
        sub_type: "usability",
        count: painEntries.length,
      },
    });
  }

  if (featureEntries.length > 0) {
    insights.push({
      project_id: projectId,
      analysis_job_id: jobId,
      user_id: userId,
      category: "feature_request",
      title: "Enhancement & Feature Requests",
      summary: `Extracted requests for ${featureEntries.length} new capability or support enhancement(s): ${featureEntries.slice(0, 2).map(e => `"${e}"`).join(", ")}`,
      confidence: 0.90,
      metadata: {
        sentiment: "neutral",
        is_bug: false,
        sub_type: "request",
        count: featureEntries.length,
      },
    });
  }

  if (positiveEntries.length > 0) {
    insights.push({
      project_id: projectId,
      analysis_job_id: jobId,
      user_id: userId,
      category: "trend",
      title: "User Satisfaction & Positive Highlights",
      summary: `Captured ${positiveEntries.length} notes showcasing design highlights and user satisfaction.`,
      confidence: 0.95,
      metadata: {
        sentiment: "positive",
        is_bug: false,
        sub_type: "praise",
        count: positiveEntries.length,
      },
    });
  }

  if (insights.length === 0 && feedbackTexts.length > 0) {
    insights.push({
      project_id: projectId,
      analysis_job_id: jobId,
      user_id: userId,
      category: "other",
      title: "Uncategorized User Insights",
      summary: `Analyzed entries: ${feedbackTexts.slice(0, 3).join("; ")}`,
      confidence: 0.70,
      metadata: {
        sentiment: "neutral",
        is_bug: false,
        sub_type: "general",
        count: feedbackTexts.length,
      },
    });
  }

  return insights;
}

async function processAnalysisJob(jobId: string, projectId: string, userId: string, sourceId: string) {
  const supabase = await createClient();

  // 1. Update job status to processing
  await supabase
    .from("analysis_jobs")
    .update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", jobId);

  try {
    // 2. Fetch feedback items related to this source
    const { data: feedbackItems, error: itemsError } = await supabase
      .from("feedback_items")
      .select("content")
      .eq("feedback_source_id", sourceId);

    if (itemsError || !feedbackItems || feedbackItems.length === 0) {
      throw new Error(itemsError?.message || "No feedback items found to analyze.");
    }

    const feedbackTexts = feedbackItems.map(item => item.content);

    // 3. Invoke LLM or fallback locally
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    let generatedInsights: any[] = [];

    if (apiKey) {
      try {
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const prompt = `You are a product intelligence analyzer. Analyze the following list of customer feedback entries:
${feedbackTexts.map((t, i) => `[Feedback #${i + 1}]: ${t}`).join("\n")}

Extract product insights categorized into:
- Feature Requests (category: "feature_request")
- Pain Points (category: "pain_point")
- Bugs (category: "pain_point", flag in metadata as bug: true)
- Positive Feedback / Trends (category: "trend" or "other")

For each insight, provide:
1. Category: "feature_request", "pain_point", "trend", or "other"
2. Title: A concise, action-oriented title (e.g., "Bulk Export Automation")
3. Summary: A short explanation detailing the context and frequency of the feedback.
4. Confidence: A decimal between 0.0 and 1.0 based on clarity and frequency.
5. Metadata: A JSON object containing:
   - "sentiment": "positive", "negative", or "neutral"
   - "is_bug": boolean
   - "sub_type": string (e.g. "bug", "ui", "performance", "request")
   - "count": number of matching entries referencing this theme

Return ONLY a JSON object with this exact structure:
{
  "insights": [
    {
      "category": "feature_request",
      "title": "...",
      "summary": "...",
      "confidence": 0.9,
      "metadata": {
        "sentiment": "neutral",
        "is_bug": false,
        "sub_type": "request",
        "count": 2
      }
    }
  ]
}
`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(jsonText.trim());

        if (parsed && Array.isArray(parsed.insights)) {
          generatedInsights = parsed.insights.map((ins: any) => ({
            project_id: projectId,
            analysis_job_id: jobId,
            user_id: userId,
            category: ins.category || "other",
            title: ins.title || "User Insight",
            summary: ins.summary || "",
            confidence: typeof ins.confidence === "number" ? ins.confidence : 0.8,
            metadata: ins.metadata || {},
          }));
        }
      } catch (llmError) {
        console.warn("LLM API call failed, falling back to local extractor:", llmError);
        generatedInsights = generateLocalInsights(feedbackTexts, projectId, userId, jobId);
      }
    } else {
      generatedInsights = generateLocalInsights(feedbackTexts, projectId, userId, jobId);
    }

    // 4. Save results to insights table
    if (generatedInsights.length > 0) {
      const { error: insertError } = await supabase
        .from("insights")
        .insert(generatedInsights);

      if (insertError) throw insertError;
    }

    // 5. Update job status to completed
    await supabase
      .from("analysis_jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", jobId);

  } catch (error: any) {
    console.error("Job analysis failed:", error);
    // 6. Update job status to failed
    await supabase
      .from("analysis_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: error.message || String(error),
      })
      .eq("id", jobId);
  }
}

export async function uploadFeedback(formData: FormData) {
  const rlContext = await getRateLimitContext();
  const rl = await checkRateLimit("upload", rlContext);
  if (!rl.success) return { error: "Too many upload requests. Please try again later.", success: false };

  const file = formData.get("file") as File | null;
  const selectedType = String(formData.get("sourceType") ?? "Other");

  if (!file || typeof file === "string" || file.size === 0) return fail("Select a file to upload.");
  if (file.size > MAX_FILE_SIZE) return fail("Files must be 20 MB or smaller.");

  const extension = file.name.split(".").pop()?.toLowerCase();
  const fileConfig = extension ? ALLOWED_FILES[extension as keyof typeof ALLOWED_FILES] : undefined;
  if (!fileConfig || (file.type && !fileConfig.mimeTypes.includes(file.type as never))) {
    return fail("Only CSV, PDF, TXT, and JSON files are supported.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login?next=/upload");

  // Log telemetry event
  void logTelemetryEvent("file_upload", { fileName: file.name, sizeBytes: file.size, type: selectedType });

  const { data: existingProject, error: projectLookupError } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (projectLookupError) return fail("Unable to prepare your project for upload.");

  let projectId = existingProject?.id;
  if (!projectId) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: "My feedback" })
      .select("id")
      .single();

    if (projectError || !project) return fail("Unable to create a project for this upload.");
    projectId = project.id;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${user.id}/${projectId}/${crypto.randomUUID()}-${safeName}`;
  const { error: storageError } = await supabase.storage
    .from("feedback-uploads")
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (storageError) return fail("Unable to store the selected file.");

  // Insert feedback source as "pending"
  const { data: insertedSource, error: sourceError } = await supabase
    .from("feedback_sources")
    .insert({
      project_id: projectId,
      user_id: user.id,
      name: file.name,
      source_type: sourceTypes[selectedType] ?? fileConfig.sourceType,
      status: "pending",
      metadata: {
        storage_bucket: "feedback-uploads",
        storage_path: storagePath,
        original_filename: file.name,
        mime_type: file.type || null,
        file_size: file.size,
      },
    })
    .select("id")
    .single();

  if (sourceError || !insertedSource) {
    await supabase.storage.from("feedback-uploads").remove([storagePath]);
    return fail("Unable to save the upload metadata.");
  }

  // 1. Read uploaded file back from Supabase Storage
  const { data: storageBlob, error: downloadError } = await supabase.storage
    .from("feedback-uploads")
    .download(storagePath);

  if (downloadError || !storageBlob) {
    await supabase
      .from("feedback_sources")
      .update({ status: "failed" })
      .eq("id", insertedSource.id);
    return fail("Unable to retrieve the uploaded file for parsing.");
  }

  // 2. Parse file into individual feedback entries
  let entries: string[] = [];
  try {
    const arrayBuffer = await storageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    entries = await parseFile(buffer, file.type, file.name);
  } catch (parseErr) {
    console.error("Parsing error:", parseErr);
    await supabase
      .from("feedback_sources")
      .update({ status: "failed" })
      .eq("id", insertedSource.id);
    return fail("Failed to parse the content of the uploaded file.");
  }

  // 3. Insert entries into feedback_items
  if (entries.length > 0) {
    const feedbackItemsToInsert = entries.map((content, idx) => ({
      feedback_source_id: insertedSource.id,
      project_id: projectId,
      user_id: user.id,
      content: content,
      external_id: `${insertedSource.id}-${idx}`,
      metadata: {},
    }));

    const { error: itemsError } = await supabase
      .from("feedback_items")
      .insert(feedbackItemsToInsert);

    if (itemsError) {
      console.error("Error inserting feedback items:", itemsError);
      await supabase
        .from("feedback_sources")
        .update({ status: "failed" })
        .eq("id", insertedSource.id);
      return fail("Failed to save the parsed feedback entries.");
    }
  }

  // 4. Create analysis_jobs with status='queued'
  const { data: insertedJob, error: jobError } = await supabase
    .from("analysis_jobs")
    .insert({
      project_id: projectId,
      feedback_source_id: insertedSource.id,
      user_id: user.id,
      status: "queued",
      job_type: "analysis",
    })
    .select("id")
    .single();

  if (jobError || !insertedJob) {
    console.error("Error creating analysis job:", jobError);
    await supabase
      .from("feedback_sources")
      .update({ status: "failed" })
      .eq("id", insertedSource.id);
    return fail("Failed to queue the analysis job.");
  }

  // 5. Trigger the analysis job execution synchronously
  await processAnalysisJob(insertedJob.id, projectId, user.id, insertedSource.id);

  // 6. Generate the Executive Report automatically
  try {
    const { generateExecutiveSummary } = await import("../reports/actions");
    await generateExecutiveSummary();
  } catch (reportError) {
    console.error("Failed to automatically generate executive report during post-upload:", reportError);
  }

  // 7. Update source status to "ready"
  const { error: updateReadyError } = await supabase
    .from("feedback_sources")
    .update({ status: "ready" })
    .eq("id", insertedSource.id);

  if (updateReadyError) {
    console.error("Error updating source status to ready:", updateReadyError);
  }

  revalidatePath("/upload");
  redirect("/upload?uploaded=1");
}

export async function uploadFeedbackFile(formData: FormData) {
  console.log(" [Upload Action] Starting file upload...");
  const file = formData.get("file") as File | null;
  const selectedType = String(formData.get("sourceType") ?? "Other");

  if (!file || typeof file === "string" || file.size === 0) {
    console.error(" [Upload Action] No file selected.");
    throw new Error("Select a file to upload.");
  }
  if (file.size > MAX_FILE_SIZE) {
    console.error(` [Upload Action] File is too large: ${file.size} bytes`);
    throw new Error("Files must be 20 MB or smaller.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const fileConfig = extension ? ALLOWED_FILES[extension as keyof typeof ALLOWED_FILES] : undefined;
  if (!fileConfig || (file.type && !fileConfig.mimeTypes.includes(file.type as never))) {
    console.error(` [Upload Action] Unsupported file type or extension: ${file.name} (${file.type})`);
    throw new Error("Only CSV, PDF, TXT, and JSON files are supported.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error(" [Upload Action] User is not authenticated.");
    throw new Error("Unauthorized.");
  }
  console.log(` [Upload Action] Authenticated user: ${user.email} (ID: ${user.id})`);

  // Log telemetry event
  void logTelemetryEvent("file_upload", { fileName: file.name, sizeBytes: file.size, type: selectedType });

  console.log(" [Upload Action] Resolving active project...");
  const { data: existingProject, error: projectLookupError } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (projectLookupError) {
    console.error(" [Upload Action] Project lookup error:", projectLookupError);
    throw new Error("Unable to prepare your project for upload.");
  }

  let projectId = existingProject?.id;
  if (!projectId) {
    console.log(" [Upload Action] No existing project found. Creating a new project...");
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: "My feedback" })
      .select("id")
      .single();

    if (projectError || !project) {
      console.error(" [Upload Action] Failed to create project:", projectError);
      throw new Error("Unable to create a project for this upload.");
    }
    projectId = project.id;
  }
  console.log(` [Upload Action] Project resolved: ${projectId}`);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${user.id}/${projectId}/${crypto.randomUUID()}-${safeName}`;
  console.log(` [Upload Action] Uploading buffer to Supabase Storage path: ${storagePath}...`);
  const { error: storageError } = await supabase.storage
    .from("feedback-uploads")
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (storageError) {
    console.error(" [Upload Action] Supabase Storage upload error:", storageError);
    throw new Error("Unable to store the selected file.");
  }
  console.log(" [Upload Action] File successfully saved to storage.");

  console.log(" [Upload Action] Inserting feedback_sources metadata row...");
  const { data: insertedSource, error: sourceError } = await supabase
    .from("feedback_sources")
    .insert({
      project_id: projectId,
      user_id: user.id,
      name: file.name,
      source_type: sourceTypes[selectedType] ?? fileConfig.sourceType,
      status: "pending",
      metadata: {
        storage_bucket: "feedback-uploads",
        storage_path: storagePath,
        original_filename: file.name,
        mime_type: file.type || null,
        file_size: file.size,
      },
    })
    .select("id")
    .single();

  if (sourceError || !insertedSource) {
    console.error(" [Upload Action] Failed to save source metadata:", sourceError);
    await supabase.storage.from("feedback-uploads").remove([storagePath]);
    throw new Error("Unable to save the upload metadata.");
  }
  console.log(` [Upload Action] Feedback source metadata inserted: ${insertedSource.id}`);

  return {
    sourceId: insertedSource.id,
    projectId,
    storagePath,
    fileType: file.type,
    fileName: file.name,
  };
}

export async function parseFeedbackFile(
  sourceId: string,
  projectId: string,
  storagePath: string,
  fileType: string,
  fileName: string
) {
  console.log(` [Parse Action] Downloading file from storage for source: ${sourceId}...`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error(" [Parse Action] User is not authenticated.");
    throw new Error("Unauthorized.");
  }

  const { data: storageBlob, error: downloadError } = await supabase.storage
    .from("feedback-uploads")
    .download(storagePath);

  if (downloadError || !storageBlob) {
    console.error(" [Parse Action] Supabase Storage download error:", downloadError);
    await supabase
      .from("feedback_sources")
      .update({ status: "failed" })
      .eq("id", sourceId);
    throw new Error("Unable to retrieve the uploaded file for parsing.");
  }
  console.log(" [Parse Action] File downloaded. Starting parsing...");

  let entries: string[] = [];
  try {
    const arrayBuffer = await storageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    entries = await parseFile(buffer, fileType, fileName);
    console.log(` [Parse Action] File parsing succeeded. Extracted ${entries.length} feedback entries.`);
  } catch (parseErr: any) {
    console.error(" [Parse Action] Parsing error:", parseErr);
    await supabase
      .from("feedback_sources")
      .update({ status: "failed" })
      .eq("id", sourceId);
    throw new Error(`Failed to parse the content of the uploaded file: ${parseErr.message || parseErr}`);
  }

  if (entries.length > 0) {
    console.log(` [Parse Action] Saving ${entries.length} feedback items to feedback_items table...`);
    const feedbackItemsToInsert = entries.map((content, idx) => ({
      feedback_source_id: sourceId,
      project_id: projectId,
      user_id: user.id,
      content: content,
      external_id: `${sourceId}-${idx}`,
      metadata: {},
    }));

    const { error: itemsError } = await supabase
      .from("feedback_items")
      .insert(feedbackItemsToInsert);

    if (itemsError) {
      console.error(" [Parse Action] Error inserting feedback items:", itemsError);
      await supabase
        .from("feedback_sources")
        .update({ status: "failed" })
        .eq("id", sourceId);
      throw new Error(`Failed to save the parsed feedback entries: ${itemsError.message}`);
    }
    console.log(" [Parse Action] Successfully saved feedback items to database.");
  } else {
    console.warn(" [Parse Action] Warning: Parsed feedback file contains no feedback entries.");
  }

  return { entriesCount: entries.length };
}

export async function analyzeFeedback(sourceId: string, projectId: string) {
  const rlContext = await getRateLimitContext();
  const rl = await checkRateLimit("ai_analysis", rlContext);
  if (!rl.success) return { error: "Too many AI analysis requests. Please try again later.", success: false };

  console.log(` [Analyze Action] Creating analysis job for source: ${sourceId}...`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error(" [Analyze Action] User is not authenticated.");
    throw new Error("Unauthorized.");
  }

  const { data: insertedJob, error: jobError } = await supabase
    .from("analysis_jobs")
    .insert({
      project_id: projectId,
      feedback_source_id: sourceId,
      user_id: user.id,
      status: "queued",
      job_type: "analysis",
    })
    .select("id")
    .single();

  if (jobError || !insertedJob) {
    console.error(" [Analyze Action] Error creating analysis job in database:", jobError);
    await supabase
      .from("feedback_sources")
      .update({ status: "failed" })
      .eq("id", sourceId);
    throw new Error(`Failed to queue the analysis job: ${jobError.message}`);
  }
  console.log(` [Analyze Action] Analysis job created: ${insertedJob.id}. Triggering job...`);

  try {
    await processAnalysisJob(insertedJob.id, projectId, user.id, sourceId);
    console.log(" [Analyze Action] processAnalysisJob finished successfully. Generating Executive Report...");
  } catch (analysisErr: any) {
    console.error(" [Analyze Action] Analysis job error:", analysisErr);
    await supabase
      .from("feedback_sources")
      .update({ status: "failed" })
      .eq("id", sourceId);
    throw new Error(`AI Analysis failed: ${analysisErr.message || analysisErr}`);
  }

  try {
    const { generateExecutiveSummary } = await import("../reports/actions");
    await generateExecutiveSummary();
    console.log(" [Analyze Action] Executive Summary generated and saved successfully.");
  } catch (reportError: any) {
    console.error(" [Analyze Action] Executive report generation error:", reportError);
    // We don't fail the whole upload if only report fails, but we log it.
  }

  console.log(" [Analyze Action] Updating source status to 'ready'...");
  const { error: updateReadyError } = await supabase
    .from("feedback_sources")
    .update({ status: "ready" })
    .eq("id", sourceId);

  if (updateReadyError) {
    console.error(" [Analyze Action] Error updating source status to ready:", updateReadyError);
    throw new Error(`Failed to update feedback source status: ${updateReadyError.message}`);
  }
  console.log(" [Analyze Action] Upload and analysis pipeline completed successfully!");

  revalidatePath("/upload");
  revalidatePath("/insights");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  
  return { success: true };
}
