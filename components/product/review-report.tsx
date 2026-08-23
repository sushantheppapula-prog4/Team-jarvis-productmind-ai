"use client";

import { useState } from "react";
import { RefreshCw, ArrowRight } from "lucide-react";
import { analyzeReviews, type ReviewReport } from "@/app/(routes)/dashboard/product/review-actions";
import { IntelligenceBarChart, IntelligencePieChart, IntelligenceTable } from "@/components/product/intelligence-visuals";

export function ReviewReportView({ productId, productName, initialReport }: { productId: string; productName: string; initialReport: ReviewReport | null }) {
  const [report, setReport] = useState<ReviewReport | null>(initialReport);
  const [status, setStatus] = useState(initialReport ? "COMPLETE" : "NO_ANALYSIS");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setMessage("");
    setStatus("COLLECTING_REVIEWS");
    try {
      const result = await analyzeReviews(productId);
      setReport(result.report);
      setStatus(result.status);
      setMessage(result.message);
    } catch (error) {
      setStatus("ERROR");
      setMessage(error instanceof Error ? error.message : "Review analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const findingSections = report ? [
    ["STRENGTHS", report.strengths],
    ["WEAKNESSES", report.weaknesses],
    ["COMPLAINTS", report.complaints],
    ["ACTUAL PRODUCT PROBLEMS", report.problems],
    ["COMPETITOR COMPARISON", report.competitor_comparison],
  ] as const : [];
  const observationSentiments = report ? (["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED"] as const).map((sentiment) => ({ label: sentiment, value: report.observations.filter((observation) => observation.sentiment === sentiment).length, color: sentiment === "POSITIVE" ? "#111111" : sentiment === "NEGATIVE" ? "#CC0000" : sentiment === "NEUTRAL" ? "#999999" : "#D9D9D4" })) : [];
  const issueTopics = report ? Array.from(new Set(report.observations.map((observation) => observation.topic))).map((topic) => ({ label: topic, value: report.observations.filter((observation) => observation.topic === topic).length })) : [];

  return <div className="min-h-screen bg-[#F9F9F7] p-8 lg:p-12">
    <header className="mb-10 border-b-4 border-[#111111] pb-6"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#CC0000]">Customer Evidence / Product Intelligence</p><h1 className="font-serif text-5xl font-black uppercase text-[#111111]">04 Review Report</h1><p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#525252]">What customers are saying, what they value, and what is actually going wrong.</p><p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[#525252]">Product: {productName}</p></header>
    <div className="mb-10 flex flex-wrap gap-3"><button onClick={run} disabled={loading} className="border-2 border-[#111111] bg-[#111111] px-7 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] hover:bg-[#CC0000] disabled:opacity-50">{loading ? "Collecting reviews..." : report ? "Analyze Again" : "Analyze Reviews"} <ArrowRight className="ml-2 inline h-4 w-4" /></button></div>
    {loading && <div className="mb-8 border-2 border-[#111111] p-6 font-mono text-xs uppercase tracking-widest">{status === "COLLECTING_REVIEWS" ? "COLLECTING REVIEWS..." : status === "ANALYZING_SENTIMENT" ? "ANALYZING SENTIMENT..." : "IDENTIFYING PROBLEMS..."}</div>}
    {!loading && message && <div className={`mb-8 border-2 p-6 font-mono text-xs uppercase tracking-widest ${status === "ERROR" ? "border-[#CC0000] text-[#CC0000]" : "border-[#111111]"}`}>{message}</div>}
    {!report && !loading && <div className="border-2 border-[#111111] p-10"><p className="font-serif text-2xl font-bold">{status === "NO_ANALYSIS" ? "NO ANALYSIS" : status}</p><p className="mt-3 max-w-2xl font-mono text-xs uppercase leading-6 tracking-widest text-[#525252]">No customer review report is displayed without validated external evidence. Run Analyze Reviews to collect public evidence, or wait until the research provider is available.</p></div>}
    {report && <div className="space-y-8"><section className="border-2 border-[#111111] bg-[#111111] p-8 text-[#F9F9F7]"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-serif text-3xl font-bold uppercase">Overall Sentiment</h2><span className="font-mono text-[10px] uppercase tracking-widest">{report.status}</span></div><p className="mt-5 max-w-4xl font-body text-sm leading-7">{report.summary}</p><p className="mt-5 font-mono text-xs uppercase tracking-widest">{report.overall_sentiment}</p>{report.sentiment_percentages && <p className="mt-3 font-mono text-xs uppercase tracking-widest">Positive {report.sentiment_percentages.positive}% · Neutral {report.sentiment_percentages.neutral}% · Negative {report.sentiment_percentages.negative}%</p>}</section>{report.observations.length ? <div className="grid gap-8 lg:grid-cols-2"><IntelligencePieChart title="Sentiment Distribution · Stored Observations" values={observationSentiments} /><IntelligenceBarChart title="Top Customer Issues · Stored Observations" items={issueTopics} /></div> : null}<section className="grid gap-8 md:grid-cols-3">{[["POSITIVE THEMES", report.positive_themes], ["NEGATIVE THEMES", report.negative_themes], ["EMERGING THEMES", report.emerging_themes]].map(([heading, values]) => <div key={heading as string} className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#CC0000]">{heading}</h3><p className="mt-4 font-serif text-lg leading-8">{(values as string[]).join(" · ") || "INSUFFICIENT REVIEW DATA"}</p></div>)}</section>{[["CUSTOMER NEEDS", report.customer_needs], ["FEATURE REQUESTS", report.feature_requests], ["RECOMMENDED ACTIONS", report.recommended_actions]].map(([heading, values]) => <section key={heading as string} className="border-t-2 border-[#111111] pt-5"><h3 className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#CC0000]">{heading}</h3><p className="border-2 border-[#111111] p-5 font-serif text-lg leading-8">{(values as string[]).join(" · ") || "INSUFFICIENT LIVE REVIEW EVIDENCE"}</p></section>)}{findingSections.map(([heading, findings]) => <section key={heading} className="border-t-2 border-[#111111] pt-5"><h3 className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#CC0000]">{heading}</h3>{findings.length ? <div className="grid gap-0 md:grid-cols-2">{findings.map((finding) => <article key={`${finding.kind}-${finding.title}`} className="border-2 border-[#111111] p-5"><p className="font-serif text-xl font-bold">{finding.title}</p><p className="mt-3 font-body text-sm leading-7">{finding.detail}</p>{finding.impact && <p className="mt-3 font-mono text-[10px] uppercase leading-5 tracking-widest">Impact: {finding.impact}</p>}<p className="mt-3 font-mono text-[10px] uppercase tracking-widest">{finding.classification || finding.severity || "Evidence-backed finding"}</p></article>)}</div> : <p className="border-2 border-[#111111] p-5 font-mono text-xs uppercase tracking-widest">{heading === "COMPETITOR COMPARISON" ? "COMPETITOR REVIEW DATA UNAVAILABLE" : "INSUFFICIENT REVIEW DATA"}</p>}</section>)}<section className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#CC0000]">Customer Signals</h3><div className="mt-5 space-y-4">{report.observations.length ? report.observations.map((observation, index) => <div key={`${observation.topic}-${index}`} className="border-2 border-[#111111] p-5"><p className="font-mono text-[10px] uppercase tracking-widest">{observation.sentiment} · {observation.topic}</p><p className="mt-3 font-serif text-lg">{observation.claim}</p><p className="mt-3 font-body text-sm">{observation.evidence}</p></div>) : <p className="border-2 border-[#111111] p-5 font-mono text-xs uppercase tracking-widest">INSUFFICIENT REVIEW DATA</p>}</div></section>{report.problems.length ? <IntelligenceTable title="Problems · Stored Findings" columns={["Problem", "Severity", "Evidence", "Impact"]} rows={report.problems.map((problem) => [problem.title, problem.severity || "UNSPECIFIED", problem.detail, problem.impact || "Not specified"])} /> : null}<section className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#CC0000]">Source Evidence</h3><div className="mt-5 space-y-3">{report.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block border-b border-[#111111] pb-3 font-mono text-xs uppercase tracking-wide underline"><span>{source.title}</span><span className="ml-2 no-underline">({source.domain})</span></a>)}</div><button onClick={run} className="mt-6 font-mono text-xs uppercase tracking-widest underline"><RefreshCw className="mr-2 inline h-3 w-3" />Analyze Again</button></section></div>}
  </div>;
}
