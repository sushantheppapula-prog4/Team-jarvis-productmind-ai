import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-none border-b-2 border-[#111111] border-l-0 border-r-0 border-t-0 bg-transparent px-3 py-2 text-sm font-mono placeholder:text-neutral-400 transition-all duration-200 focus-visible:bg-[#F0F0F0] focus-visible:outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-2 border-[#111111]",
        ghost: "border-transparent focus-visible:border-b-2 focus-visible:border-[#111111]",
        underline: "",
      },
      size: {
        sm: "h-8 text-xs px-2",
        md: "h-11 px-3 min-h-[44px]",
        lg: "h-12 px-4 min-h-[44px]",
        xl: "h-14 px-4 min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(inputVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input, inputVariants };
