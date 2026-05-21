import { type ComponentProps, useCallback } from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { playSfx } from "@/lib";
import { cn } from "@/utils";

export interface SwitchProps extends ComponentProps<
  typeof SwitchPrimitive.Root
> {
  label?: string;
}

export function Switch({
  ref,
  className,
  label,
  id,
  onCheckedChange,
  disabled,
  ...props
}: SwitchProps) {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      onCheckedChange?.(checked);
      if (!disabled) playSfx("click");
    },
    [onCheckedChange, disabled]
  );

  return (
    <div className="inline-flex items-center gap-2.5">
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        className={cn(
          "group inline-flex items-center shrink-0",
          "h-6 w-14",
          "rounded-none",
          "border border-border",
          "bg-surface",
          "cursor-pointer",
          "focus-visible:outline-none",
          "focus-visible:border-border-active",
          "focus-visible:shadow-green",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "data-[state=checked]:border-green",
          "data-[state=checked]:shadow-green",
          "transition-all duration-150",
          "font-mono text-[0.6rem] tracking-widest",
          "relative overflow-hidden",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute left-1.5 select-none text-muted",
            "tracking-[0.04em] text-[0.6rem]",
            "transition-opacity duration-150",
            "group-data-[state=checked]:opacity-0"
          )}
          aria-hidden="true"
        >
          [OFF]
        </span>

        <SwitchPrimitive.Thumb asChild>
          <span className="hidden" />
        </SwitchPrimitive.Thumb>

        <span
          className={cn(
            "absolute right-1.5 select-none text-green text-shadow-green",
            "tracking-[0.04em] text-[0.6rem]",
            "transition-opacity duration-150",
            "group-data-[state=unchecked]:opacity-0"
          )}
          aria-hidden="true"
        >
          [ON]
        </span>
      </SwitchPrimitive.Root>

      {label && (
        <label
          htmlFor={switchId}
          className="text-secondary text-[0.75rem] tracking-wider cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
