import { useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import {
  Grid2x2,
  Maximize,
  Menu,
  Pause,
  Pencil,
  Play,
  StepForward,
  Trash2
} from "lucide-react";
import { IconButton } from "@/components";
import { hashlifeApi, useHashlifeStore } from "@/stores";

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
          <IconButton size="LG" aria-label="Clear" onClick={hashlifeApi.clear}>
            <Trash2 />
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
