import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-none font-mono uppercase tracking-widest transition-all duration-200 px-3 py-1 text-[10px]",
  {
    variants: {
      variant: {
        default:
          "border border-[#111111] bg-[#F9F9F7] text-[#111111] hover:bg-[#E5E5E0]",
        primary:
          "bg-[#111111] text-[#F9F9F7] border border-[#111111]",
        secondary:
          "bg-[#E5E5E0] text-[#111111] border border-[#111111]",
        destructive:
          "bg-[#CC0000] text-[#F9F9F7] border border-[#CC0000]",
        success:
          "bg-[#111111] text-[#F9F9F7] border border-[#111111]",
        warning:
          "bg-[#F9F9F7] text-[#CC0000] border border-[#CC0000]",
        info:
          "bg-[#E5E5E0] text-[#111111] border border-[#111111]",
        outline:
          "border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7]",
        solid:
          "bg-[#111111] text-[#F9F9F7] hover:bg-white hover:text-[#111111] hover:border hover:border-[#111111]",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px]",
        md: "px-3 py-1 text-[10px]",
        lg: "px-4 py-1.5 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
