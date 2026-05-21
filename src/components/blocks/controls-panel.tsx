import { Minus, Plus } from "lucide-react";
import {
  Button,
  IconButton,
  Label,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Typography
} from "@/components";
import { hashlifeApi, useHashlifeStore } from "@/stores";
import { cn, formatNumber } from "@/utils";
import { STEP_OPTIONS } from "@/shared";

export function ControlsPanel() {
  const playing = useHashlifeStore(s => s.playing);
  const stepExp = useHashlifeStore(s => s.stepExp);
  const mode = useHashlifeStore(s => s.mode);
  const quadOverlay = useHashlifeStore(s => s.quadOverlay);

  const stepIdx = STEP_OPTIONS.indexOf(stepExp);
  const canDec = stepIdx > 0;
  const canInc = stepIdx >= 0 && stepIdx < STEP_OPTIONS.length - 1;

  return (
    <Panel notch="md">
      <PanelHeader>
        <PanelTitle>Controls</PanelTitle>
        <Typography
          variant="MUTED"
          className={cn(
            "ml-auto text-muted tracking-[0.12em] uppercase",
            playing && "text-green text-shadow-green"
          )}
        >
          {playing ? "Running" : "Idle"}
        </Typography>
      </PanelHeader>

      <PanelContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="SM"
            variant={playing ? "ABORT" : "EXEC"}
            onClick={hashlifeApi.togglePlay}
            className="min-w-20"
          >
            {playing ? "Pause" : "Play"}
          </Button>
          <Button
            size="SM"
            variant="OUTLINE"
            disabled={playing}
            onClick={hashlifeApi.stepOnce}
          >
            Step
          </Button>
          <Button size="SM" variant="GHOST" onClick={hashlifeApi.reset}>
            Reset
          </Button>
          <Button size="SM" variant="GHOST" onClick={hashlifeApi.fit}>
            Fit
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="step-rate">Step rate</Label>
          <div className="flex gap-2">
            <IconButton
              variant="OUTLINE"
              className="h-9 w-7"
              aria-label="Slower step rate"
              disabled={!canDec}
              onClick={() => hashlifeApi.bumpStepExp(-1)}
            >
              <Minus />
            </IconButton>
            <Select
              value={String(stepExp)}
              onValueChange={v => hashlifeApi.setStepExp(Number(v))}
            >
              <SelectTrigger id="step-rate" className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEP_OPTIONS.map(j => (
                  <SelectItem key={j} value={String(j)}>
                    2^{j} = {formatNumber(2 ** j)} gen / tick
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <IconButton
              variant="OUTLINE"
              className="h-9 w-7"
              aria-label="Faster step rate"
              disabled={!canInc}
              onClick={() => hashlifeApi.bumpStepExp(1)}
            >
              <Plus />
            </IconButton>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Switch
            checked={mode === "edit"}
            onCheckedChange={hashlifeApi.toggleMode}
            label="Edit mode"
          />
          <Switch
            checked={quadOverlay}
            onCheckedChange={hashlifeApi.toggleQuadOverlay}
            label="Quadtree overlay"
          />
        </div>
      </PanelContent>
    </Panel>
  );
}
