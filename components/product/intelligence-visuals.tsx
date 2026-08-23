import React from "react";

export function ScoreGauge({ label, score, qualifier = "AI ANALYTICAL SCORE" }: { label: string; score: number; qualifier?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(score)));
  const angle = -90 + safe * 1.8;
  return <div className="border-2 border-[#111111] p-5"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#525252]">{label}</p><div className="relative mx-auto mt-5 h-28 max-w-[230px] overflow-hidden"><div className="absolute left-1/2 top-2 h-48 w-48 -translate-x-1/2 rounded-full" style={{ background: `conic-gradient(from 270deg, #CC0000 0deg ${safe * 1.8}deg, #D9D9D4 ${safe * 1.8}deg 180deg, transparent 180deg)` }} /><div className="absolute left-1/2 top-7 h-36 w-36 -translate-x-1/2 rounded-full bg-[#F9F9F7]" /><div className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 origin-left bg-[#111111]" style={{ transform: `translateX(-50%) rotate(${angle}deg)` }} /></div><p className="mt-2 text-center font-serif text-5xl font-black">{safe}<span className="text-xl">/100</span></p><p className="mt-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#CC0000]">{qualifier}</p></div>;
}

export function IntelligenceBarChart({ title, items }: { title: string; items: Array<{ label: string; value: number; note?: string }> }) {
  const valid = items.filter((item) => Number.isFinite(item.value));
  const max = Math.max(...valid.map((item) => item.value), 1);
  return <section className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000]">{title}</h3><div className="mt-5 space-y-4">{valid.map((item) => <div key={item.label}><div className="flex items-baseline justify-between gap-3"><span className="font-mono text-[10px] uppercase tracking-widest">{item.label}</span><span className="font-mono text-xs font-bold">{item.value}{item.note ? ` · ${item.note}` : ""}</span></div><div className="mt-1 h-4 border-2 border-[#111111]"><div className="h-full bg-[#111111]" style={{ width: `${Math.max(0, Math.min(100, (item.value / max) * 100))}%` }} /></div></div>)}</div></section>;
}

export function IntelligencePieChart({ title, values }: { title: string; values: Array<{ label: string; value: number; color: string }> }) {
  const total = values.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  let cursor = 0;
  const stops = values.map((item) => { const start = total ? (cursor / total) * 360 : 0; cursor += Math.max(0, item.value); const end = total ? (cursor / total) * 360 : 0; return `${item.color} ${start}deg ${end}deg`; }).join(", ");
  return <section className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000]">{title}</h3><div className="mt-5 flex flex-wrap items-center gap-6"><div className="h-36 w-36 rounded-full border-2 border-[#111111]" style={{ background: total ? `conic-gradient(${stops})` : "#D9D9D4" }} /><div className="space-y-2">{values.map((item) => <div key={item.label} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest"><span className="h-3 w-3 border border-[#111111]" style={{ backgroundColor: item.color }} />{item.label}: {item.value}</div>)}</div></div></section>;
}

export function IntelligenceTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return <section className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000]">{title}</h3><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-left"><thead><tr>{columns.map((column) => <th key={column} className="border-2 border-[#111111] bg-[#111111] p-3 font-mono text-[10px] uppercase tracking-widest text-[#F9F9F7]">{column}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border-2 border-[#111111] p-3 align-top text-sm leading-6">{cell}</td>)}</tr>)}</tbody></table></div></section>;
}

export function EvidencePanel({ title = "Evidence / Reasoning", items }: { title?: string; items: string[] }) {
  return <section className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000]">{title}</h3>{items.length ? <div className="mt-5 space-y-2">{items.map((item, index) => <p key={`${item}-${index}`} className="border-b border-[#D0D0CB] pb-2 text-sm leading-6">{item}</p>)}</div> : <p className="mt-5 font-mono text-xs uppercase tracking-widest text-[#666666]">No stored evidence available.</p>}</section>;
}

export function ComparisonBars({ title, items }: { title: string; items: Array<{ label: string; current: number; projected: number }> }) {
  return <section className="border-t-2 border-[#111111] pt-5"><h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000]">{title}</h3><div className="mt-5 space-y-5">{items.map((item) => <div key={item.label}><p className="font-mono text-[10px] uppercase tracking-widest">{item.label}</p><div className="mt-2 grid grid-cols-2 gap-2"><div><p className="mb-1 font-mono text-[10px]">CURRENT · {item.current}</p><div className="h-3 border-2 border-[#111111]"><div className="h-full bg-[#777777]" style={{ width: `${Math.max(0, Math.min(100, item.current))}%` }} /></div></div><div><p className="mb-1 font-mono text-[10px] text-[#CC0000]">PROJECTED · {item.projected}</p><div className="h-3 border-2 border-[#CC0000]"><div className="h-full bg-[#CC0000]" style={{ width: `${Math.max(0, Math.min(100, item.projected))}%` }} /></div></div></div></div>)}</div></section>;
}

export function SectionItemBars({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) { return <IntelligenceBarChart title={title} items={items} />; }
