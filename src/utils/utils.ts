import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatter = new Intl.NumberFormat("en-US");

export function formatNumber(n: number | bigint): string {
  return formatter.format(n);
}

export interface FormatNumberShortOptions {
  decimals?: number;
  binary?: boolean;
}

export function formatNumberShort(
  n: number | bigint,
  opts?: FormatNumberShortOptions
): string {
  const { decimals, binary } = opts ?? {};
  const base = binary ? 1024 : 1000;
  const minAbbrev = decimals !== undefined ? BigInt(base) : 10_000n;
  if (n < minAbbrev) return formatter.format(n);
  const v = typeof n === "bigint" ? n : BigInt(Math.round(n));
  const M = BigInt(base) ** 2n;
  const B = BigInt(base) ** 3n;
  const T = BigInt(base) ** 4n;
  if (v < M) return `${(Number(v) / base).toFixed(decimals ?? 1)}k`;
  if (v < B) return `${(Number(v) / Number(M)).toFixed(decimals ?? 2)}M`;
  if (v < T) return `${(Number(v) / Number(B)).toFixed(decimals ?? 2)}B`;
  if (v < 10n ** 15n)
    return `${(Number(v) / Number(T)).toFixed(decimals ?? 2)}T`;
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
