import { type ComponentProps, type ReactNode, useRef } from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { playSfx } from "@/lib";
import { cn } from "@/utils";

export function Combobox<Value, Multiple extends boolean | undefined = false>({
  disabled,
  onOpenChange,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple>) {
  return (
    <ComboboxPrimitive.Root
      disabled={disabled}
      onOpenChange={(open, details) => {
        onOpenChange?.(open, details);
        if (!disabled) playSfx("click");
      }}
      {...props}
    />
  );
}

export function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value {...props} />;
}

export function ComboboxTrigger({
  ref,
  className,
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Trigger>) {
  return (
    <ComboboxPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between",
        "border border-border bg-surface",
        "px-3 py-0",
        "text-[0.8rem] font-mono text-secondary",
        "rounded-none",
        "outline-none",
        "data-popup-open:border-border-active data-popup-open:shadow-green",
        "focus-visible:border-border-active focus-visible:shadow-green",
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        "data-placeholder:text-muted",
        "transition-all duration-150",
        // truncate first child (value) for h-9
        "[&>span:first-child]:min-w-0 [&>span:first-child]:truncate",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.Icon className="ml-2 shrink-0 text-muted text-[0.6rem]">
        ▼
      </ComboboxPrimitive.Icon>
    </ComboboxPrimitive.Trigger>
  );
}

export function ComboboxClear({
  ref,
  className,
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Clear>) {
  return (
    <ComboboxPrimitive.Clear
      ref={ref}
      aria-label="Clear"
      className={cn(
        "flex h-full items-center justify-center shrink-0",
        "px-2",
        "text-muted hover:text-amber",
        "outline-none cursor-pointer",
        "transition-colors duration-150",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? <span className="text-[0.7rem]">✕</span>}
    </ComboboxPrimitive.Clear>
  );
}

export interface ComboboxInputProps extends ComponentProps<
  typeof ComboboxPrimitive.Input
> {
  containerClassName?: string; // InputGroup wrapper
  showTrigger?: boolean; // chevron button
  showClear?: boolean;
  children?: ReactNode; // after trigger, inside InputGroup
}

export function ComboboxInput({
  ref,
  className,
  containerClassName,
  disabled,
  showTrigger = true,
  showClear = false,
  children,
  ...props
}: ComboboxInputProps) {
  return (
    <ComboboxPrimitive.InputGroup
      className={cn(
        "flex h-9 w-full items-center",
        "border border-border bg-surface",
        "rounded-none",
        "transition-all duration-150",
        "focus-within:border-border-active focus-within:shadow-green",
        "data-popup-open:border-border-active data-popup-open:shadow-green",
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        containerClassName
      )}
    >
      <ComboboxPrimitive.Input
        ref={ref}
        disabled={disabled}
        className={cn(
          "h-full w-full min-w-0 flex-1",
          "bg-transparent",
          "px-3",
          "font-mono text-[0.8rem] text-secondary caret-green",
          "placeholder:text-muted",
          "border-none outline-none",
          "disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
      {showClear && <ComboboxClear />}
      {showTrigger && (
        <ComboboxPrimitive.Trigger
          disabled={disabled}
          className={cn(
            "flex h-full items-center justify-center shrink-0",
            "px-2.5",
            "text-muted hover:text-secondary",
            "data-popup-open:text-green",
            "outline-none cursor-pointer",
            "transition-colors duration-150",
            "data-disabled:cursor-not-allowed data-disabled:opacity-40"
          )}
        >
          <ComboboxPrimitive.Icon className="text-[0.6rem]">
            ▼
          </ComboboxPrimitive.Icon>
        </ComboboxPrimitive.Trigger>
      )}
      {children}
    </ComboboxPrimitive.InputGroup>
  );
}

type PositionerPick = Pick<
  ComboboxPrimitive.Positioner.Props,
  "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
>;

export function ComboboxContent({
  ref,
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  anchor,
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Popup> & PositionerPick) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 outline-none"
      >
        <ComboboxPrimitive.Popup
          ref={ref}
          className={cn(
            "group/combobox-popup",
            "relative min-w-32 overflow-hidden",
            "w-(--anchor-width) max-w-(--available-width)",
            "max-h-(--available-height)",
            "border border-border bg-surface-raised",
            "rounded-none",
            "shadow-[0_8px_24px_#07050F99]",
            "outline-none",
            className
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export function ComboboxList({
  ref,
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.List>) {
  return (
    <ComboboxPrimitive.List
      ref={ref}
      className={cn(
        "max-h-[min(18rem,calc(var(--available-height)-0.5rem))]",
        "overflow-y-auto overscroll-contain",
        "py-1",
        "data-empty:py-0",
        className
      )}
      {...props}
    />
  );
}

export function ComboboxItem({
  ref,
  className,
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item
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
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ComboboxPrimitive.ItemIndicator className="absolute right-2 flex items-center justify-center text-green text-[0.6rem]">
        ■
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

export function ComboboxGroup({
  ref,
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Group>) {
  return (
    <ComboboxPrimitive.Group ref={ref} className={cn(className)} {...props} />
  );
}

export function ComboboxLabel({
  ref,
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.GroupLabel>) {
  return (
    <ComboboxPrimitive.GroupLabel
      ref={ref}
      className={cn(
        "text-muted py-1 px-3 text-[0.6rem] tracking-[0.12em] uppercase",
        className
      )}
      {...props}
    />
  );
}

export function ComboboxCollection(props: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection {...props} />;
}

export function ComboboxEmpty({
  ref,
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      ref={ref}
      className={cn(
        // mounted for SR; shown when popup is data-empty
        "hidden group-data-empty/combobox-popup:flex",
        "w-full items-center justify-center",
        "px-3 py-3",
        "text-center text-[0.7rem] font-mono uppercase tracking-widest",
        "text-muted",
        className
      )}
      {...props}
    />
  );
}

export function ComboboxSeparator({
  ref,
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Separator>) {
  return (
    <ComboboxPrimitive.Separator
      ref={ref}
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export function ComboboxChips({
  ref,
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Chips>) {
  return (
    <ComboboxPrimitive.Chips
      ref={ref}
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5",
        "border border-border bg-surface",
        "px-2 py-1",
        "rounded-none",
        "transition-all duration-150",
        "focus-within:border-border-active focus-within:shadow-green",
        className
      )}
      {...props}
    />
  );
}

export function ComboboxChip({
  ref,
  className,
  children,
  showRemove = true,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Chip> & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2 py-0.5",
        "text-[0.65rem] font-mono font-medium uppercase tracking-widest",
        "border border-border-active text-green text-shadow-green",
        "shadow-[inset_0_0_8px_#00ed3f11]",
        "rounded-none",
        "whitespace-nowrap",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          aria-label="Remove"
          className={cn(
            "-mr-0.5 flex items-center justify-center",
            "text-green opacity-60 hover:opacity-100",
            "outline-none cursor-pointer",
            "transition-opacity duration-150"
          )}
        >
          <span className="text-[0.6rem]">✕</span>
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

export function ComboboxChipsInput({
  ref,
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.Input
      ref={ref}
      className={cn(
        "h-7 min-w-16 flex-1",
        "bg-transparent",
        "font-mono text-[0.8rem] text-secondary caret-green",
        "placeholder:text-muted",
        "border-none outline-none",
        "px-1",
        className
      )}
      {...props}
    />
  );
}

export function useComboboxAnchor() {
  return useRef<HTMLDivElement | null>(null);
}

export const useComboboxFilter = ComboboxPrimitive.useFilter;
