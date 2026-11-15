import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

/** Number that counts up from 0 the first time it scrolls into view. */
export function CountUp({
  end,
  decimals = 0,
  prefix = "",
  suffix = "",
  grouped = false,
  duration = 2.4,
  className = "",
}: {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  grouped?: boolean;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (v: number) => {
    const n = decimals ? v.toFixed(decimals) : grouped ? Math.round(v).toLocaleString("en-US") : String(Math.round(v));
    return `${prefix}${n}${suffix}`;
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    el.textContent = fmt(0);
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        loadGsap().then(({ gsap }) => {
          if (cancelled) return;
          const o = { v: 0 };
          tween = gsap.to(o, {
            v: end,
            duration,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = fmt(o.v);
            },
            onComplete: () => {
              el.textContent = fmt(end);
            },
          });
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      tween?.kill();
      el.textContent = fmt(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, decimals, prefix, suffix, grouped, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(end)}
    </span>
  );
}
