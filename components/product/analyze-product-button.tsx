"use client";

import { useState } from "react";
import { Activity, ArrowRight, AlertCircle } from "lucide-react";
import { queueProductAnalysis } from "@/app/(routes)/dashboard/product/actions";

export function AnalyzeProductButton({ productId, initialStatus }: { productId: string; initialStatus?: string }) {
  const [status, setStatus] = useState(initialStatus || "ready_for_analysis");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queued = status === "analysis_queued" || status === "queued";

  async function handleClick() {
    setIsSubmitting(true);
    setError(null);
    const result = await queueProductAnalysis(productId);
    if (result.error) setError(result.error);
    else setStatus("analysis_queued");
    setIsSubmitting(false);
  }

  return <div className="flex flex-col items-center border-t-4 border-[#111111] pt-12">
    {error && <div className="mb-6 flex items-center gap-2 border-2 border-[#CC0000] p-3 font-mono text-xs text-[#CC0000]"><AlertCircle className="h-4 w-4" />{error}</div>}
    {queued && <p className="mb-6 font-mono text-xs uppercase tracking-widest text-[#525252]">Analysis job queued. Results will appear when the intelligence engine is connected.</p>}
    <button onClick={handleClick} disabled={isSubmitting || queued} className="inline-flex items-center gap-2 border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] px-12 py-6 font-mono text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#111111] transition-all group disabled:opacity-50"><Activity className="h-5 w-5" /> {isSubmitting ? "Queueing..." : queued ? "Analysis Queued" : "Analyze Product"} <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></button>
  </div>;
}
