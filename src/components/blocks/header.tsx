import { Volume2, VolumeX } from "lucide-react";
import {
  Badge,
  HashlifeValue,
  IconButton,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
  GitHubIcon
} from "@/components";
import { useHashlifeStore, useSfxStore } from "@/stores";
import { formatNumber } from "@/utils";

export function Header() {
  const playing = useHashlifeStore(s => s.playing);
  const muted = useSfxStore(s => s.sfxMuted);
  const SfxIcon = muted ? VolumeX : Volume2;
  const sfxLabel = muted ? "Unmute sound effects" : "Mute sound effects";

  return (
    <header className="shrink-0 border-b border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-4">
        <Typography
          variant="H1"
          className="text-xl tracking-wider text-secondary"
        >
          HASHLIFE
        </Typography>
        <Badge variant={playing ? "SCANNING" : "OFFLINE"}>
          {playing ? "running" : "idle"}
        </Badge>
        <Separator orientation="vertical" className="h-6" />
        <Typography variant="MUTED" className="text-[0.7rem] tracking-[0.12em]">
          gen{" "}
          <HashlifeValue
            selector={s => [s.generation]}
            transform={n => formatNumber(n)}
            className="text-green text-shadow-green"
          />
        </Typography>
        <Typography variant="MUTED" className="text-[0.7rem] tracking-[0.12em]">
          pop{" "}
          <HashlifeValue
            selector={s => [s.population]}
            transform={n => formatNumber(n)}
            className="text-secondary"
          />
        </Typography>
        <Typography
          variant="MUTED"
          className="ml-auto text-[0.65rem] tracking-[0.18em] leading-normal"
        >
          gosper · 1984
        </Typography>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton asChild variant="GHOST">
              <a
                href={SOURCE_REPO}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View source on GitHub"
              >
                <GitHubIcon />
              </a>
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>Source on GitHub</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              type="button"
              aria-label={sfxLabel}
              variant={muted ? "GHOST" : "OUTLINE"}
              onClick={useSfxStore.getState().toggleSfxMuted}
            >
              <SfxIcon strokeWidth={2} />
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>{sfxLabel}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

// Utils

const SOURCE_REPO = "https://github.com/strblr/hashlife";
