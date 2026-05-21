import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type JSX,
  type Ref
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

export const typographyVariants = cva("font-mono", {
  variants: {
    variant: {
      H1: "text-3xl font-bold uppercase tracking-[0.15em] text-green text-shadow-green",
      H2: "text-2xl font-semibold uppercase tracking-[0.12em] text-green",
      H3: "text-xl font-semibold uppercase tracking-[0.1em] text-secondary",
      H4: "text-base font-medium uppercase tracking-widest text-secondary",
      P: "text-sm leading-relaxed text-secondary",
      LEAD: "text-base leading-relaxed text-secondary opacity-90",
      MUTED: "text-xs text-muted",
      CODE: "text-sm bg-surface-raised border border-border px-1.5 py-0.5 text-green inline-block"
    }
  },
  defaultVariants: { variant: "P" }
});

type VariantElement = {
  H1: "h1";
  H2: "h2";
  H3: "h3";
  H4: "h4";
  P: "p";
  LEAD: "p";
  MUTED: "p";
  CODE: "code";
};

const variantTag: VariantElement = {
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  P: "p",
  LEAD: "p",
  MUTED: "p",
  CODE: "code"
};

export interface TypographyProps
  extends
    ComponentPropsWithoutRef<"p">,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
  ref?: Ref<HTMLElement>;
}

export function Typography({
  ref,
  className,
  variant = "P",
  as,
  children,
  ...props
}: TypographyProps) {
  const Tag = (as ??
    variantTag[variant as keyof VariantElement] ??
    "p") as ElementType;
  return (
    <Tag
      ref={ref}
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
