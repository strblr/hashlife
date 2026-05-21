import { type ComponentProps } from "react";
import { cn } from "@/utils";

export type ProgressRingVariant = "DEFAULT" | "ACTIVE" | "WARNING" | "CRITICAL";

export interface ProgressRingProps extends ComponentProps<"div"> {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  variant?: ProgressRingVariant;
}

const accentColorVar: Record<ProgressRingVariant, string> = {
  DEFAULT: "var(--color-secondary)",
  ACTIVE: "var(--color-green)",
  WARNING: "var(--color-amber)",
  CRITICAL: "var(--color-red)"
};

const valueClass: Record<ProgressRingVariant, string> = {
  DEFAULT: "text-secondary",
  ACTIVE: "text-green text-shadow-green",
  WARNING: "text-amber text-shadow-amber",
  CRITICAL: "text-red text-shadow-red"
};

export function ProgressRing({
  ref,
  className,
  value = 0,
  size = 120,
  strokeWidth = 6,
  label,
  showValue = true,
  variant = "DEFAULT",
  style,
  ...props
}: ProgressRingProps) {
  const pct = Math.min(Math.max(value, 0), 100);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  const accent = accentColorVar[variant];
  const isSmall = size < 80;

  return (
    <div
      ref={ref}
      className={cn(
        "font-mono relative inline-flex items-center justify-center shrink-0",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />

        {pct > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={strokeWidth + 8}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={0.12}
          />
        )}

        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`}
          className="[transition:stroke-dashoffset_0.4s_ease]"
        />
      </svg>

      <div className="flex flex-col items-center justify-center gap-[0.1rem] pointer-events-none">
        {showValue && (
          <span
            className={cn(
              "font-bold leading-none tracking-[-0.02em]",
              isSmall ? "text-[0.7rem]" : "text-[1.2rem]",
              valueClass[variant]
            )}
          >
            {Math.round(pct)}%
          </span>
        )}
        {label && (
          <span
            className={cn(
              "text-muted tracking-[0.08em] uppercase text-center leading-[1.2]",
              isSmall ? "text-[0.45rem]" : "text-[0.55rem]"
            )}
            style={{ maxWidth: r * 1.2 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
