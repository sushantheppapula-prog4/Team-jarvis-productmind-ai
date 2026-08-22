import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva(
  "w-full transition-smooth",
  {
    variants: {
      variant: {
        default: "",
        bordered: "border-t border-border",
        elevated: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  containerSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant, containerSize = "xl", ...props }, ref) => {
    const containerSizeMap = {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-8xl",
      full: "w-full",
    };

    return (
      <section
        ref={ref}
        className={cn(sectionVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Section.displayName = "Section";

export interface SectionContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const SectionContainer = React.forwardRef<HTMLDivElement, SectionContainerProps>(
  ({ className, size = "xl", padding = "lg", ...props }, ref) => {
    const sizeMap = {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-8xl",
      full: "w-full",
    };

    const paddingMap = {
      none: "",
      sm: "px-4 sm:px-6",
      md: "px-6 sm:px-8",
      lg: "px-8 sm:px-12 lg:px-16",
      xl: "px-8 sm:px-12 lg:px-20",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full",
          sizeMap[size],
          paddingMap[padding],
          className
        )}
        {...props}
      />
    );
  }
);
SectionContainer.displayName = "SectionContainer";

export interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-6 mb-8", className)}
      {...props}
    >
      <div className="flex-1 space-y-2">
        {title && <h2 className="text-3xl font-bold">{title}</h2>}
        {subtitle && (
          <p className="text-muted-foreground text-lg">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

export interface SectionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SectionContent = React.forwardRef<HTMLDivElement, SectionContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    />
  )
);
SectionContent.displayName = "SectionContent";

export { Section, SectionContainer, SectionHeader, SectionContent, sectionVariants };
