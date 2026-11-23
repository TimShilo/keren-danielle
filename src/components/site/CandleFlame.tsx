import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * A memorial candle whose flame moves like a real one: small random sways, flickers and the
 * occasional bigger lick, never strong. The flame is a separate layer on top of the candle.
 */
export function CandleFlame({ className = "" }: { className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const flame = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = flame.current;
    const box = root.current;
    if (!el || !box || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let dead = false;
    let on = false;
    let io: IntersectionObserver | undefined;
    let gsapRef: Awaited<ReturnType<typeof loadGsap>>["gsap"] | undefined;

    const tick = () => {
      if (dead || !on || !gsapRef) return;
      const g = gsapRef;
      const lick = Math.random() < 0.16; // now and then a slightly bigger movement
      g.to(el, {
        rotation: g.utils.random(lick ? -6 : -3.2, lick ? 6 : 3.2),
        xPercent: g.utils.random(-2.6, 2.6),
        yPercent: g.utils.random(-1.4, 0.6),
        scaleY: g.utils.random(0.95, 1.06),
        scaleX: g.utils.random(0.96, 1.05),
        duration: g.utils.random(0.12, lick ? 0.6 : 0.34),
        ease: "sine.inOut",
        transformOrigin: "53% 41%",
        onComplete: tick,
      });
    };

    loadGsap().then(({ gsap }) => {
      if (dead) return;
      gsapRef = gsap;
      io = new IntersectionObserver(([e]) => {
        const vis = !!e?.isIntersecting;
        if (vis && !on) {
          on = true;
          tick();
        } else if (!vis && on) {
          on = false;
          gsap.killTweensOf(el);
        }
      });
      io.observe(box);
    });
    return () => {
      dead = true;
      io?.disconnect();
      gsapRef?.killTweensOf(el);
    };
  }, []);

  return (
    <span ref={root} aria-hidden className={`relative block aspect-[746/1316] shrink-0 ${className}`}>
      <img src="/images/pages/candle-body.webp" alt="" loading="lazy" className="absolute inset-0 size-full" />
      <img ref={flame} src="/images/pages/candle-flame.webp" alt="" loading="lazy" className="absolute inset-0 size-full will-change-transform" />
    </span>
  );
}
