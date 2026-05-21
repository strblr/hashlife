import { type ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsGroup = TabsPrimitive.List; // alias

export function TabsList({
  ref,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-end",
        "border-b border-border",
        "w-full gap-0",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  ref,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center",
        "px-4 py-2",
        "text-[0.7rem] font-mono font-medium uppercase tracking-widest",
        "border-b-2 border-transparent",
        "-mb-px",
        "text-muted",
        "cursor-pointer",
        "outline-none",
        "transition-all duration-150",
        "hover:text-secondary",
        "data-[state=active]:text-green",
        "data-[state=active]:border-b-green",
        "data-[state=active]:text-shadow-green",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({
  ref,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("mt-4", "focus-visible:outline-none", className)}
      {...props}
    />
  );
}
