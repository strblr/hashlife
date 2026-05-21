import { HashlifeValue } from "@/components";
import { useHashlifeStore } from "@/stores";
import { cn } from "@/utils";

export function LifeCanvasHud() {
  const mode = useHashlifeStore(s => s.mode);
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-2 left-2 select-none",
        "flex gap-3",
        "font-mono text-[0.65rem] tracking-widest",
        "text-muted uppercase"
      )}
    >
      <span>
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
  );
}
