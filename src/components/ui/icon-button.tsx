import { type ComponentProps, type MouseEvent, useCallback } from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { playSfx } from "@/lib";
import { cn } from "@/utils";

export const iconButtonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "shrink-0",
    "border border-solid",
    "cursor-pointer select-none",
    "rounded-none",
    "whitespace-nowrap",
    "transition-all duration-150",
    "focus-visible:outline-none",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "[&_svg]:shrink-0"
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
        SM: ["h-7 w-7", "[&_svg:not([class*='size-'])]:size-3.5"],
        MD: ["h-9 w-9", "[&_svg:not([class*='size-'])]:size-4"],
        LG: ["h-11 w-11", "[&_svg:not([class*='size-'])]:size-5"]
      }
    },
    defaultVariants: {
      variant: "OUTLINE",
      size: "SM"
    }
  }
);

export interface IconButtonProps
  extends ComponentProps<"button">, VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
}

export function IconButton({
  ref,
  className,
  variant,
  size,
  asChild = false,
  onClick,
  disabled,
  ...props
}: IconButtonProps) {
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
      className={cn(iconButtonVariants({ variant, size }), className)}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    />
  );
}
