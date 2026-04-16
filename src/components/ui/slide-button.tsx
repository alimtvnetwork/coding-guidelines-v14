import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const slideButtonVariants = cva(
  "relative overflow-hidden inline-flex items-center justify-center rounded-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:shadow-[0_4px_16px_hsl(var(--primary)/0.25)] hover:-translate-y-px active:translate-y-0 active:shadow-[0_2px_8px_hsl(var(--primary)/0.15)]",
        highlight:
          "bg-gradient-to-br from-primary to-accent text-primary-foreground hover:shadow-[0_6px_24px_hsl(var(--primary)/0.3)] hover:-translate-y-0.5 active:translate-y-0",
        ghost:
          "border border-border text-foreground hover:bg-muted/50 hover:border-primary/30 hover:text-primary",
      },
      size: {
        default: "min-w-[8rem] h-10 px-5 text-sm",
        sm: "min-w-[6rem] h-8 px-3 text-xs",
        lg: "min-w-[10rem] h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface SlideButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof slideButtonVariants> {
  /** Text shown in the default state */
  defaultText: string;
  /** Text that slides in on hover */
  hoverText: string;
}

/**
 * CSS3 Slide Text Button
 *
 * On hover, the default text slides up and fades out while
 * the hover text slides up from below. Pure CSS3 transitions,
 * no JS animation libraries.
 *
 * @see spec/06-design-system/09-button-system.md
 */
const SlideButton = React.forwardRef<HTMLButtonElement, SlideButtonProps>(
  ({ className, variant, size, defaultText, hoverText, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(slideButtonVariants({ variant, size, className }), "group")}
        {...props}
      >
        {/* Default text — slides up and out on hover */}
        <span className="block transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-full group-hover:opacity-0">
          {defaultText}
        </span>

        {/* Hover text — slides up into view on hover */}
        <span className="absolute inset-0 flex items-center justify-center translate-y-full opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 group-hover:opacity-100">
          {hoverText}
        </span>
      </button>
    );
  }
);
SlideButton.displayName = "SlideButton";

export { SlideButton, slideButtonVariants };
