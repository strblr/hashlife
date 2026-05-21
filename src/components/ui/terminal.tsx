import { useRef, useEffect, type ComponentProps } from "react";
import { cn } from "@/utils";

export type TerminalLineType = "input" | "output" | "warn" | "error" | "system";

export interface TerminalLine {
  type?: TerminalLineType;
  text: string;
  timestamp?: string;
}

export interface TerminalProps extends ComponentProps<"div"> {
  lines?: TerminalLine[];
  prompt?: string;
  title?: string;
  height?: string | number;
  blinkCursor?: boolean;
}

const lineColorClass: Record<TerminalLineType, string> = {
  input: "text-green",
  output: "text-secondary",
  warn: "text-amber",
  error: "text-red",
  system: "text-muted"
};

function linePrefix(type: TerminalLineType = "output"): string {
  switch (type) {
    case "input":
      return ">";
    case "output":
      return " ";
    case "warn":
      return "⚠";
    case "error":
      return "✕";
    case "system":
      return "#";
  }
}

export function Terminal({
  ref,
  className,
  lines = [],
  prompt = ">",
  title = "TERMINAL",
  height = "16rem",
  blinkCursor = false,
  style,
  ...props
}: TerminalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      ref={ref}
      className={cn(
        "border border-border bg-surface font-mono overflow-hidden",
        className
      )}
      style={style}
      {...props}
    >
      <div className="flex items-center gap-2 px-3 py-[0.4rem] border-b border-border bg-surface-raised">
        <span className="text-muted text-[0.7rem] font-semibold tracking-[0.12em] uppercase">
          {title}
        </span>
        <span className="bg-green shadow-green ml-auto w-1.5 h-1.5 rounded-full animate-[blink-cursor_2s_step-end_infinite]" />
      </div>

      <div
        ref={bodyRef}
        className="overflow-y-auto p-3 min-h-0 flex flex-col gap-[0.2rem]"
        style={{ height }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 text-[0.75rem] leading-[1.6]",
              lineColorClass[line.type ?? "output"]
            )}
          >
            {line.timestamp && (
              <span className="text-muted text-[0.65rem] shrink-0 mt-px">
                {line.timestamp}
              </span>
            )}
            <span className="shrink-0 opacity-50 select-none">
              {linePrefix(line.type)}
            </span>
            <span className="break-all">{line.text}</span>
          </div>
        ))}

        {blinkCursor && (
          <div className="flex items-center text-[0.75rem] mt-[0.1rem] gap-1">
            <span className="text-muted select-none">{prompt}</span>
            <span className="bg-green shadow-green inline-block w-[0.55rem] h-[1em] animate-[blink-cursor_1s_step-end_infinite]" />
          </div>
        )}
      </div>
    </div>
  );
}
