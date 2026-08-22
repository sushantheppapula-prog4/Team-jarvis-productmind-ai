"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSharedReport } from "../../actions";
import { AlertCircle, Award, CheckCircle2 } from "lucide-react";
import { useSearchParams, useParams } from "next/navigation";

interface ReportContent {
  title: string;
  overall_sentiment: string;
  sentiment_summary: string;
  top_pain_points: string[];
  requested_features: string[];
  key_bugs: string[];
  positive_feedback: string[];
  recommended_actions: string[];
}

export default function SharedReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reportId = params?.id as string;
  const token = searchParams?.get("token") || "";

  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShared() {
      if (!reportId || !token) {
        setError("Invalid shared link parameters.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSharedReport(reportId, token);
        setReport(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load shared report.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadShared();
  }, [reportId, token]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-500";
      case "negative":
        return "border-rose-500/20 bg-rose-500/5 text-rose-500";
      case "mixed":
        return "border-amber-500/20 bg-amber-500/5 text-amber-500";
      default:
        return "border-[#111111] bg-[#F9F9F7] text-[#525252]";
    }
  };

  const reportData = report?.content as ReportContent | undefined;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 overflow-y-auto max-h-screen">
      <div className="flex flex-col space-y-2 border-b border-[#111111] pb-4">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">ProductMind AI • Read Only Shared Report</span>
        <h1 className="text-3xl font-extrabold text-[#111111]">{reportData?.title || "Executive Summary"}</h1>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-muted rounded-none w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted rounded-none" />
            <div className="h-64 bg-muted rounded-none" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-none border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-[#111111]">Access Denied</h2>
          <p className="text-sm text-[#525252]">{error}</p>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold">Executive Analysis</h2>
              <span className={`px-2.5 py-1 rounded-none text-xs font-semibold uppercase tracking-wider border ${getSentimentColor(reportData.overall_sentiment)}`}>
                {reportData.overall_sentiment} Sentiment
              </span>
            </div>
            <p className="text-sm text-[#525252] leading-relaxed">
              {reportData.sentiment_summary}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
              <h3 className="font-semibold text-base border-b border-[#111111] pb-2 text-[#111111]">Top Pain Points</h3>
              <ul className="space-y-3">
                {reportData.top_pain_points.map((p, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[#525252]">
                    <span className="text-primary font-bold">{idx + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
              <h3 className="font-semibold text-base border-b border-[#111111] pb-2 text-[#111111]">Most Requested Features</h3>
              <ul className="space-y-3">
                {reportData.requested_features.map((f, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[#525252]">
                    <span className="text-primary font-bold">★</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
              <h3 className="font-semibold text-base border-b border-[#111111] pb-2 text-[#111111]">Key Bug Issues</h3>
              <ul className="space-y-3">
                {reportData.key_bugs.length > 0 ? (
                  reportData.key_bugs.map((b, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-[#525252]">
                      <span className="text-destructive font-bold">!</span>
                      <span>{b}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#525252]">No bug reports identified.</li>
                )}
              </ul>
            </div>

            <div className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
              <h3 className="font-semibold text-base border-b border-[#111111] pb-2 text-[#111111]">Positive Signals</h3>
              <ul className="space-y-3">
                {reportData.positive_feedback.map((p, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-[#525252]">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-none border-2 border-[#111111] bg-[#F9F9F7] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#111111] pb-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base text-[#111111]">Recommended Next Actions</h3>
            </div>
            <ul className="space-y-3">
              {reportData.recommended_actions.map((act, idx) => (
                <li key={idx} className="flex gap-3 items-start text-sm text-[#525252]">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
