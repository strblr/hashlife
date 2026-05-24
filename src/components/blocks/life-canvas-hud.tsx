import { HashlifeValue } from "@/components";
import { useHashlifeStore } from "@/stores";
import { cn, formatNumberShort } from "@/utils";

export function LifeCanvasHud() {
  const mode = useHashlifeStore(s => s.mode);
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-2 left-2 select-none",
        "flex flex-col gap-1",
        "font-mono text-[0.65rem] tracking-widest",
        "text-muted uppercase"
      )}
    >
      <div className="flex gap-3 md:hidden">
        <span>
          gen{" "}
          <HashlifeValue
            className="text-green text-shadow-green"
            selector={s => [s.generation]}
            transform={n => formatNumberShort(n)}
          />
        </span>
        <span>
          pop{" "}
          <HashlifeValue
            className="text-secondary"
            selector={s => [s.population]}
            transform={n => formatNumberShort(n)}
          />
        </span>
        <span>
          fps{" "}
          <HashlifeValue
            className="text-secondary"
            selector={s => [s.playing, s.fps]}
            transform={(playing, n) => (playing ? n.toFixed(0) : "—")}
          />
        </span>
      </div>
      <div className="flex gap-3">
        <span className="hidden md:inline">
          mode <span className="text-green text-shadow-green">{mode}</span>
        </span>
        <span>
          zoom{" "}
          <HashlifeValue
            className="text-secondary"
            selector={s => [s.camera.cellSize]}
            transform={s => `${s.toFixed(5)}px/cell`}
          />
        </span>
        <span>
          cell{" "}
          <HashlifeValue
            className="text-secondary"
            selector={s => [s.camera, s.pointer]}
            transform={(c, p) => {
              return p
                ? `${Math.floor(c.cellX + p.sx / c.cellSize)}, ${Math.floor(c.cellY + p.sy / c.cellSize)}`
                : "";
            }}
          />
        </span>
      </div>
    </div>
  );
}
