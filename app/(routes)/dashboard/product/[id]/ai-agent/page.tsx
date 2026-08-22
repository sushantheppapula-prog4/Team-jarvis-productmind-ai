"use client";

import { useState } from "react";
import { Bot, ArrowRight } from "lucide-react";

export default function AIAgentPage() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No-op for now as per instructions
  };

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-[#F9F9F7] flex flex-col">
      <div className="border-b-4 border-[#111111] pb-6 mb-12">
        <h1 className="font-serif text-5xl font-black uppercase text-[#111111]">
          Clyra AI Agent
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-[#525252] mt-4">
          Strategic intelligence interface
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center">
        <Bot className="h-16 w-16 text-[#111111] mb-8" />
        <h2 className="font-serif text-3xl font-bold text-[#111111] mb-12">
          What would you like to know about your product?
        </h2>
        
        <form onSubmit={handleSubmit} className="w-full relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Clyra..."
            className="w-full border-2 border-[#111111] bg-transparent p-6 pr-16 font-serif text-xl focus:outline-none focus:ring-0 focus:border-[#CC0000] transition-colors placeholder:text-[#A3A3A3]"
          />
          <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[#111111] text-[#F9F9F7] hover:bg-[#CC0000] transition-colors"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </form>
        
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252] mt-6">
          The agent will later be able to analyze data, research market information, and generate reports.
        </p>
      </div>
    </div>
  );
}
