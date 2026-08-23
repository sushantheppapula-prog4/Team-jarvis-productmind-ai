"use client";

import { useState } from "react";
import { saveReportSchedule } from "@/app/(routes)/dashboard/product/intelligence-actions";

export function ReportSchedule({ productId, initialSchedule }: { productId: string; initialSchedule?: any }) {
  const [frequency, setFrequency] = useState(initialSchedule?.frequency || "weekly");
  const [customInterval, setCustomInterval] = useState(initialSchedule?.custom_interval || "");
  const [saved, setSaved] = useState(Boolean(initialSchedule));
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setLoading(true); try { await saveReportSchedule(productId, frequency, customInterval); setSaved(true); } finally { setLoading(false); } }
  return <form onSubmit={submit} className="mb-8 border-2 border-[#111111] p-6"><div className="flex flex-wrap items-end gap-4"><label className="font-mono text-[10px] font-bold uppercase tracking-widest">Update frequency<select value={frequency} onChange={(e) => { setFrequency(e.target.value); setSaved(false); }} className="mt-2 block border-2 border-[#111111] bg-[#F9F9F7] p-3 font-mono text-xs"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom</option></select></label>{frequency === "custom" && <label className="font-mono text-[10px] font-bold uppercase tracking-widest">Custom interval<input value={customInterval} onChange={(e) => setCustomInterval(e.target.value)} placeholder="Every 14 days" className="mt-2 block border-2 border-[#111111] bg-[#F9F9F7] p-3 font-mono text-xs" /></label>}<button disabled={loading} className="border-2 border-[#111111] bg-[#111111] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7]">{loading ? "Saving..." : "Save schedule"}</button></div><p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#525252]">{saved ? `Active ${frequency} schedule · manual update workflow` : "No schedule saved"}. Background automation is not claimed.</p></form>;
}
