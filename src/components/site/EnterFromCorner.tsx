import { useEffect, useRef, type ImgHTMLAttributes } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * A cut-out portrait that glides in from the bottom-left corner of its area to its place
 * (with a soft fade and a tiny scale), instead of just sitting there. It flies back out when it leaves the
 * screen and flies in again when it returns.
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
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        el,
        { xPercent: -20, yPercent: 24, opacity: 0, scale: 0.96 },
        { xPercent: 0, yPercent: 0, opacity: 1, scale: 1, duration: 2, delay: delay + 0.1, ease: "power2.out" },
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

  // hidden from the first paint (so it never flashes in place before it flies in); the effect reveals it
  return <img ref={ref} className={className} {...img} style={{ opacity: 0, ...img.style }} />;
}
