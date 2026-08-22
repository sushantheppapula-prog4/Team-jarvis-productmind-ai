import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { getProduct } from "@/app/(routes)/dashboard/product/actions";
import { AnalyzeProductButton } from "@/components/product/analyze-product-button";

export default async function ProductWorkspace({ params }: { params: { id: string } }) {
  const { product, error } = await getProduct(params.id);

  if (error || !product) return <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center text-center"><p className="font-mono text-xs uppercase tracking-widest text-[#CC0000]">{error || "Product not found."}</p><Link href="/dashboard" className="mt-6 font-mono text-xs uppercase tracking-widest underline">Return to Dashboard</Link></div>;

  return <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7]">
    <div className="border-b-4 border-[#111111] pb-6 mb-12"><h1 className="font-serif text-5xl font-black uppercase text-[#111111]">Product Intelligence</h1><p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">Workspace initialization complete</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
      <div className="col-span-1 lg:col-span-4 border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] p-8"><p className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] mb-2">Product Name</p><h2 className="font-serif text-3xl font-bold mb-8">{product.name}</h2><p className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] mb-2">Category</p><p className="font-mono text-sm uppercase tracking-widest">{product.category || "Uncategorized"}</p></div>
      <div className="col-span-1 lg:col-span-8 grid grid-cols-2 gap-0 border-t-2 border-l-2 border-[#111111] bg-[#F9F9F7]">
        <div className="border-b-2 border-r-2 border-[#111111] p-6"><p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Status</p><p className="font-serif text-xl font-bold text-[#111111]">{product.status === "analysis_queued" ? "Analysis Queued" : "Ready for Analysis"}</p></div>
        <div className="border-b-2 border-r-2 border-[#111111] p-6"><p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Launch Date</p><p className="font-serif text-xl font-bold text-[#111111]">{product.planned_launch_date || "Not provided"}</p></div>
        <div className="border-b-2 border-r-2 border-[#111111] p-6"><p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Market Readiness</p><p className="font-serif text-xl font-bold text-[#A3A3A3]">Not analyzed yet</p></div>
        <div className="border-b-2 border-r-2 border-[#111111] p-6"><p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Customer Intelligence</p><p className="font-serif text-xl font-bold text-[#A3A3A3]">Not analyzed yet</p></div>
        <div className="border-b-2 border-r-2 border-[#111111] p-6 col-span-2"><p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Product Health</p><p className="font-serif text-xl font-bold text-[#A3A3A3]">Not analyzed yet</p></div>
      </div>
    </div>
    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-[#111111] pt-8"><div><p className="font-mono text-[10px] uppercase tracking-widest mb-2">Description</p><p className="font-body text-sm leading-7">{product.description || "Not provided"}</p></div><div><p className="font-mono text-[10px] uppercase tracking-widest mb-2">Features</p><p className="font-body text-sm leading-7 whitespace-pre-line">{product.features || "Not provided"}</p></div></div>
    <AnalyzeProductButton productId={product.id} initialStatus={product.status} />
  </div>;
}
