import { useSfxStore } from "@/stores";
import clickUrl from "@/assets/sounds/click.webm";
import contentUrl from "@/assets/sounds/content.webm";
import errorUrl from "@/assets/sounds/error.webm";

const SOUNDS = {
  click: { url: clickUrl, volume: 0.4 },
  error: { url: errorUrl, volume: 0.4 },
  content: { url: contentUrl, volume: 0.4 }
};

export type SfxName = keyof typeof SOUNDS;

const pools: Record<SfxName, HTMLAudioElement[]> = createPools();

const cursors: Record<SfxName, number> = {
  click: 0,
  error: 0,
  content: 0
};

function createPools() {
  const out = {} as Record<SfxName, HTMLAudioElement[]>;
  for (const name of Object.keys(SOUNDS) as SfxName[]) {
    out[name] = [];
    for (let i = 0; i < 4; i++) {
      const el = new Audio(SOUNDS[name].url);
      el.preload = "auto";
      out[name].push(el);
    }
  }
  return out;
}

// playSfx

export interface PlayOptions {
  volume?: number;
}

export function playSfx(name: SfxName, opts?: PlayOptions) {
  if (useSfxStore.getState().sfxMuted) return;
  const pool = pools[name];
  if (pool.length === 0) return;
  const i = cursors[name];
  cursors[name] = (i + 1) % pool.length;
  const el = pool[i];
  el.volume = opts?.volume ?? SOUNDS[name].volume;
  try {
    el.currentTime = 0;
  } catch {}
  el.play().catch(() => {});
}
