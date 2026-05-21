import { Fragment, type ReactNode } from "react";
import {
  Kbd,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  Typography
} from "@/components";

export function InfoPanel() {
  return (
    <Panel notch="md">
      <PanelHeader>
        <PanelTitle>Info</PanelTitle>
      </PanelHeader>
      <PanelContent className="space-y-3">
        <Typography variant="MUTED" className="leading-relaxed">
          Hash-consed quadtree with memoised step results - Bill Gosper, 1984.
          Identical sub-patterns share one cached node, so repeating structures
          (gliders, oscillators) compute their futures once and never again.
        </Typography>

        <div className="grid items-center gap-x-3 gap-y-1.5 grid-cols-[auto_1fr]">
          {SHORTCUTS.map(([key, label], i) => (
            <Fragment key={i}>
              <span className="inline-flex">{key}</span>
              <Typography variant="MUTED">{label}</Typography>
            </Fragment>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}

// Utils

const SHORTCUTS: ReadonlyArray<readonly [ReactNode, string]> = [
  [<Kbd key="space">Space</Kbd>, "Play / pause"],
  [<Kbd key="step">→</Kbd>, "Step once"],
  [<Kbd key="faster">+</Kbd>, "Faster step rate"],
  [<Kbd key="slower">−</Kbd>, "Slower step rate"],
  [<Kbd key="reset">R</Kbd>, "Reset"],
  [<Kbd key="edit">E</Kbd>, "Toggle view / edit"],
  [<Kbd key="quad">Q</Kbd>, "Toggle quad overlay"],
  [<Kbd key="fit">F</Kbd>, "Fit to bounds"],
  [<Kbd key="mmb">MMB</Kbd>, "Pan (any mode)"],
  [<Kbd key="wheel">Wheel</Kbd>, "Zoom at cursor"]
];
