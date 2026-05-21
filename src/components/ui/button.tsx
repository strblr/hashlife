import { type ComponentProps, type MouseEvent, useCallback } from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { playSfx } from "@/lib";
import { cn } from "@/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "font-mono font-medium uppercase tracking-widest text-base",
    "border border-solid",
    "cursor-pointer select-none",
    "transition-all duration-150",
    "focus-visible:outline-none",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "rounded-none",
    "whitespace-nowrap"
  ],
  {
    variants: {
      variant: {
        EXEC: [
          "bg-transparent",
          "border-green",
          "text-green text-shadow-green",
          "hover:bg-green",
          "hover:text-background",
          "hover:shadow-green",
          "focus-visible:shadow-green"
        ],
        GHOST: [
          "bg-transparent",
          "border-transparent",
          "text-secondary",
          "hover:text-green hover:text-shadow-green",
          "hover:border-border",
          "focus-visible:border-border"
        ],
        OUTLINE: [
          "bg-surface",
          "border-border",
          "text-secondary",
          "hover:border-border-active",
          "hover:text-green hover:text-shadow-green",
          "hover:shadow-green",
          "focus-visible:border-border-active",
          "focus-visible:shadow-green"
        ],
        ABORT: [
          "bg-transparent",
          "border-red",
          "text-red text-shadow-red",
          "hover:bg-red",
          "hover:text-background",
          "hover:shadow-red",
          "focus-visible:shadow-red"
        ]
      },
      size: {
        SM: "h-7  px-3 gap-1.5",
        MD: "h-9  px-4 gap-2",
        LG: "h-11 px-6 gap-2.5"
      }
    },
    defaultVariants: {
      variant: "OUTLINE",
      size: "MD"
    }
  }
);

export interface ButtonProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  ref,
  className,
  variant,
  size,
  asChild = false,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!disabled && !e.defaultPrevented) playSfx("click");
    },
    [onClick, disabled]
  );

  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    />
  );
}
