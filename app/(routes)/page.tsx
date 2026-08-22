"use client";
import { ClyraLogoSymbol } from "@/components/ui/clyra-logo";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "AI-Powered Research",
    description: "Upload user interviews, support tickets, and surveys. Restructure scattered feedback into product opportunities instantly.",
  },
  {
    title: "Interactive AI Consultant",
    description: "Chat with your customer signals using custom strategy RAG. Ask any question and get detailed answers with source citations.",
  },
  {
    title: "Feedback Classification",
    description: "Automatically categorize signals into feature requests, pain points, and bugs. Keep a live pulse on feature desires.",
  },
  {
    title: "Intelligence Reports",
    description: "Generate stakeholder-ready reports and shareable roadmap links. Turn technical analysis into strategic alignment.",
  }
];

const faqs = [
  {
    question: "How does Clyra analyze customer feedback?",
    answer: "Clyra uses a Retrieval-Augmented Generation (RAG) pipeline combined with Gemini models. It parses your uploaded transcripts, support tickets, and files, indexes them securely, and allows you to query customer sentiments with exact citation of source files.",
  },
  {
    question: "What file formats are supported for uploads?",
    answer: "We support PDF, CSV, TXT, and JSON files. You can upload multiple customer interviews or support logs in bulk, and our parser will index them for instant strategy consulting.",
  },
  {
    question: "Is my customer data secure?",
    answer: "Yes. Data privacy is a core pillar of Clyra. All files are securely stored, and we never use your proprietary data to train public models. Database structures enforce complete segregation of organization workspaces.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#111111] py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-bold text-[#111111] transition-all duration-200 hover:text-[#CC0000]"
      >
        <span className="text-xl lg:text-2xl font-serif">{question}</span>
        {isOpen ? (
          <Minus className="h-6 w-6 flex-shrink-0" />
        ) : (
          <Plus className="h-6 w-6 flex-shrink-0" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="pt-4 text-base lg:text-lg text-[#111111] leading-relaxed font-body">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#111111] newsprint-texture">
      

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 border-l border-r border-[#111111]">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-[#111111]">
          {/* Main Headline (8 cols) */}
          <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#111111] py-16 lg:py-24 pr-0 lg:pr-12">
            <Badge variant="primary" className="mb-6">The Global Authority in Discovery</Badge>
            <h1 className="font-serif font-black leading-[1.05] tracking-tight text-[#111111] uppercase mb-8 text-left whitespace-nowrap text-[clamp(1.4rem,6.5vw,3rem)] md:text-[clamp(2.5rem,5.5vw,4.5rem)] lg:text-[clamp(3.5rem,5vw,6rem)]">
              CONNECT WITH US,<br />
              STAY WITH VIBE,<br />
              GROW WITH STRATEGY.
            </h1>
            <p className="font-body text-lg sm:text-xl leading-relaxed max-w-2xl text-[#111111] mb-8 text-justify">
              <span className="float-left text-7xl leading-none font-black mr-2 font-serif text-[#111111]">A</span>
              I-powered customer intelligence that transforms unstructured feedback into actionable product insights.
            </p>
            <Link href="/dashboard">
              <Button size="xl" className="w-full sm:w-auto shadow-[4px_4px_0px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all">
                Read the Full Report <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Sidebar Editor's Note (4 cols) */}
          <div className="lg:col-span-4 p-8 lg:p-12 bg-[#F9F9F7]">
            <h3 className="font-mono text-xs uppercase tracking-widest border-b border-[#111111] pb-2 mb-6">Editor&apos;s Note</h3>
            <div className="relative aspect-[4/3] w-full border border-[#111111] mb-6 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,1)_1px,transparent_1px)] opacity-20 [background-size:16px_16px] animate-[dotDrift_12s_linear_infinite]" />
              {/* Floating Logo */}
              <div className="relative z-10 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]">
                <ClyraLogoSymbol className="w-24 h-24 md:w-32 md:h-32 text-[#111111]" />
              </div>
            </div>
            <h4 className="font-serif text-2xl font-bold mb-4 leading-tight">The Death of Manual Tagging</h4>
            <p className="font-body text-sm leading-relaxed mb-6">
              For decades, product managers have relied on intuition and manual spreadsheets to decode what users truly desire. Today, that era ends. We present the definitive system for automated feedback analysis.
            </p>
            <Link href="/dashboard" className="font-mono text-xs uppercase tracking-widest font-bold underline decoration-2 decoration-[#CC0000] underline-offset-4 hover:text-[#CC0000] transition-colors inline-flex items-center">
              Continue to Dashboard <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="border-b border-[#111111]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className={`p-8 border-b md:border-b-0 ${index !== features.length - 1 ? 'lg:border-r' : ''} border-[#111111] hover:bg-[#E5E5E0] transition-colors`}
              >
                <div className="font-mono text-3xl font-black text-[#111111] opacity-20 mb-4">0{index + 1}</div>
                <h3 className="font-serif text-xl font-bold mb-4">{feat.title}</h3>
                <p className="font-body text-sm leading-relaxed text-[#525252] text-justify">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* INVERTED SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-[#111111] bg-[#111111] text-[#F9F9F7]">
          <div className="lg:col-span-5 p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#333333] flex flex-col justify-center">
            <h2 className="font-serif text-5xl lg:text-7xl font-black leading-none uppercase mb-8">
              The Engine <br/> Room
            </h2>
            <p className="font-body text-lg text-[#A3A3A3] mb-8 text-justify">
              Step inside the mechanics of product discovery. Our proprietary pipeline ingests chaos and outputs clarity, formatted perfectly for your roadmap.
            </p>
            <ul className="space-y-4 font-mono text-xs uppercase tracking-widest">
              <li className="flex items-center gap-3 border-b border-[#333333] pb-3"><Check className="h-4 w-4 text-[#CC0000]" /> Multi-Format Ingestion</li>
              <li className="flex items-center gap-3 border-b border-[#333333] pb-3"><Check className="h-4 w-4 text-[#CC0000]" /> Semantic Indexing</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 text-[#CC0000]" /> Automated Categorization</li>
            </ul>
          </div>
          <div className="lg:col-span-7 p-8 lg:p-16 flex items-center justify-center">
            {/* Minimalist Tech Visual */}
            <div className="w-full max-w-lg border border-[#333333] bg-[#1a1a1a] p-6 shadow-2xl relative">
              <div className="absolute -top-3 -left-3 bg-[#CC0000] text-[#F9F9F7] font-mono text-[10px] uppercase px-2 py-1 font-bold">Fig. 1.1</div>
              <div className="font-mono text-xs text-[#A3A3A3] mb-4 border-b border-[#333333] pb-2">QUERY: &quot;What do users think of exports?&quot;</div>
              <div className="space-y-3 font-mono text-sm text-[#F9F9F7]">
                <div className="bg-[#222222] p-3 border-l-2 border-[#CC0000]">
                  Analyzing 42 sources...
                </div>
                <div className="bg-[#222222] p-3 border-l-2 border-[#F9F9F7]">
                  Result: 82% negative sentiment. Primary request is CSV bulk export.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING & FAQ SPLIT */}
        <section className="grid grid-cols-1 lg:grid-cols-12">
          {/* Pricing (7 cols) */}
          <div id="pricing" className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#111111] p-8 lg:p-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-black uppercase mb-12 border-b border-[#111111] pb-6">Subscription Plans</h2>
            
            <div className="space-y-8">
              {/* Plan 1 */}
              <div className="border-2 border-[#111111] p-6 lg:p-8 hover:bg-[#E5E5E0] transition-colors hard-shadow-hover relative bg-[#F9F9F7]">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 border-b border-[#111111] pb-6">
                  <div>
                    <h3 className="font-serif text-3xl font-bold mb-2">Professional</h3>
                    <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">For serious product teams</p>
                  </div>
                  <div className="mt-4 sm:mt-0 font-serif text-4xl font-black">$49<span className="text-sm font-mono tracking-widest uppercase">/mo</span></div>
                </div>
                <ul className="space-y-3 font-body text-sm mb-8">
                  <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" /> Dynamic Gemini AI Consultant RAG</li>
                  <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" /> Source citation cards on answers</li>
                  <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" /> Custom roadmap recommendations</li>
                </ul>
                <Button className="w-full border-2 border-[#111111] bg-[#111111] text-[#F9F9F7] hover:bg-transparent hover:text-[#111111] text-xs h-12 shadow-none">SUBSCRIBE NOW</Button>
              </div>

              {/* Plan 2 */}
              <div className="border border-[#111111] p-6 lg:p-8 bg-transparent">
                <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 border-b border-[#111111] pb-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold mb-2">Enterprise</h3>
                    <p className="font-mono text-xs uppercase tracking-widest text-[#525252]">For massive organizations</p>
                  </div>
                  <div className="mt-4 sm:mt-0 font-serif text-3xl font-bold">Custom</div>
                </div>
                <Button variant="outline" className="w-full text-xs h-12">CONTACT SALES</Button>
              </div>
            </div>
          </div>

          {/* FAQ (5 cols) */}
          <div id="faq" className="lg:col-span-5 p-8 lg:p-12 bg-[#E5E5E0]">
            <h2 className="font-serif text-3xl lg:text-4xl font-black uppercase mb-8 border-b border-[#111111] pb-6">Letters to the Editor (FAQ)</h2>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
            
            <div className="mt-12 p-6 border border-[#111111] bg-[#F9F9F7] text-center">
              <div className="font-serif text-2xl mb-4">&#x2727; &#x2727; &#x2727;</div>
              <p className="font-body text-sm italic mb-4">&quot;Clyra has entirely replaced our manual tagging process. It&apos;s like having an infinite team of researchers.&quot;</p>
              <div className="font-mono text-xs uppercase tracking-widest font-bold">— Director of Product, TechCorp</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
