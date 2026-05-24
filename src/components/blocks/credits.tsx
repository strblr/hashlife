import {
  GitHubIcon,
  IconButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography
} from "@/components";
import { cn } from "@/utils";

export function Credits({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Typography
        variant="MUTED"
        className="text-[0.65rem] tracking-[0.18em] leading-normal"
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
    </div>
  );
}

const SOURCE_REPO = "https://github.com/strblr/hashlife";
