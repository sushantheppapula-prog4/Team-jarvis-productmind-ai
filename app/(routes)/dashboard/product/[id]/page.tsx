"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProductWorkspace() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // Mock DB fetch
    const stored = JSON.parse(localStorage.getItem("clyra_products") || "[]");
    const found = stored.find((p: any) => p.id === id);
    if (found) setProduct(found);
  }, [id]);

  if (!product) {
    return (
      <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7]">
      <div className="border-b-4 border-[#111111] pb-6 mb-12">
        <h1 className="font-serif text-5xl font-black uppercase text-[#111111]">
          Product Intelligence
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">
          Workspace initialization complete
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Core details */}
        <div className="col-span-1 lg:col-span-4 border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] mb-2">Product Name</p>
          <h2 className="font-serif text-3xl font-bold mb-8">{product.name}</h2>
          
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#A3A3A3] mb-2">Category</p>
          <p className="font-mono text-sm uppercase tracking-widest">{product.category || "Uncategorized"}</p>
        </div>

        {/* Intelligence Status Grid */}
        <div className="col-span-1 lg:col-span-8 grid grid-cols-2 gap-0 border-t-2 border-l-2 border-[#111111] bg-[#F9F9F7]">
          <div className="border-b-2 border-r-2 border-[#111111] p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Status</p>
            <p className="font-serif text-xl font-bold text-[#111111]">Ready for Analysis</p>
          </div>
          <div className="border-b-2 border-r-2 border-[#111111] p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Launch Date</p>
            <p className="font-serif text-xl font-bold text-[#111111]">{product.planned_launch_date || "Not analyzed"}</p>
          </div>
          <div className="border-b-2 border-r-2 border-[#111111] p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Market Readiness</p>
            <p className="font-serif text-xl font-bold text-[#A3A3A3]">Not analyzed</p>
          </div>
          <div className="border-b-2 border-r-2 border-[#111111] p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Customer Intelligence</p>
            <p className="font-serif text-xl font-bold text-[#A3A3A3]">Not analyzed</p>
          </div>
          <div className="border-b-2 border-r-2 border-[#111111] p-6 col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mb-2">Product Health</p>
            <p className="font-serif text-xl font-bold text-[#A3A3A3]">Not analyzed</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center border-t-4 border-[#111111] pt-12">
        <button className="inline-flex items-center gap-2 border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] px-12 py-6 font-mono text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-[#111111] transition-all group">
          <Activity className="h-5 w-5" /> Analyze Product <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
