import { create } from "zustand";
import { playSfx } from "@/lib";
import type { TerminalLine } from "@/components";

export interface TerminalStore {
  lines: TerminalLog[];
  addLine: (line: TerminalLog) => void;
  clearLines: () => void;
}

export interface TerminalLog extends TerminalLine {
  silent?: boolean;
}

export const useTerminalStore = create<TerminalStore>(set => ({
  lines: [],
  addLine: line => {
    const timestamp = new Date().toLocaleTimeString("en-GB", { hour12: false });
    set(state => ({
      lines: [...state.lines, { ...line, timestamp }]
    }));
    if (!line.silent) {
      if (line.type === "output") {
        playSfx("content");
      } else if (line.type === "error") {
        playSfx("error");
      }
    }
  },
  clearLines: () => set({ lines: [] })
}));
