import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "px-2 py-0.5",
    "text-[0.65rem] font-mono font-medium uppercase tracking-widest",
    "border border-solid",
    "rounded-none",
    "whitespace-nowrap"
  ],
  {
    variants: {
      variant: {
        ACTIVE: [
          "border-green text-green text-shadow-green",
          "shadow-[inset_0_0_8px_#00ed3f11]"
        ],
        OFFLINE: ["border-border", "text-muted"],
        WARNING: ["border-amber", "text-amber"],
        CRITICAL: [
          "border-red text-red text-shadow-red",
          "shadow-[inset_0_0_8px_#cc220011]"
        ],
        SCANNING: [
          "border-green text-green text-shadow-green",
          "shadow-[inset_0_0_8px_#00ed3f11]"
        ]
      }
    },
    defaultVariants: {
      variant: "ACTIVE"
    }
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  const isScanning = variant === "SCANNING";

  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {isScanning && (
        <span className="inline-block animate-[blink-cursor_1s_step-end_infinite]">
          ●
        </span>
      )}
      {!isScanning && variant === "ACTIVE" && <span>●</span>}
      {!isScanning && variant === "OFFLINE" && <span>○</span>}
      {!isScanning && variant === "WARNING" && <span>⚠</span>}
      {!isScanning && variant === "CRITICAL" && <span>✕</span>}
      {children}
    </span>
  );
}
