"use client";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What file formats are supported for feedback upload?",
    a: "We support CSV, PDF, TXT, and JSON files. The parser automatically cleans the text formatting, loops row cells, and inserts them as customer feedback entries."
  },
  {
    q: "How does the AI consultant research my feedback?",
    a: "When you submit a query, the system uses a RAG (Retrieval-Augmented Generation) pipeline. It extracts relevant terms, queries matching entries and insights from the Supabase database, compiles a contextual package, and sends it to the configured Gemini model."
  },
  {
    q: "Can I share reports publicly?",
    a: "Yes! The Pro and Team plans allow toggling on secure read-only shared links. You can copy the secure token links to send to stakeholders and revoke them at any time to immediately restrict access."
  },
  {
    q: "Is my data protected and secure?",
    a: "Absolutely. All transactions and file operations enforce row-level security (RLS) policies within Supabase, ensuring that only authenticated project members can access the workspace files and compiled insights."
  }
];

export default function FAQPage() {
  return (
    <div className="bg-background min-h-screen py-20 px-6 sm:px-12 lg:px-16 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto space-y-12 w-full">
        <div className="space-y-4 text-center">
          <div className="inline-flex p-3 rounded-full bg-primary/5 border border-primary/20 text-primary">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">Find fast answers to common questions about ProductMind AI.</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-lg border border-border bg-card space-y-2.5"
            >
              <h3 className="font-bold text-base text-foreground">Q: {faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">A: {faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
