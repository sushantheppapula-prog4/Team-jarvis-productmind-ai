"use client";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen py-20 px-6 sm:px-12 lg:px-16 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto space-y-8 w-full text-left">
        <h1 className="text-4xl font-extrabold text-foreground border-b border-border pb-4">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: July 19, 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Clyra, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">2. Description of Service</h2>
            <p>
              Clyra provides an AI-powered customer feedback research and reporting platform. We process uploaded files to output insights and enable query interactions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">3. User Commitments</h2>
            <p>
              You agree to only upload files you own or possess the rights to distribute. You may not upload content that violates any privacy agreements, copyrights, or laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">4. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that breach these terms or engage in abusive platform behavior.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
