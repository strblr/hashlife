import { type ComponentProps } from "react";
import { cn } from "@/utils";

export type SystemStatus =
  | "ACTIVE"
  | "OFFLINE"
  | "WARNING"
  | "CRITICAL"
  | "SCANNING";

export interface SystemEntry {
  name: string;
  status: SystemStatus;
  detail?: string;
}

export interface StatusGridProps extends ComponentProps<"div"> {
  systems: SystemEntry[];
  title?: string;
  columns?: 1 | 2 | 3;
}

const dotClass: Record<SystemStatus, string> = {
  ACTIVE: "bg-green shadow-green",
  OFFLINE: "bg-muted",
  WARNING: "bg-amber shadow-amber",
  CRITICAL: "bg-red shadow-red",
  SCANNING: "bg-green shadow-green animate-[blink-cursor_1s_step-end_infinite]"
};

const statusLabelClass: Record<SystemStatus, string> = {
  ACTIVE: "text-green",
  OFFLINE: "text-muted",
  WARNING: "text-amber",
  CRITICAL: "text-red",
  SCANNING: "text-green"
};

const columnsClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3"
} as const;

export function StatusGrid({
  ref,
  className,
  systems,
  title,
  columns = 1,
  ...props
}: StatusGridProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "border border-border bg-surface font-mono overflow-hidden",
        className
      )}
      {...props}
    >
      {title && (
        <div
          className={cn(
            "border-b border-border bg-surface-raised text-muted",
            "px-3 py-[0.4rem] text-[0.6rem] tracking-[0.12em] uppercase"
          )}
        >
          {title}
        </div>
      )}

      <div className={cn("grid", columnsClass[columns])}>
        {systems.map((system, i) => {
          // border logic: no bottom border on last row(s), no right on last column
          const totalRows = Math.ceil(systems.length / columns);
          const rowIndex = Math.floor(i / columns);
          const colIndex = i % columns;
          const isLastRow = rowIndex === totalRows - 1;
          const isLastCol = colIndex === columns - 1;

          return (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[1fr_auto] items-center gap-2",
                "px-3 py-2 min-w-0",
                !isLastRow && "border-b border-border",
                !isLastCol && "border-r border-border"
              )}
            >
              <span className="text-secondary min-w-0 text-[0.7rem] tracking-[0.06em] uppercase truncate">
                {system.name}
                {system.detail && (
                  <span className="text-muted ml-2 normal-case">
                    {system.detail}
                  </span>
                )}
              </span>

              <div className="flex items-center gap-[0.4rem]">
                <span
                  className={cn(
                    "inline-block w-1.5 h-1.5 rounded-full",
                    dotClass[system.status]
                  )}
                />
                <span
                  className={cn(
                    "text-[0.6rem] tracking-[0.08em]",
                    statusLabelClass[system.status]
                  )}
                >
                  {system.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
