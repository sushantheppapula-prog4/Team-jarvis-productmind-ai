"use client";

import { IntelligenceRouteError } from "@/components/product/intelligence-route-error";

export default function NewProductSuggestionsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <IntelligenceRouteError reset={reset} />;
}
