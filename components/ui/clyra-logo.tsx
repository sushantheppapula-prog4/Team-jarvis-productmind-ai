import React from "react";

export function ClyraLogoSymbol({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M 57.5 25 Q 65.5 42 72.5 35 C 82.5 35 87.5 30 87.5 20 C 87.5 10 82.5 8 77.5 12 C 69.5 5 63.5 5 57.5 5 C 47.5 5 37.5 10 42.5 22 C 22.5 22 12.5 32 12.5 50 C 12.5 68 22.5 78 42.5 78 C 37.5 90 47.5 95 57.5 95 C 63.5 95 69.5 95 77.5 88 C 82.5 92 87.5 90 87.5 80 C 87.5 70 82.5 65 72.5 65 Q 65.5 58 57.5 75 Q 45.5 62 32.5 50 Q 45.5 38 57.5 25 Z" 
        fill="currentColor"
      />
    </svg>
  );
}
