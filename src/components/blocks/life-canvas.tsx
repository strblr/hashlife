import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { hashlifeApi, useHashlifeStore } from "@/stores";
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

    let drag:
      | { kind: "pan"; lastX: number; lastY: number }
      | { kind: "paint"; alive: 0 | 1 }
      | null = null;

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
    const onWheelRaf = raf((cx: number, cy: number, dy: number) => {
      const rect = container.getBoundingClientRect();
      hashlifeApi.zoomBy(cx - rect.left, cy - rect.top, dy);
    });
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onWheelRaf(e.clientX, e.clientY, e.deltaY);
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    // Pointer down
    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      container.setPointerCapture(e.pointerId);
      const { mode } = useHashlifeStore.getState();
      const wantsPan = e.button === 1 || (mode === "view" && e.button === 0);
      if (wantsPan) {
        drag = { kind: "pan", lastX: sx, lastY: sy };
        return;
      }
      if (mode === "edit" && e.button === 0) {
        const alive = e.shiftKey ? 0 : 1;
        drag = { kind: "paint", alive };
        hashlifeApi.paintAt(sx, sy, alive);
      }
    };
    container.addEventListener("pointerdown", onPointerDown);

    // Pointer move
    const onPointerMoveRaf = raf((cx: number, cy: number) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const sx = cx - rect.left;
      const sy = cy - rect.top;
      hashlifeApi.setPointer(sx, sy);
      if (!drag) return;
      if (drag.kind === "pan") {
        hashlifeApi.panBy(sx - drag.lastX, sy - drag.lastY);
        drag.lastX = sx;
        drag.lastY = sy;
      } else {
        hashlifeApi.paintAt(sx, sy, drag.alive);
      }
    });

    const onPointerMove = (e: PointerEvent) => {
      onPointerMoveRaf(e.clientX, e.clientY);
    };
    container.addEventListener("pointermove", onPointerMove);

    // Pointer up or cancel
    const onPointerUpOrCancel = (e: PointerEvent) => {
      container.releasePointerCapture(e.pointerId);
      drag = null;
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
