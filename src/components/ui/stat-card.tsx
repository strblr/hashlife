import { type ComponentProps, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export const statCardVariants = cva(
  ["relative flex flex-col font-mono", "border border-solid rounded-none"],
  {
    variants: {
      variant: {
        DEFAULT: ["border-border"],
        ACTIVE: ["border-green"],
        WARNING: ["border-amber"],
        CRITICAL: ["border-red"]
      }
    },
    defaultVariants: { variant: "DEFAULT" }
  }
);

const valueClass = {
  DEFAULT: "text-secondary",
  ACTIVE: "text-green text-shadow-green",
  WARNING: "text-amber text-shadow-amber",
  CRITICAL: "text-red text-shadow-red"
} as const;

export interface StatCardProps
  extends ComponentProps<"div">, VariantProps<typeof statCardVariants> {
  label: ReactNode;
  value: ReactNode;
  delta?: string;
  deltaPositive?: boolean; // tri-state: green / red / neutral
  sublabel?: ReactNode;
}

export function StatCard({
  ref,
  className,
  variant = "DEFAULT",
  label,
  value,
  delta,
  deltaPositive,
  sublabel,
  ...props
}: StatCardProps) {
  const v = variant ?? "DEFAULT";

  const deltaClass =
    deltaPositive === true
      ? "text-green"
      : deltaPositive === false
        ? "text-red"
        : "text-muted";

  const deltaSymbol =
    deltaPositive === true ? "▲ " : deltaPositive === false ? "▼ " : "— ";

  return (
    <div
      ref={ref}
      className={cn(
        statCardVariants({ variant }),
        "bg-surface p-4 gap-[0.4rem]",
        className
      )}
      {...props}
    >
      <div className="text-muted text-[0.6rem] tracking-[0.12em] uppercase">
        {label}
      </div>

      <div
        className={cn(
          "text-[2rem] font-bold leading-none tracking-[-0.02em]",
          valueClass[v]
        )}
      >
        {value}
      </div>

      {delta !== undefined && (
        <div className={cn("text-[0.7rem] tracking-wider", deltaClass)}>
          {deltaSymbol}
          {delta}
        </div>
      )}

      {sublabel && (
        <div
          className={cn(
            "text-muted border-t border-border",
            "text-[0.6rem] tracking-widest uppercase",
            "mt-auto pt-[0.6rem]"
          )}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}
