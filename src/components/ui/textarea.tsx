import { type ComponentProps } from "react";
import { cn } from "@/utils";

export interface TextareaProps extends ComponentProps<"textarea"> {
  label?: string;
  error?: string;
}

export function Textarea({
  ref,
  className,
  label,
  error,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-[0.35rem] w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "text-[0.65rem] tracking-[0.12em] uppercase",
            error ? "text-amber" : "text-muted"
          )}
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          "w-full bg-surface font-mono text-[0.8rem]",
          "border border-border",
          "text-secondary caret-green",
          "placeholder:text-muted",
          "outline-none rounded-none",
          "transition-all duration-150",
          "focus:border-border-active focus:shadow-green",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "px-3 py-2 resize-none min-h-20",
          error && "border-amber focus:shadow-amber",
          className
        )}
        {...props}
      />

      {error && (
        <span className="text-amber text-[0.65rem] tracking-[0.06em]">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
