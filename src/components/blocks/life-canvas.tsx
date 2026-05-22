import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { hashlifeApi, useHashlifeStore } from "@/stores";
import { ZOOM_PER_TICK, ZOOM_PER_DBLCLICK } from "@/shared";
import { cn, raf } from "@/utils";

export function LifeCanvas({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useHashlifeStore(s => s.mode);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let lastTap: { time: number; x: number; y: number } | null = null;
    let gesture: Gesture = null;

    const screen = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const pair = () => {
      if (pointers.size !== 2) return null;
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      return dist > 0 ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, dist } : null;
    };

    const isDoubleTap = (p: Point) => {
      const now = performance.now();
      const doubleTap =
        lastTap &&
        now - lastTap.time < DOUBLE_TAP_MS &&
        Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < TAP_PX;
      lastTap = doubleTap ? null : { time: now, ...p };
      return doubleTap;
    };

    // Hand canvas to the worker
    if (canvas.dataset.transferred !== "true") {
      const dpr = window.devicePixelRatio || 1;
      const r = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      hashlifeApi.attachCanvas(canvas, { w: r.width, h: r.height, dpr });
      canvas.dataset.transferred = "true";
    }

    // Forward resize to worker
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = `${cr.width}px`;
        canvas.style.height = `${cr.height}px`;
        hashlifeApi.resize({ w: cr.width, h: cr.height, dpr });
      }
    });
    ro.observe(container);

    // Wheel zoom
    const onWheelRaf = raf((cx: number, cy: number, deltaY: number) => {
      const p = screen(cx, cy);
      const factor = deltaY < 0 ? ZOOM_PER_TICK : 1 / ZOOM_PER_TICK;
      hashlifeApi.zoomBy(p.x, p.y, factor);
    });
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onWheelRaf(e.clientX, e.clientY, e.deltaY);
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    // Pointer down
    const onPointerDown = (e: PointerEvent) => {
      const p = screen(e.clientX, e.clientY);
      container.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, p);
      if (pointers.size > 1) {
        const prev = pair();
        gesture = prev ? { kind: "pinch", prev } : null;
        return;
      }
      const { mode } = useHashlifeStore.getState();
      const wantsPan = e.button === 1 || (mode === "view" && e.button === 0);
      if (wantsPan) {
        gesture = { kind: "pan", id: e.pointerId, start: p, last: p };
        return;
      }
      if (mode === "edit" && e.button === 0) {
        const alive = e.shiftKey ? 0 : 1;
        gesture = { kind: "paint", id: e.pointerId, alive };
        hashlifeApi.paintAt(p.x, p.y, alive);
      }
    };
    container.addEventListener("pointerdown", onPointerDown);

    // Pointer move
    const onPointerMoveRaf = raf((p: { x: number; y: number }) => {
      hashlifeApi.setPointer(p.x, p.y);
      const nextPinch = pair();
      if (gesture?.kind === "pinch" && nextPinch) {
        hashlifeApi.panBy(
          nextPinch.x - gesture.prev.x,
          nextPinch.y - gesture.prev.y
        );
        hashlifeApi.zoomBy(
          nextPinch.x,
          nextPinch.y,
          nextPinch.dist / gesture.prev.dist
        );
        gesture.prev = nextPinch;
        return;
      }
      if (gesture?.kind === "pan") {
        hashlifeApi.panBy(p.x - gesture.last.x, p.y - gesture.last.y);
        gesture.last = p;
      } else if (gesture?.kind === "paint") {
        hashlifeApi.paintAt(p.x, p.y, gesture.alive);
      }
    });

    const onPointerMove = (e: PointerEvent) => {
      const p = screen(e.clientX, e.clientY);
      if (pointers.has(e.pointerId)) {
        pointers.set(e.pointerId, p);
      }
      onPointerMoveRaf(p);
    };
    container.addEventListener("pointermove", onPointerMove);

    // Pointer up or cancel
    const onPointerUpOrCancel = (e: PointerEvent) => {
      const p = screen(e.clientX, e.clientY);
      const wasTap =
        e.type === "pointerup" &&
        gesture?.kind === "pan" &&
        gesture.id === e.pointerId &&
        Math.hypot(p.x - gesture.start.x, p.y - gesture.start.y) < TAP_PX;
      container.releasePointerCapture(e.pointerId);
      pointers.delete(e.pointerId);
      const prev = pair();
      gesture = prev ? { kind: "pinch", prev } : null;
      if (wasTap) {
        if (isDoubleTap(p)) {
          hashlifeApi.zoomBy(p.x, p.y, ZOOM_PER_DBLCLICK);
        }
      } else if (e.type === "pointerup") {
        lastTap = null;
      }
    };
    container.addEventListener("pointerup", onPointerUpOrCancel);
    container.addEventListener("pointercancel", onPointerUpOrCancel);

    // Pointer leave
    const onPointerLeave = () => {
      onPointerMoveRaf.cancel();
      hashlifeApi.clearPointer();
    };
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      ro.disconnect();
      container.removeEventListener("wheel", onWheel);
      onWheelRaf.cancel();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      onPointerMoveRaf.cancel();
      container.removeEventListener("pointerup", onPointerUpOrCancel);
      container.removeEventListener("pointercancel", onPointerUpOrCancel);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden border border-border bg-background",
        "shadow-[0_0_24px_rgba(0,237,63,0.04),inset_0_0_60px_rgba(0,0,0,0.6)]",
        "touch-none",
        mode === "view" ? "cursor-grab" : "cursor-crosshair",
        className
      )}
      {...props}
    >
      <canvas ref={canvasRef} className="block" />
      {children}
    </div>
  );
}

// Utils

type Point = { x: number; y: number };
type Pinch = Point & { dist: number };
type Gesture =
  | { kind: "pan"; id: number; start: Point; last: Point }
  | { kind: "paint"; id: number; alive: 0 | 1 }
  | { kind: "pinch"; prev: Pinch }
  | null;

const TAP_PX = 24;
const DOUBLE_TAP_MS = 300;
