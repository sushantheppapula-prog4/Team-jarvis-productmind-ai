"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Ideal for basic user research and exploration.",
    features: [
      "Upload PDF, CSV, TXT, JSON feedback files",
      "Live dashboard counters & statistic updates",
      "Local RAG analysis fallback",
      "Chronological conversation sidebar log",
    ],
    buttonText: "Start Free",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "Perfect for fast-growing product teams.",
    features: [
      "Everything in Free tier",
      "Dynamic Gemini AI Strategy consultant RAG",
      "Source citation cards on answers",
      "Custom roadmap recommendations ranking",
      "Executive summary report generation",
    ],
    buttonText: "Get Started Pro",
    href: "/sign-up",
    popular: true,
  },
  {
    name: "Team",
    price: "$149",
    description: "Designed for full product org workspaces.",
    features: [
      "Everything in Pro tier",
      "Collaborative project workspaces",
      "Priority API rate limit tiers",
      "Fine-tuned strategy RAG models",
      "Dedicated account engineer",
    ],
    buttonText: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative bg-[#F9F9F7] min-h-screen py-20 px-6 sm:px-12 lg:px-16 flex flex-col justify-center overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto space-y-12 text-center w-full">
        <div className="space-y-4">
          <div className="flex justify-center">
            <span className="bg-[#CC0000] text-[#F9F9F7] px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border-2 border-[#CC0000] flex items-center gap-2 animate-pulse">
              <Sparkles className="h-4 w-4" />
              LIMITED TIME OFFER
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-black uppercase text-[#111111] tracking-tight">
            Lowest Price Ever!
          </h1>
          <p className="font-mono text-sm md:text-base text-[#CC0000] font-bold max-w-xl mx-auto uppercase tracking-widest">
            Hurry! Subscribe now before this breaking deal expires.
          </p>
        </div>

        <div className="grid gap-0 md:grid-cols-3 border-t-4 border-l-4 border-[#111111]">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`p-10 border-b-4 border-r-4 border-[#111111] text-left flex flex-col justify-between relative transition-colors ${
                plan.popular
                  ? "bg-[#111111] text-[#F9F9F7]"
                  : "bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0]"
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 bg-[#CC0000] text-[#F9F9F7] text-xs font-mono font-bold px-4 py-2 border-b-4 border-l-4 border-[#111111] uppercase tracking-widest">
                  Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-3xl font-black uppercase">{plan.name}</h3>
                  <p className={`font-mono text-[10px] uppercase tracking-widest mt-2 min-h-[32px] ${plan.popular ? 'text-[#A3A3A3]' : 'text-[#525252]'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline">
                  <span className="font-serif text-5xl font-black">{plan.price}</span>
                  <span className={`font-mono text-xs ml-2 uppercase tracking-widest ${plan.popular ? 'text-[#A3A3A3]' : 'text-[#525252]'}`}>/ month</span>
                </div>

                <hr className={`border-2 ${plan.popular ? 'border-[#333333]' : 'border-[#111111]'}`} />

                <ul className={`space-y-4 font-mono text-[10px] uppercase tracking-widest ${plan.popular ? 'text-[#F9F9F7]' : 'text-[#111111]'}`}>
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className={`h-4 w-4 flex-shrink-0 ${plan.popular ? 'text-[#CC0000]' : 'text-[#CC0000]'}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12">
                <Link href={plan.href} className="w-full block">
                  <button
                    className={`w-full py-4 font-mono text-xs font-bold uppercase tracking-widest border-2 transition-colors ${
                      plan.popular
                        ? "bg-[#CC0000] text-[#F9F9F7] border-[#CC0000] hover:bg-[#F9F9F7] hover:text-[#CC0000]"
                        : "bg-[#111111] text-[#F9F9F7] border-[#111111] hover:bg-[#CC0000] hover:border-[#CC0000]"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
