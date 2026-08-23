"use client";

export function IntelligenceRouteError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-5xl bg-[#F9F9F7] p-8 lg:p-12"><section className="border-y-4 border-[#111111] py-12"><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#CC0000]">CLYRA / INTELLIGENCE</p><h1 className="mt-4 font-serif text-4xl font-black uppercase text-[#111111]">UNABLE TO LOAD INTELLIGENCE</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#525252]">Please try again. The selected product intelligence could not be loaded.</p><button onClick={() => reset()} className="mt-8 border-2 border-[#111111] bg-[#111111] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#F9F9F7] hover:bg-[#CC0000]">TRY AGAIN</button></section></main>;
}
