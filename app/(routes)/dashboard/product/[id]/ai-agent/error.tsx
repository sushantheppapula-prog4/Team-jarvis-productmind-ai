"use client";

import { IntelligenceRouteError } from "@/components/product/intelligence-route-error";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("AI Agent route failed", error);
  return <IntelligenceRouteError reset={reset} />;
}
