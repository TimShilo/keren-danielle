import { useEffect, useRef, type ImgHTMLAttributes } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * A cut-out portrait that appears like Venetian blinds: horizontal slats open from top to bottom until the
 * whole picture shows. It closes again when it leaves the screen and opens again when it returns.
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
      el.style.setProperty("--o", "1");
      return;
    }
    let cancelled = false;
    let kill: (() => void) | undefined;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        el,
        { "--o": 0, yPercent: 3 },
        { "--o": 1, yPercent: 0, duration: 1.7, delay: delay + 0.1, ease: "power2.inOut" },
      );
      if (when === "mount") {
        tl.play();
        kill = () => tl.kill();
      } else {
        // plays when it comes into view, flies back out when it leaves, plays again on return
        // the trigger is the (static) section around the picture, never the picture itself: its own
        // transform would move the trigger and make the animation flip back and forth
        const st = ScrollTrigger.create({
          trigger: el.parentElement ?? el,
          start: "top 85%",
          end: "bottom 8%",
          onEnter: () => tl.play(),
          onEnterBack: () => tl.play(),
          onLeave: () => tl.reverse(),
          onLeaveBack: () => tl.reverse(),
        });
        kill = () => {
          st.kill();
          tl.kill();
        };
      }
    });
    return () => {
      cancelled = true;
      kill?.();
    };
  }, [when, delay]);

  // slats fully closed from the first paint (so it never flashes in place); the effect opens them
  const slats = 14;
  const mask = "linear-gradient(to bottom, #000 calc(var(--o) * 100%), transparent calc(var(--o) * 100%))";
  return (
    <img
      ref={ref}
      className={className}
      {...img}
      style={{
        ["--o" as string]: 0,
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: `100% calc(100% / ${slats})`,
        maskSize: `100% calc(100% / ${slats})`,
        WebkitMaskRepeat: "repeat-y",
        maskRepeat: "repeat-y",
        ...img.style,
      }}
    />
  );
}
