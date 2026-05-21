import { type ComponentProps } from "react";
import { cn } from "@/utils";

export interface PanelProps extends ComponentProps<"div"> {
  notch?: "sm" | "md" | "lg" | "none";
}

export function Panel({ ref, className, notch = "md", ...props }: PanelProps) {
  const clipMap = {
    sm: "clip-corner-sm",
    md: "clip-corner-md",
    lg: "clip-corner-lg",
    none: undefined
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-none bg-surface border border-border overflow-hidden",
        clipMap[notch],
        className
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  ref,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 px-4 py-[0.6rem]",
        "border-b border-border bg-surface-raised",
        className
      )}
      {...props}
    />
  );
}

export function PanelTitle({ ref, className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-muted text-[0.7rem] font-semibold tracking-[0.12em] uppercase m-0",
        className
      )}
      {...props}
    />
  );
}

export function PanelContent({
  ref,
  className,
  ...props
}: ComponentProps<"div">) {
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
}

export function PanelFooter({
  ref,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 px-4 py-[0.6rem]",
        "border-t border-border bg-surface-raised",
        className
      )}
      {...props}
    />
  );
}
