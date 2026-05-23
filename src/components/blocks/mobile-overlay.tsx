import { useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import {
  Grid2x2,
  Maximize,
  Menu,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  StepForward
} from "lucide-react";
import { IconButton } from "@/components";
import { hashlifeApi, useHashlifeStore } from "@/stores";
import { formatNumberShort } from "@/utils";
import { STEP_OPTIONS } from "@/shared";

export function MobileOverlay({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const playing = useHashlifeStore(s => s.playing);
  const editing = useHashlifeStore(s => s.mode === "edit");
  const quadOverlay = useHashlifeStore(s => s.quadOverlay);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-2 top-2 z-10 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1 *:pointer-events-auto">
          <IconButton
            size="LG"
            variant={playing ? "ABORT" : "EXEC"}
            aria-label={playing ? "Pause" : "Play"}
            onClick={hashlifeApi.togglePlay}
          >
            {playing ? <Pause /> : <Play />}
          </IconButton>
          <IconButton
            size="LG"
            aria-label="Step once"
            disabled={playing}
            onClick={hashlifeApi.stepOnce}
          >
            <StepForward />
          </IconButton>
          <IconButton
            size="LG"
            aria-label="Fit to bounds"
            onClick={hashlifeApi.fit}
          >
            <Maximize />
          </IconButton>
          <IconButton
            size="LG"
            variant={editing ? "EXEC" : "OUTLINE"}
            aria-label="Toggle edit mode"
            aria-pressed={editing}
            onClick={hashlifeApi.toggleMode}
          >
            <Pencil />
          </IconButton>
          <IconButton
            size="LG"
            variant={quadOverlay ? "EXEC" : "OUTLINE"}
            aria-label="Toggle quadtree overlay"
            aria-pressed={quadOverlay}
            onClick={hashlifeApi.toggleQuadOverlay}
          >
            <Grid2x2 />
          </IconButton>
          <StepRateStepper />
        </div>
        <IconButton
          size="LG"
          className="pointer-events-auto"
          aria-label="Open controls"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </IconButton>
      </div>

      <Drawer.Root direction="right" open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-[rgba(7,5,15,0.7)]" />
          <Drawer.Content className="fixed p-4 inset-y-0 right-0 z-50 flex w-[85vw] max-w-md flex-col border-l border-border bg-background outline-none">
            <Drawer.Title className="sr-only">Controls</Drawer.Title>
            <Drawer.Description className="sr-only">
              Hashlife controls, patterns, metrics and info
            </Drawer.Description>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 *:shrink-0">
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

function StepRateStepper() {
  const stepExp = useHashlifeStore(s => s.stepExp);
  const idx = STEP_OPTIONS.indexOf(stepExp);
  const canDec = idx > 0;
  const canInc = idx >= 0 && idx < STEP_OPTIONS.length - 1;

  return (
    <div
      role="group"
      aria-label="Step rate"
      className="inline-flex shrink-0 items-stretch"
    >
      <IconButton
        variant="OUTLINE"
        className="h-11 w-7 border-r-0"
        aria-label="Slower step rate"
        disabled={!canDec}
        onClick={() => hashlifeApi.bumpStepExp(-1)}
      >
        <Minus className="size-3.5" />
      </IconButton>
      <div
        aria-live="polite"
        className="flex h-11 min-w-11 items-center justify-center border border-border bg-surface px-1.5 font-mono text-[0.8rem] font-medium tracking-[0.04em] tabular-nums text-green text-shadow-green backdrop-blur-md"
      >
        {formatNumberShort(2 ** stepExp, { decimals: 0, binary: true })}
      </div>
      <IconButton
        variant="OUTLINE"
        className="h-11 w-7 border-l-0"
        aria-label="Faster step rate"
        disabled={!canInc}
        onClick={() => hashlifeApi.bumpStepExp(1)}
      >
        <Plus className="size-3.5" />
      </IconButton>
    </div>
  );
}
