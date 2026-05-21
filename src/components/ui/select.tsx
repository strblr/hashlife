import { type ComponentProps, useCallback } from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { playSfx } from "@/lib";
import { cn } from "@/utils";

export function Select({
  disabled,
  onOpenChange,
  ...props
}: ComponentProps<typeof SelectPrimitive.Root>) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      if (!disabled) playSfx("click");
    },
    [onOpenChange, disabled]
  );
  return (
    <SelectPrimitive.Root
      disabled={disabled}
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
}

export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  ref,
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between min-w-0",
        "border border-border bg-surface",
        "px-3 py-0",
        "text-[0.8rem] font-mono text-secondary",
        "rounded-none",
        "outline-none",
        "focus:border-border-active focus:shadow-green",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "data-placeholder:text-muted",
        "transition-all duration-150",
        // value span: shrink + truncate (fixed h-9)
        "[&>span]:pointer-events-none [&>span:first-child]:min-w-0 [&>span:first-child]:truncate",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <span className="text-muted text-[0.6rem] ml-2">▼</span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  ref,
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 min-w-32 overflow-hidden",
          "border border-border bg-surface-raised",
          "rounded-none",
          "shadow-[0_8px_24px_#07050F99]",
          position === "popper" && "w-(--radix-select-trigger-width)",
          className
        )}
        position={position}
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className="py-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({
  ref,
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        "text-muted py-1 px-3 text-[0.6rem] tracking-[0.12em] uppercase",
        className
      )}
      {...props}
    />
  );
}

export function SelectItem({
  ref,
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center",
        "py-1.5 pl-3 pr-8",
        "text-[0.8rem] font-mono text-secondary",
        "outline-none rounded-none",
        "data-highlighted:bg-surface data-highlighted:text-green",
        "data-highlighted:shadow-[inset_2px_0_0_var(--color-green)]",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "transition-all duration-100",
        className
      )}
      {...props}
    >
      <span className="absolute right-2">
        <SelectPrimitive.ItemIndicator>
          <span className="text-green text-[0.6rem]">■</span>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({
  ref,
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
