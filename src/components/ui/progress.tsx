import { type ComponentProps } from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/utils";

export interface ProgressProps extends ComponentProps<
  typeof ProgressPrimitive.Root
> {
  showValue?: boolean;
  label?: string;
}

export function Progress({
  ref,
  className,
  value = 0,
  showValue = true,
  label,
  ...props
}: ProgressProps) {
  const pct = Math.min(Math.max(value ?? 0, 0), 100);
  const filled = Math.round((pct / 100) * 20);
  const empty = 20 - filled;
  const barText = "=".repeat(filled) + " ".repeat(empty);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <span className="text-muted text-[0.65rem] tracking-widest uppercase">
          {label}
        </span>
      )}

      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-none",
          className
        )}
        value={value}
        {...props}
      >
        <div className="flex items-center gap-1 text-[0.75rem] font-mono text-green text-shadow-green">
          <span className="text-muted">[</span>
          <span className="tracking-tighter whitespace-pre">{barText}</span>
          <span className="text-muted">]</span>
          {showValue && (
            <span className="text-muted text-[0.65rem] ml-1">
              {Math.round(pct)}%
            </span>
          )}
        </div>

        <ProgressPrimitive.Indicator
          className="sr-only"
          style={{ transform: `translateX(-${100 - pct}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
