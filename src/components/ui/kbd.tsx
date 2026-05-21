import { type ComponentProps } from "react";
import { cn } from "@/utils";

export interface KbdProps extends ComponentProps<"kbd"> {}

export function Kbd({ ref, className, children, ...props }: KbdProps) {
  return (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center",
        "font-mono text-[0.7rem] font-medium uppercase tracking-widest",
        "px-1.5 py-0.5 min-w-[1.4rem]",
        "border border-border bg-surface-raised",
        "text-secondary",
        "rounded-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
