import {
  HashlifeValue,
  InlineAction,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  StatCard,
  Typography
} from "@/components";
import { hashlifeApi } from "@/stores";
import { formatNumber, formatNumberShort } from "@/utils";

export function MetricsPanel() {
  return (
    <Panel notch="md">
      <PanelHeader>
        <PanelTitle>Metrics</PanelTitle>
      </PanelHeader>
      <PanelContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            variant="ACTIVE"
            label="Generation"
            value={
              <HashlifeValue
                selector={s => [s.generation]}
                transform={n => formatNumberShort(n)}
              />
            }
            sublabel={
              <HashlifeValue
                selector={s => [s.level]}
                transform={n => `level ${n}`}
              />
            }
          />
          <StatCard
            label="Population"
            value={
              <HashlifeValue
                selector={s => [s.population]}
                transform={n => formatNumberShort(n)}
              />
            }
            sublabel={
              <HashlifeValue
                selector={s => [s.bounds]}
                transform={b =>
                  b
                    ? `${formatNumberShort(b.maxX - b.minX + 1)}×${formatNumberShort(b.maxY - b.minY + 1)}`
                    : "empty"
                }
              />
            }
          />
          <StatCard
            label="FPS"
            value={
              <HashlifeValue
                selector={s => [s.playing, s.fps]}
                transform={(playing, n) => (playing ? n.toFixed(0) : "—")}
              />
            }
            sublabel={
              <HashlifeValue
                selector={s => [s.playing]}
                transform={playing => (playing ? "rAF" : "paused")}
              />
            }
          />
          <StatCard
            label="Cache"
            sublabel={
              <span>
                <span>nodes</span>{" "}
                <InlineAction
                  size="XS"
                  variant="GHOST"
                  aria-label="Collect garbage"
                  title="Collect garbage"
                  onClick={hashlifeApi.collectGarbage}
                >
                  [GC]
                </InlineAction>
              </span>
            }
            value={
              <HashlifeValue
                selector={s => [s.cacheSize]}
                transform={n => formatNumberShort(n)}
              />
            }
          />
        </div>

        <Typography variant="MUTED" className="text-[0.65rem] leading-relaxed">
          <HashlifeValue
            selector={s => [s.bounds]}
            transform={b =>
              b
                ? `bounds [${formatNumber(b.minX)}, ${formatNumber(b.minY)}] → [${formatNumber(b.maxX)}, ${formatNumber(b.maxY)}]`
                : "universe is dead - load a pattern or paint cells"
            }
          />
        </Typography>
      </PanelContent>
    </Panel>
  );
}
