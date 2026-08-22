"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    try {
      setIsSubmitting(true);
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setFeedback("Thank you! Your message has been received. Our team will get back to you shortly.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setFeedback("Failed to send message. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen py-20 px-6 sm:px-12 lg:px-16 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-8 text-center">
        <div className="space-y-4">
          <div className="inline-flex p-3 rounded-full bg-primary/5 border border-primary/20 text-primary">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground">Get in Touch</h1>
          <p className="text-sm text-muted-foreground">Have questions or custom team requests? Send us a message.</p>
        </div>

        {feedback && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary font-medium">
            {feedback}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left border border-border bg-card p-6 rounded-xl shadow-md">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              disabled={isSubmitting}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              disabled={isSubmitting}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
            <textarea
              required
              rows={4}
              value={message}
              disabled={isSubmitting}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2">
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </span>
            ) : (
              <>
                <Send className="h-4 w-4" /> Send Message
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// Inline fallback loader icon inside Contact page code to resolve missing imports
function Loader2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
