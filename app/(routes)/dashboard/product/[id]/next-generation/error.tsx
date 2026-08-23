"use client";

import { IntelligenceRouteError } from "@/components/product/intelligence-route-error";

export default function NextGenerationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <IntelligenceRouteError reset={reset} />;
}
