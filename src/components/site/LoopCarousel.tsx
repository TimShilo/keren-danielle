import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsap";
import { FxIconButton } from "./FxButton";

/**
 * Endless carousel: drifts slowly in one direction (set per section so neighbouring carousels
 * move opposite ways), stops while the pointer is over it, and has two arrows to step manually.
 *
 * `direction` is the physical direction on screen: "right" or "left".
 */
interface Props {
  items: ReactNode[];
  direction: "right" | "left";
  /** px per second */
  speed?: number;
  label: string;
  /** Tailwind classes for each item's width + the gap (applied on every item) */
  itemClassName?: string;
}

const COPIES = 4;

export function LoopCarousel({ items, direction, speed = 36, label, itemClassName = "" }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const st = useRef({ x: 0, loop: 1, step: 300, paused: false, visible: false, tween: null as null | { kill: () => void } });

  const wrap = useCallback(() => {
    const s = st.current;
    if (s.loop <= 1) return;
    // keep x inside [-loop, 0] (copies are identical, so the jump is invisible)
    while (s.x > 0) s.x -= s.loop;
    while (s.x < -s.loop) s.x += s.loop;
  }, []);

  const apply = useCallback(() => {
    const t = track.current;
    if (t) t.style.transform = `translate3d(${st.current.x}px,0,0)`;
  }, []);

  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    const kids = Array.from(t.children) as HTMLElement[];
    const per = items.length;
    if (kids.length < per + 1) return;
    const first = kids[0]!;
    const next = kids[per]!;
    // one copy = distance between item 0 and item 0 of the next copy (so the gap is included, RTL-safe)
    const loop = Math.abs(next.offsetLeft - first.offsetLeft);
    const step = Math.abs((kids[1]?.offsetLeft ?? 0) - first.offsetLeft) || 300;
    st.current.loop = loop || 1;
    st.current.step = step;
    if (!st.current.x) st.current.x = -loop / 2;
    wrap();
    apply();
  }, [items.length, wrap, apply]);

  useEffect(() => {
    const v = viewport.current;
    if (!v) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dir = direction === "right" ? 1 : -1;
    const s = st.current;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(v);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!s.paused && !s.tween) {
        s.x += dir * speed * dt;
        wrap();
        apply();
      }
      raf = s.visible ? requestAnimationFrame(frame) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      s.visible = !!e?.isIntersecting;
      if (s.visible && !raf && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(v);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      s.tween?.kill();
    };
  }, [direction, speed, measure, wrap, apply]);

  const nudge = async (dx: number) => {
    const s = st.current;
    const { gsap } = await loadGsap();
    s.tween?.kill();
    const target = s.x + dx;
    s.tween = gsap.to(s, {
      x: target,
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => {
        wrap();
        apply();
      },
      onComplete: () => {
        s.tween = null;
      },
    });
  };

  // LTR track, items reversed: the first item sits on the right, as in a right-to-left page
  const ordered = [...items].reverse();
  const all = Array.from({ length: COPIES }, (_, c) => ordered.map((it, i) => ({ key: `${c}-${i}`, it, dup: c > 0 })));

  return (
    <div
      role="region"
      aria-roledescription="קרוסלה"
      aria-label={label}
      className="group/carousel relative"
      onPointerEnter={() => {
        st.current.paused = true;
      }}
      onPointerLeave={() => {
        st.current.paused = false;
      }}
      onFocusCapture={() => {
        st.current.paused = true;
      }}
      onBlurCapture={() => {
        st.current.paused = false;
      }}
    >
      <div ref={viewport} className="overflow-hidden py-6" dir="ltr">
        {/* dir=ltr: the track is positioned with physical x; each card keeps its own RTL text */}
        <ul ref={track} className="flex w-max will-change-transform">
          {all.flat().map(({ key, it, dup }) => (
            <li key={key} dir="rtl" aria-hidden={dup || undefined} className={`shrink-0 ${itemClassName}`}>
              {it}
            </li>
          ))}
        </ul>
      </div>

      {/* arrows */}
      <FxIconButton
        variant="white"
        aria-label="הקודם"
        onClick={() => void nudge(st.current.step)}
        className="absolute right-[2.5%] top-1/2 z-10 size-12 text-navy -translate-y-1/2 shadow-lg lg:size-[calc(var(--u)*64)]"
      >
        <ArrowRight className="size-5 lg:size-[calc(var(--u)*26)]" />
      </FxIconButton>
      <FxIconButton
        variant="white"
        aria-label="הבא"
        onClick={() => void nudge(-st.current.step)}
        className="absolute left-[2.5%] top-1/2 z-10 size-12 text-navy -translate-y-1/2 shadow-lg lg:size-[calc(var(--u)*64)]"
      >
        <ArrowLeft className="size-5 lg:size-[calc(var(--u)*26)]" />
      </FxIconButton>
    </div>
  );
}
