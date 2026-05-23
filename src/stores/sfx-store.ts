import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SfxStore {
  sfxMuted: boolean;
  toggleSfxMuted: () => void;
}

export const useSfxStore = create<SfxStore>()(
  persist(
    set => ({
      sfxMuted: true,
      toggleSfxMuted: () => set(s => ({ sfxMuted: !s.sfxMuted }))
    }),
    {
      name: "sfx-store",
      version: 2
    }
  )
);
