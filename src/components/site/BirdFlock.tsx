import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * Three birds that enter from the left edge of the screen, flapping, and rise slowly
 * to their resting spot, where they settle and stay still.
 * Positions are in "design pixels" (1920 wide) relative to the section top.
 */
const BIRDS = [
  { src: "/images/home/svg/bird-blue.svg", left: 1640, top: 95, w: 103, delay: 0, dur: 10, flap: 0.34, origin: "24% 96%" },
  { src: "/images/home/svg/bird-yellow.svg", left: 1711, top: 102, w: 92, delay: 0.7, dur: 10.6, flap: 0.38, origin: "24% 96%" },
  { src: "/images/home/svg/bird-navy.svg", left: 1738, top: 81, w: 45, delay: 1.3, dur: 11.2, flap: 0.3, origin: "24% 96%" },
];

export function BirdFlock() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let cancelled = false;
    let ctx: { revert: () => void } | null = null;
    let started = false;

    const start = async () => {
      const { gsap } = await loadGsap();
      if (cancelled) return;
      const unit = window.innerWidth / 1920;
      ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>("[data-bird]").forEach((bird, i) => {
          const b = BIRDS[i]!;
          const img = bird.querySelector("img")!;
          const fromX = -(b.left * unit + b.w * unit + 40); // just outside the left edge
          const fromY = 340 * unit;
          gsap.set(bird, { x: fromX, y: fromY, opacity: 1 });

          // wings
          const flap = gsap.to(img, {
            scaleY: 0.55,
            rotation: -9,
            transformOrigin: b.origin,
            duration: b.flap,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });

          // flight: glides across and climbs
          const tl = gsap.timeline({ delay: b.delay });
          tl.to(bird, { x: 0, duration: b.dur, ease: "sine.out" }, 0);
          tl.to(bird, { y: 0, duration: b.dur, ease: "power2.out" }, 0);
          tl.to(flap, { timeScale: 0.4, duration: 2.5, ease: "none" }, b.dur - 2.5);
          // landed: wings settle and the bird stays put
          tl.add(() => {
            flap.kill();
            gsap.to(img, { scaleY: 1, rotation: 0, duration: 0.6, ease: "sine.out" });
          }, b.dur);
        });
      }, el);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          started = true;
          io.disconnect();
          void start();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[calc(var(--u)*92)] z-0 hidden lg:block">
      {BIRDS.map((b) => (
        <div
          key={b.src}
          data-bird
          className="absolute opacity-0"
          style={{
            left: `calc(var(--u) * ${b.left})`,
            top: `calc(var(--u) * ${b.top})`,
            width: `calc(var(--u) * ${b.w})`,
          }}
        >
          <img src={b.src} alt="" className="block w-full will-change-transform" />
        </div>
      ))}
    </div>
  );
}
