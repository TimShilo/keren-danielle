import { useEffect, useRef, type ImgHTMLAttributes } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * A cut-out portrait that glides in from the bottom-left corner of its area to its place
 * (with a soft fade and a tiny scale), instead of just sitting there. Plays once.
 * `when="mount"` for things at the top of the page, "scroll" for everything below.
 */
export function EnterFromCorner({
  when = "scroll",
  delay = 0,
  className = "",
  ...img
}: { when?: "mount" | "scroll"; delay?: number } & ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "";
      return;
    }
    let cancelled = false;
    let kill: (() => void) | undefined;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const play = () =>
        gsap.fromTo(
          el,
          { xPercent: -28, yPercent: 32, opacity: 0, scale: 0.94 },
          { xPercent: 0, yPercent: 0, opacity: 1, scale: 1, duration: 1.3, delay, ease: "power3.out", clearProps: "transform,opacity" },
        );
      if (when === "mount") {
        const t = play();
        kill = () => t.kill();
      } else {
        const st = ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => void play() });
        kill = () => st.kill();
      }
    });
    return () => {
      cancelled = true;
      kill?.();
    };
  }, [when, delay]);

  // hidden from the first paint (so it never flashes in place before it flies in); the effect reveals it
  return <img ref={ref} className={className} {...img} style={{ opacity: 0, ...img.style }} />;
}
