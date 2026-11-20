import { useEffect, useRef, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * Entrance animation for photos that stand on their own (not inside a card):
 * the picture is cut into vertical stripes that rise one after another (from the right, like the reading
 * direction), each settling from a slight zoom; the yellow corner then slides in.
 * Square corners; works with any aspect ratio. Plays once when it scrolls into view.
 */
export function RevealStripes({
  src,
  alt,
  stripes = 8,
  aspect = "4 / 3",
  className = "",
  children,
}: {
  src: string;
  alt: string;
  stripes?: number;
  aspect?: string;
  className?: string;
  /** decorations on top of the photo (e.g. the yellow corner); they fade in after the stripes */
  children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const strips = Array.from(el.querySelectorAll<HTMLElement>("[data-stripe]"));
    const deco = Array.from(el.querySelectorAll<HTMLElement>("[data-deco]"));
    const finalImg = el.querySelector<HTMLElement>("[data-final]");
    const layer = el.querySelector<HTMLElement>("[data-layer]");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let cancelled = false;
    let kill: (() => void) | undefined;

    // hidden until the animation runs (the sr-only img keeps the picture accessible / indexable)
    strips.forEach((s) => {
      s.style.clipPath = "inset(100% 0 0 0)";
      s.style.opacity = "0";
    });
    deco.forEach((d) => (d.style.opacity = "0"));
    if (finalImg) finalImg.style.opacity = "0";

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const tl = gsap.timeline({
        paused: true,
        // swap to the single whole picture at the end: no hairlines between the stripes
        onComplete: () => {
          if (finalImg) finalImg.style.opacity = "1";
          if (layer) layer.style.visibility = "hidden";
        },
      });
      tl.to(strips, {
        clipPath: "inset(0% 0 0 0)",
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.09, from: "end" }, // strips are laid out left→right; "end" = starts from the right
      });
      tl.fromTo(
        strips.map((s) => s.firstElementChild),
        { scale: 1.18, yPercent: 6 },
        { scale: 1, yPercent: 0, duration: 1.2, ease: "power2.out", stagger: { each: 0.09, from: "end" } },
        0,
      );
      if (deco.length) tl.to(deco, { opacity: 1, x: 0, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.1 }, "-=0.5");
      const st = ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => tl.play() });
      kill = () => {
        st.kill();
        tl.kill();
      };
    });
    return () => {
      cancelled = true;
      kill?.();
      strips.forEach((s) => {
        s.style.clipPath = "";
        s.style.opacity = "";
      });
      deco.forEach((d) => (d.style.opacity = ""));
      if (finalImg) finalImg.style.opacity = "";
      if (layer) layer.style.visibility = "";
    };
  }, [src, stripes]);

  return (
    <div ref={root} className={`relative ${className}`}>
      <div className="relative w-full overflow-hidden shadow-[4px_4px_9px_rgba(0,0,0,0.25)]" style={{ aspectRatio: aspect }}>
        <img data-final src={src} alt={alt} loading="lazy" className="absolute inset-0 block size-full object-cover" />
        <div aria-hidden data-layer dir="ltr" className="absolute inset-0 flex">
          {Array.from({ length: stripes }, (_, i) => (
            <div key={i} data-stripe className="relative h-full flex-1 overflow-hidden">
              <img
                src={src}
                alt=""
                loading="lazy"
                draggable={false}
                className="absolute top-0 block h-full max-w-none object-cover"
                style={{ width: `${stripes * 100}%`, left: `${-i * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
