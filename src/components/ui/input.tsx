import { type ComponentProps } from "react";
import { cn } from "@/utils";

export interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({
  ref,
  className,
  label,
  error,
  prefix,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-[0.35rem] w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-[0.65rem] tracking-[0.12em] uppercase",
            error ? "text-amber" : "text-muted"
          )}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-2.5 text-muted text-[0.8rem] pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-9 bg-surface font-mono text-[0.8rem]",
            "border border-border",
            "text-secondary caret-green",
            "placeholder:text-muted",
            "outline-none rounded-none",
            "transition-all duration-150",
            "focus:border-border-active focus:shadow-green",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            prefix ? "pl-7 pr-3" : "px-3",
            error && "border-amber focus:shadow-amber",
            className
          )}
          {...props}
        />
      </div>

      {error && (
        <span className="text-amber text-[0.65rem] tracking-[0.06em]">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
