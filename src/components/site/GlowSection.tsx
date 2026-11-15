import { useEffect, useRef, type ElementType, type ReactNode } from "react";

// Soft arch (design: 1920 x 92). The glow is clipped by this shape, so it never shows a straight edge.
const CURVE_MASK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 92" preserveAspectRatio="none"><path d="M0 89C0 89 1314.32 9.3 1920 89V92H0Z" fill="#000"/></svg>',
  );

/**
 * Light-blue section with a large, blurred yellow circle that glides after the mouse
 * (eased, so it trails slightly). Without a mouse (touch / reduced motion) it drifts slowly on its own.
 * Use it for every light-blue / yellow area on the site.
 */
export function GlowSection({
  as: Tag = "section",
  className = "",
  glowClassName = "",
  curveTop = false,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  /** Override size/colour of the circle if a section needs a different glow */
  glowClassName?: string;
  /** Section top edge is the soft arch that opens it (overlaps the previous section by 92 design-px) */
  curveTop?: boolean;
  children: ReactNode;
} & Record<string, unknown>) {
  const root = useRef<HTMLElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const g = glow.current;
    if (!el || !g) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let w = el.clientWidth;
    let h = el.clientHeight;
    const ro = new ResizeObserver(() => {
      w = el.clientWidth;
      h = el.clientHeight;
    });
    ro.observe(el);

    // current + target position (px inside the section)
    let x = w * 0.5;
    let y = h * 0.5;
    let tx = x;
    let ty = y;
    let pointerSeen = false;
    let visible = false;
    let raf = 0;
    const t0 = performance.now();

    const place = () => {
      g.style.transform = `translate3d(${x - g.offsetWidth / 2}px, ${y - g.offsetHeight / 2}px, 0)`;
    };
    place();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      pointerSeen = true;
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };

    const tick = (now: number) => {
      if (!pointerSeen) {
        // idle drift
        const t = (now - t0) / 1000;
        tx = w * (0.5 + 0.28 * Math.sin(t * 0.25));
        ty = h * (0.5 + 0.22 * Math.sin(t * 0.19 + 1.3));
      }
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      place();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible && !raf && !reduced) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const maskStyle = curveTop
    ? {
        WebkitMaskImage: `url("${CURVE_MASK}"), linear-gradient(#000, #000)`,
        maskImage: `url("${CURVE_MASK}"), linear-gradient(#000, #000)`,
        WebkitMaskSize: "100% calc(var(--u) * 92), 100% calc(100% - var(--u) * 92)",
        maskSize: "100% calc(var(--u) * 92), 100% calc(100% - var(--u) * 92)",
        WebkitMaskPosition: "0 0, 0 calc(var(--u) * 92)",
        maskPosition: "0 0, 0 calc(var(--u) * 92)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : undefined;

  return (
    <Tag
      ref={root}
      className={`relative isolate overflow-hidden bg-[#eef8ff] ${curveTop ? "-mt-[calc(var(--u)*92)]" : ""} ${className}`}
      style={maskStyle}
      {...rest}
    >
      <div
        ref={glow}
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 -z-10 size-[min(70vw,calc(var(--u)*640))] rounded-full bg-[#ffd800] opacity-[0.38] blur-[90px] will-change-transform ${glowClassName}`.trim()}
      />
      {curveTop && <div aria-hidden className="h-[calc(var(--u)*92)]" />}
      {children}
    </Tag>
  );
}
