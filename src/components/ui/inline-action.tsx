import { type ComponentProps, type MouseEvent, useCallback } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { playSfx } from "@/lib";
import { cn } from "@/utils";

export const inlineActionVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-mono uppercase whitespace-nowrap",
    "cursor-pointer select-none",
    "transition-colors duration-150",
    "focus-visible:outline-none",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
  ],
  {
    variants: {
      variant: {
        GHOST: [
          "text-muted",
          "hover:text-green hover:text-shadow-green",
          "focus-visible:text-green focus-visible:text-shadow-green"
        ],
        EXEC: [
          "text-secondary",
          "hover:text-green hover:text-shadow-green",
          "focus-visible:text-green focus-visible:text-shadow-green"
        ],
        ABORT: [
          "text-muted",
          "hover:text-red hover:text-shadow-red",
          "focus-visible:text-red focus-visible:text-shadow-red"
        ]
      },
      size: {
        XS: "text-[0.6rem] tracking-[0.08em]",
        SM: "text-[0.7rem] tracking-[0.1em]"
      }
    },
    defaultVariants: {
      variant: "GHOST",
      size: "XS"
    }
  }
);

export interface InlineActionProps
  extends ComponentProps<"button">, VariantProps<typeof inlineActionVariants> {}

export function InlineAction({
  ref,
  className,
  variant,
  size,
  onClick,
  disabled,
  ...props
}: InlineActionProps) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!disabled && !e.defaultPrevented) playSfx("click");
    },
    [onClick, disabled]
  );

  return (
    <button
      ref={ref}
      type="button"
      className={cn(inlineActionVariants({ variant, size }), className)}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    />
  );
}
