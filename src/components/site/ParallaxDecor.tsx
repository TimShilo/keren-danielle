import { useEffect, useRef } from "react";

/**
 * Decorative element that drifts gently with / against the mouse (depth > 0 follows the pointer,
 * depth < 0 moves the opposite way) and bobs slowly on its own so it is alive even without a mouse.
 * Off for touch devices and "reduce motion".
 */
interface Item {
  el: HTMLElement;
  depth: number;
  phase: number;
  x: number;
  y: number;
}

const items = new Set<Item>();
let raf = 0;
let px = 0; // pointer, -1..1 across the viewport
let py = 0;
let listening = false;

const AMP = 28; // px at depth 1 (scaled to the page width below)
const BOB = 7;

function frame(t: number) {
  const scale = Math.min(1.4, Math.max(0.6, window.innerWidth / 1920));
  items.forEach((it) => {
    const tx = px * it.depth * AMP * scale;
    const ty = py * it.depth * AMP * scale + Math.sin(t / 1100 + it.phase) * BOB * scale;
    it.x += (tx - it.x) * 0.06;
    it.y += (ty - it.y) * 0.06;
    it.el.style.transform = `translate3d(${it.x.toFixed(2)}px, ${it.y.toFixed(2)}px, 0)`;
  });
  raf = items.size ? requestAnimationFrame(frame) : 0;
}

function onMove(e: PointerEvent) {
  if (e.pointerType === "touch") return;
  px = (e.clientX / window.innerWidth) * 2 - 1;
  py = (e.clientY / window.innerHeight) * 2 - 1;
}

function register(item: Item) {
  items.add(item);
  if (!listening) {
    window.addEventListener("pointermove", onMove, { passive: true });
    listening = true;
  }
  if (!raf) raf = requestAnimationFrame(frame);
  return () => {
    items.delete(item);
    if (!items.size) {
      window.removeEventListener("pointermove", onMove);
      listening = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

export function ParallaxDecor({
  src,
  depth,
  phase = 0,
  className = "",
  imgClassName = "",
}: {
  src: string;
  depth: number;
  phase?: number;
  /** Position/size of the (static) wrapper */
  className?: string;
  imgClassName?: string;
}) {
  const inner = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = inner.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    return register({ el, depth, phase, x: 0, y: 0 });
  }, [depth, phase]);

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <img ref={inner} src={src} alt="" className={`block w-full will-change-transform ${imgClassName}`} />
    </div>
  );
}
