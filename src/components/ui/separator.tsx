import { type ComponentProps } from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";
import { cn } from "@/utils";

export interface SeparatorProps extends ComponentProps<
  typeof SeparatorPrimitive.Root
> {
  label?: string;
}

export function Separator({
  ref,
  className,
  orientation = "horizontal",
  decorative = true,
  label,
  style,
  ...props
}: SeparatorProps) {
  if (label && orientation === "horizontal") {
    return (
      <div className="flex items-center gap-3 w-full" style={style}>
        <div className="bg-border flex-1 h-px" />
        <span className="text-muted text-[0.6rem] tracking-[0.12em] whitespace-nowrap uppercase">
          {label}
        </span>
        <div className="bg-border flex-1 h-px" />
      </div>
    );
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 rounded-none bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      style={style}
      {...props}
    />
  );
}
