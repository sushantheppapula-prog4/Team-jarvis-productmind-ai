import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-sans text-xs uppercase tracking-widest font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#111111] text-[#F9F9F7] border border-transparent hover:bg-white hover:text-[#111111] hover:border-[#111111]",
        secondary:
          "border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7]",
        outline:
          "border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7]",
        ghost:
          "text-[#111111] hover:bg-[#E5E5E0] hover:text-[#111111]",
        link:
          "text-[#111111] underline-offset-4 decoration-2 decoration-[#CC0000] hover:underline min-h-0",
        destructive:
          "bg-[#CC0000] text-[#F9F9F7] border border-transparent hover:bg-white hover:text-[#CC0000] hover:border-[#CC0000]",
        muted:
          "bg-[#E5E5E0] text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7]",
        gradient:
          "bg-[#111111] text-[#F9F9F7] border border-transparent hover:bg-white hover:text-[#111111] hover:border-[#111111]",
      },
      size: {
        xs: "h-11 px-3 text-[10px]",
        sm: "h-11 px-4 text-xs",
        md: "h-11 px-6 text-xs",
        lg: "h-12 px-8 text-sm",
        xl: "h-14 px-10 text-sm",
        icon: "h-11 w-11",
        "icon-sm": "h-11 w-11",
        "icon-lg": "h-14 w-14",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button
      className={cn(
        buttonVariants({ variant, size, fullWidth }),
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
