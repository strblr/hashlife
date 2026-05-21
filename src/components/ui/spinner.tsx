import { useEffect, useState, type HTMLAttributes } from "react";
import { cn } from "@/utils";

const frames = ["|", "/", "-", "\\"] as const;
const sizeClass = {
  SM: "text-[0.75rem]",
  MD: "text-[0.875rem]",
  LG: "text-[1rem]"
} as const;

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "SM" | "MD" | "LG";
  label?: string;
}

export function Spinner({
  className,
  size = "MD",
  label,
  ...props
}: SpinnerProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % frames.length), 120);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-green",
        sizeClass[size],
        className
      )}
      aria-label={label ?? "Loading"}
      role="status"
      {...props}
    >
      <span
        className="inline-block w-[1ch] text-center select-none text-shadow-green"
        aria-hidden="true"
      >
        {frames[frame]}
      </span>
      {label && (
        <span className="text-muted tracking-[0.08em] animate-[blink-cursor_1.5s_step-end_infinite]">
          {label}
        </span>
      )}
    </span>
  );
}
