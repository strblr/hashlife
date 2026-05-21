import { type ComponentProps } from "react";
import { cn } from "@/utils";

export function Card({ ref, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface border border-border",
        "text-secondary font-mono",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  ref,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1.5 p-4 border-b border-border",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ ref, className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-sm font-semibold uppercase tracking-widest text-green",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  ref,
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p ref={ref} className={cn("text-xs text-muted", className)} {...props} />
  );
}

export function CardContent({
  ref,
  className,
  ...props
}: ComponentProps<"div">) {
  return <div ref={ref} className={cn("p-4", className)} {...props} />;
}

export function CardFooter({
  ref,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-4 border-t border-border", className)}
      {...props}
    />
  );
}
