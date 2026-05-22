import { useEffect } from "react";
import {
  ControlsPanel,
  Header,
  InfoPanel,
  MetricsPanel,
  MobileOverlay,
  PatternsPanel,
  TerminalPanel,
  LifeCanvas,
  LifeCanvasHud
} from "@/components";
import { useHotkeys, useMediaQuery } from "@/hooks";
import { hashlifeApi } from "@/stores";
import { DEFAULT_PATTERN } from "@/lib";

export function App() {
  const isMobile = useMediaQuery("(width < 48rem)");

  useEffect(() => {
    hashlifeApi.loadPreset(DEFAULT_PATTERN.filename);
  }, []);

  useHotkeys(
    [
      { code: "Space", action: hashlifeApi.togglePlay },
      { code: "ArrowRight", action: hashlifeApi.stepOnce, repeat: true },
      { code: "KeyC", action: hashlifeApi.clear },
      { code: "KeyE", action: hashlifeApi.toggleMode },
      { code: "KeyQ", action: hashlifeApi.toggleQuadOverlay },
      { code: "KeyF", action: hashlifeApi.fit },
      { key: "+", action: () => hashlifeApi.bumpStepExp(1), repeat: true },
      { key: "-", action: () => hashlifeApi.bumpStepExp(-1), repeat: true }
    ],
    []
  );

  const panels = (
    <>
      <ControlsPanel />
      <PatternsPanel />
      <MetricsPanel />
      <InfoPanel />
      <TerminalPanel />
    </>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {!isMobile && <Header />}
      <main className="flex min-h-0 flex-1 md:gap-4 md:p-4">
        <LifeCanvas className="min-w-0 flex-1">
          <LifeCanvasHud />
        </LifeCanvas>
        {isMobile ? (
          <MobileOverlay>{panels}</MobileOverlay>
        ) : (
          <aside className="flex w-90 shrink-0 flex-col gap-4 overflow-y-auto pr-1 *:shrink-0">
            {panels}
          </aside>
        )}
      </main>
    </div>
  );
}
