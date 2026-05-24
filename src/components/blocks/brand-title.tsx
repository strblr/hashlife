import { Typography } from "@/components";
import { cn } from "@/utils";

export function BrandTitle({ className }: { className?: string }) {
  return (
    <Typography
      variant="H1"
      className={cn("text-xl tracking-wider text-secondary", className)}
    >
      HASHLIFE
    </Typography>
  );
}
