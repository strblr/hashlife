import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  IconButton,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  Separator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography
} from "@/components";
import { hashlifeApi } from "@/stores";
import { PATTERNS, DEFAULT_PATTERN, type Pattern } from "@/lib";

export function PatternsPanel() {
  const [comboboxPattern, setComboboxPattern] = useState(() => DEFAULT_PATTERN);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [rle, setRle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPreset = () => {
    hashlifeApi.loadPreset(comboboxPattern.filename);
  };

  const loadFromRle = () => {
    hashlifeApi.loadRleText(rle);
  };

  const loadSoup = () => {
    hashlifeApi.loadSoup(96, 0.4);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    hashlifeApi.loadFile(file);
  };

  return (
    <Panel notch="md">
      <PanelHeader>
        <PanelTitle>Patterns</PanelTitle>
      </PanelHeader>
      <PanelContent className="space-y-3">
        <Combobox<Pattern>
          items={PATTERNS}
          itemToStringLabel={p => p.name}
          itemToStringValue={p => p.filename}
          value={comboboxPattern}
          onValueChange={p => p && setComboboxPattern(p)}
          onOpenChange={setComboboxOpen}
        >
          <ComboboxInput
            placeholder="Search patterns..."
            showClear
            onKeyDown={e => e.key === "Enter" && !comboboxOpen && loadPreset()}
          />
          <ComboboxContent>
            <ComboboxEmpty>No matching patterns</ComboboxEmpty>
            <ComboboxList>
              {(p: Pattern) => (
                <ComboboxItem key={p.filename} value={p}>
                  {p.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Typography variant="MUTED" className="leading-relaxed">
          {comboboxPattern.description}
        </Typography>

        <div className="flex flex-wrap gap-2">
          <Button size="SM" variant="EXEC" onClick={loadPreset}>
            Load preset
          </Button>
          <Button size="SM" variant="OUTLINE" onClick={loadSoup}>
            Random soup
          </Button>
        </div>

        <Separator label="Custom pattern" />

        <Textarea
          rows={3}
          value={rle}
          onChange={e => setRle(e.target.value)}
          placeholder="x = 3, y = 3, rule = B3/S23&#10;bob$2bo$3o!"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".rle,.mc"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-center gap-2 justify-between">
          <Button
            size="SM"
            variant="OUTLINE"
            onClick={loadFromRle}
            disabled={!rle.trim()}
          >
            Load RLE
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                variant="GHOST"
                aria-label="Open .rle or .mc file"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload strokeWidth={2} />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>Open .rle / .mc file</TooltipContent>
          </Tooltip>
        </div>
      </PanelContent>
    </Panel>
  );
}
