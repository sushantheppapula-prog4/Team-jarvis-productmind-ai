"use client";

import { useState, useTransition } from "react";
import { analyzeMarket } from "@/app/(routes)/dashboard/product/market-actions";

export function AnalyzeMarketButton({ productId, hasAnalysis }: { productId: string; hasAnalysis: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");

  function run(forceRefresh: boolean) {
    setError("");
    setStage("RESEARCHING MARKET");
    startTransition(async () => {
      const timers = [
        window.setTimeout(() => setStage("ANALYZING SIGNALS"), 700),
        window.setTimeout(() => setStage("COMPARING PRODUCT"), 1500),
        window.setTimeout(() => setStage("GENERATING RECOMMENDATION"), 2400),
      ];
      const result = await analyzeMarket(productId, forceRefresh);
      timers.forEach(window.clearTimeout);
      if (result.error) {
        setStage("");
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="mt-10 border-t-4 border-[#111111] pt-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">Evidence-led research</p>
          <p className="mt-2 max-w-2xl font-serif text-xl font-bold text-[#111111]">Market timing is a recommendation, not a promise of success.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {hasAnalysis && <button type="button" onClick={() => run(true)} disabled={isPending} className="border-2 border-[#111111] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#111111] transition-colors hover:bg-[#E5E5E0] disabled:cursor-wait disabled:opacity-50">{isPending ? "RESEARCHING..." : "ANALYZE AGAIN"}</button>}
          {!hasAnalysis && <button type="button" onClick={() => run(false)} disabled={isPending} className="border-2 border-[#111111] bg-[#111111] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#F9F9F7] transition-colors hover:bg-[#CC0000] disabled:cursor-wait disabled:opacity-50">{isPending ? "WORKING..." : "ANALYZE MARKET"}</button>}
        </div>
      </div>
      {(isPending || stage) && <div className="mt-6 border-2 border-[#111111] bg-[#E5E5E0] p-5 font-mono text-xs font-bold uppercase tracking-widest text-[#111111]">{stage || "WORKING"}</div>}
      {error && <div role="alert" className="mt-6 border-2 border-[#CC0000] bg-[#FFF5F5] p-5 font-mono text-xs uppercase tracking-widest text-[#CC0000]">{error}</div>}
    </div>
  );
}
