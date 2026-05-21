import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatter = new Intl.NumberFormat("en-US");

export function formatNumber(n: number | bigint): string {
  return formatter.format(n);
}

export function formatNumberShort(n: number | bigint): string {
  if (n < 10_000n) return formatter.format(n);
  const v = typeof n === "bigint" ? n : BigInt(Math.round(n));
  if (v < 1_000_000n) return `${(Number(v) / 1_000).toFixed(1)}k`;
  if (v < 1_000_000_000n) return `${(Number(v) / 1e6).toFixed(2)}M`;
  if (v < 1_000_000_000_000n) return `${(Number(v) / 1e9).toFixed(2)}B`;
  if (v < 10n ** 15n) return `${(Number(v) / 1e12).toFixed(2)}T`;
  const s = v.toString();
  return `${s[0]}.${s.slice(1, 3)}e${s.length - 1}`;
}

export function raf<T extends (...args: any[]) => void>(cb: T) {
  let frame: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const fn = (...args: Parameters<T>) => {
    lastArgs = args;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      cb(...lastArgs!);
    });
  };

  fn.cancel = () => {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };

  return fn;
}
