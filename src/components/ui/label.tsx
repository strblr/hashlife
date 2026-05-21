import { type ComponentProps } from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { cn } from "@/utils";

export function Label({
  ref,
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-[0.7rem] font-mono font-medium uppercase tracking-widest",
        "text-secondary",
        "peer-disabled:opacity-40 peer-disabled:cursor-not-allowed",
        "select-none",
        className
      )}
      {...props}
    />
  );
}
