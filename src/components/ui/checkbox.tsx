import { type ComponentProps } from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/utils";

export interface CheckboxProps extends ComponentProps<
  typeof CheckboxPrimitive.Root
> {
  label?: string;
}

export function Checkbox({
  ref,
  className,
  label,
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="inline-flex items-center gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-none",
          "border border-border",
          "bg-surface",
          "focus-visible:outline-none",
          "focus-visible:border-border-active",
          "focus-visible:shadow-green",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "data-[state=checked]:border-green",
          "data-[state=checked]:bg-surface-raised",
          "data-[state=checked]:shadow-green",
          "transition-all duration-150",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center w-full h-full">
          <span className="text-green text-shadow-green text-[0.6rem] leading-none select-none">
            ■
          </span>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {label && (
        <label
          htmlFor={checkboxId}
          className="text-secondary text-[0.75rem] tracking-wider cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
