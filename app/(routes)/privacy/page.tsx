"use client";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen py-20 px-6 sm:px-12 lg:px-16 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto space-y-8 w-full text-left">
        <h1 className="text-4xl font-extrabold text-foreground border-b border-border pb-4">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: July 19, 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Information Collection</h2>
            <p>
              We collect files and messages you upload to build research context indexes. We use Supabase Auth for session tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Data Usage</h2>
            <p>
              Collected files are analyzed locally or query contexts are sent to Google Gemini models to generate strategies. We do not sell or trade your data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. Security Controls</h2>
            <p>
              Supabase enforces active Row-Level Security policies ensuring restricted access. Local storage cache files can be manually cleared by the user.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Cookies</h2>
            <p>
              We use security cookies to verify your identity and manage active sessions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
