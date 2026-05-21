import { type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export const alertVariants = cva(
  [
    "relative w-full",
    "border border-solid border-l-[3px]",
    "p-4",
    "font-mono",
    "rounded-none"
  ],
  {
    variants: {
      variant: {
        STATUS: ["border-border", "border-l-green", "bg-surface"],
        WARNING: ["border-border", "border-l-amber", "bg-surface"],
        CRITICAL: ["border-border", "border-l-red", "bg-surface"],
        INFO: ["border-border", "border-l-blue", "bg-surface"]
      }
    },
    defaultVariants: { variant: "STATUS" }
  }
);

const prefixSymbol = {
  STATUS: "◈",
  WARNING: "⚠",
  CRITICAL: "✕",
  INFO: "ℹ"
} as const;

const prefixClass = {
  STATUS: "text-green text-shadow-green",
  WARNING: "text-amber text-shadow-amber",
  CRITICAL: "text-red text-shadow-red",
  INFO: "text-blue text-shadow-blue"
} as const;

export interface AlertProps
  extends ComponentProps<"div">, VariantProps<typeof alertVariants> {}

export function Alert({
  ref,
  className,
  variant = "STATUS",
  children,
  ...props
}: AlertProps) {
  const v = variant ?? "STATUS";

  return (
    <div
      ref={ref}
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      <div className="flex gap-2 items-start">
        <span
          className={cn(
            "text-[0.85rem] leading-normal shrink-0",
            prefixClass[v]
          )}
        >
          {prefixSymbol[v]}
        </span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AlertTitle({ ref, className, ...props }: ComponentProps<"h5">) {
  return (
    <h5
      ref={ref}
      className={cn(
        "text-secondary text-[0.75rem] font-semibold tracking-[0.08em] uppercase mb-1",
        className
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  ref,
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      ref={ref}
      className={cn("text-muted text-[0.8rem] leading-[1.6]", className)}
      {...props}
    />
  );
}
