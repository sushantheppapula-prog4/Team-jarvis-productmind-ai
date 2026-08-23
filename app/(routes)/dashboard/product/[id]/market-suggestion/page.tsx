import Link from "next/link";
import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { getLatestMarketAnalysis } from "@/app/(routes)/dashboard/product/market-actions";
import { AnalyzeMarketButton } from "@/components/product/analyze-market-button";
import { IntelligenceBarChart, IntelligenceTable } from "@/components/product/intelligence-visuals";

function EvidenceLinks({ evidence, sources }: { evidence: string[]; sources: Array<{ id: string; url: string; title: string }> }) {
  const matches = evidence.map((url) => sources.find((source) => source.url === url)).filter(Boolean) as Array<{ id: string; url: string; title: string }>;
  if (!matches.length) return <span className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3]">Insufficient evidence attached</span>;
  return <span className="flex flex-wrap gap-3">{matches.map((source, index) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="font-mono text-[10px] uppercase tracking-widest underline decoration-1 underline-offset-4">Source {index + 1}: {source.title.slice(0, 54)}</a>)}</span>;
}

const label = "font-mono text-[10px] uppercase tracking-widest text-[#525252]";

export default async function MarketSuggestionPage({ params }: { params: { id: string } }) {
  const { product, error: productError } = await getProduct(params.id);
  if (productError || !product) return <div className="min-h-screen bg-[#F9F9F7] p-8 lg:p-12"><p className="font-mono text-xs uppercase tracking-widest text-[#CC0000]">{productError || "Product not found."}</p><Link href="/dashboard" className="mt-5 inline-block font-mono text-xs uppercase tracking-widest underline">Return to Dashboard</Link></div>;
  const { analysis, signals, sources, recommendations, error } = await getLatestMarketAnalysis(params.id);
  const opportunities = recommendations.filter((item: { recommendation_type: string }) => item.recommendation_type === "opportunity");
  const risks = recommendations.filter((item: { recommendation_type: string }) => item.recommendation_type === "risk");
  const actions = recommendations.filter((item: { recommendation_type: string }) => item.recommendation_type === "action");

  return <div className="min-h-screen bg-[#F9F9F7] p-8 lg:p-12">
    <div className="mb-10 border-b-4 border-[#111111] pb-7">
      <p className={label}>03 / Product Intelligence / {product.name}</p>
      <h1 className="mt-3 font-serif text-5xl font-black uppercase tracking-tight text-[#111111]">Market Suggestion</h1>
      <p className="mt-4 max-w-3xl font-body text-base leading-7 text-[#525252]">An evidence-based view of where, when, and why this product may enter the market.</p>
    </div>

    {error && !analysis && <div className="mb-8 border-2 border-[#CC0000] bg-[#FFF5F5] p-6"><p className="font-mono text-xs uppercase tracking-widest text-[#CC0000]">{error}</p><p className="mt-3 font-body text-sm leading-6 text-[#525252]">No market recommendation has been saved. Run the analysis again after the research provider and Gemini are configured.</p></div>}

    {!analysis && !error && <div className="mb-8 border-2 border-[#111111] bg-[#E5E5E0] p-8"><p className={label}>No saved analysis</p><p className="mt-3 max-w-2xl font-serif text-2xl font-bold text-[#111111]">Research this product against recent market signals.</p><p className="mt-3 max-w-2xl font-body text-sm leading-7 text-[#525252]">Clyra will retain the source title, URL, domain, date, and claim for every result it uses. If reliable evidence is unavailable, it will say so instead of inventing a recommendation.</p></div>}

    {analysis && <>
      <div className="grid grid-cols-1 gap-0 border-t-2 border-l-2 border-[#111111] md:grid-cols-2 lg:grid-cols-4">
        <div className="border-b-2 border-r-2 border-[#111111] bg-[#111111] p-6 text-[#F9F9F7]"><p className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3]">Market Readiness</p><p className="mt-4 font-serif text-3xl font-black uppercase">{analysis.market_readiness}</p></div>
        <div className="border-b-2 border-r-2 border-[#111111] p-6"><p className={label}>Recommended Launch Window</p><p className="mt-4 font-serif text-xl font-bold text-[#111111]">{analysis.recommended_launch_window}</p></div>
        <div className="border-b-2 border-r-2 border-[#111111] p-6"><p className={label}>Confidence</p><p className="mt-4 font-serif text-3xl font-black uppercase text-[#111111]">{analysis.confidence}</p></div>
        <div className="border-b-2 border-r-2 border-[#111111] p-6"><p className={label}>Sources</p><p className="mt-4 font-serif text-3xl font-black text-[#111111]">{sources.length}</p></div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="border-t-4 border-[#111111] pt-5"><p className={label}>Readiness Assessment</p><p className="mt-4 font-serif text-2xl font-bold text-[#111111]">{analysis.readiness_reason}</p><p className="mt-4 font-body text-sm leading-7 text-[#525252]">{analysis.launch_reasoning}</p></section>
        <section className="border-t-4 border-[#111111] pt-5"><p className={label}>Confidence Rationale</p><p className="mt-4 font-body text-sm leading-7 text-[#111111]">{analysis.confidence_reason}</p><p className="mt-4 font-body text-sm leading-7 text-[#525252]">{analysis.reasoning}</p></section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2"><IntelligenceBarChart title="Stored Signal Coverage" items={Array.from(new Set(signals.map((signal: { rating: string }) => signal.rating))).map((rating) => ({ label: rating, value: signals.filter((signal: { rating: string }) => signal.rating === rating).length }))} /><IntelligenceTable title="Signal Evidence Ledger" columns={["Signal", "Rating", "Explanation"]} rows={signals.map((signal: { signal_type: string; rating: string; explanation: string }) => [signal.signal_type, signal.rating, signal.explanation])} /></div>

      <section className="mt-12"><div className="mb-5 border-b-2 border-[#111111] pb-3"><p className={label}>Market Signals</p></div><div className="grid grid-cols-1 gap-0 border-t-2 border-l-2 border-[#111111] md:grid-cols-2">{signals.map((signal: { id: string; signal_type: string; rating: string; explanation: string; evidence: string[] }) => <article key={signal.id} className="border-b-2 border-r-2 border-[#111111] p-6"><div className="flex items-start justify-between gap-4"><p className={label}>{signal.signal_type}</p><span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">{signal.rating}</span></div><p className="mt-4 font-body text-sm leading-7 text-[#111111]">{signal.explanation}</p><div className="mt-4"><EvidenceLinks evidence={signal.evidence} sources={sources} /></div></article>)}</div></section>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {[{ title: "Opportunities", items: opportunities }, { title: "Risks", items: risks }, { title: "Recommended Action", items: actions }].map((section) => <section key={section.title} className="border-t-4 border-[#111111] pt-5"><p className={label}>{section.title}</p><div className="mt-5 space-y-6">{section.items.map((item: { id: string; priority: string; title: string; detail: string; evidence: string[] }) => <article key={item.id}><div className="flex items-start justify-between gap-3"><h3 className="font-serif text-xl font-bold text-[#111111]">{item.title}</h3><span className="font-mono text-[10px] uppercase tracking-widest text-[#CC0000]">{item.priority}</span></div><p className="mt-2 font-body text-sm leading-7 text-[#525252]">{item.detail}</p><div className="mt-3"><EvidenceLinks evidence={item.evidence} sources={sources} /></div></article>)}</div></section>)}
      </div>

      <section className="mt-12 border-t-4 border-[#111111] pt-5"><p className={label}>Key Findings</p><div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">{analysis.key_findings.map((finding: string, index: number) => <div key={`${finding}-${index}`} className="border-2 border-[#111111] p-5"><p className="font-mono text-xs font-bold text-[#CC0000]">0{index + 1}</p><p className="mt-3 font-body text-sm leading-7 text-[#111111]">{finding}</p></div>)}</div></section>

      <section className="mt-12 border-t-4 border-[#111111] pt-5"><p className={label}>Sources</p><div className="mt-5 space-y-4">{sources.map((source: { id: string; title: string; url: string; domain: string; publication_date: string | null; claim: string }) => <article key={source.id} className="border-b border-[#A3A3A3] pb-4"><a href={source.url} target="_blank" rel="noreferrer" className="font-serif text-lg font-bold underline decoration-1 underline-offset-4">{source.title}</a><p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[#525252]">{source.domain} · {source.publication_date || "Publication date unavailable"}</p><p className="mt-2 font-body text-sm leading-6 text-[#525252]">{source.claim}</p></article>)}</div></section>
    </>}

    <AnalyzeMarketButton productId={product.id} hasAnalysis={Boolean(analysis)} />
  </div>;
}
