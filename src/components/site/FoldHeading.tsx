import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * Headline reveal: every letter "unfolds" from the top like a sheet of paper.
 * Trigger "scroll" plays once when the heading enters the viewport; "mount" plays on load.
 */
interface Props {
  text: string;
  trigger?: "scroll" | "mount";
  /** Seconds to wait before this piece starts (used to chain several lines). */
  delay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

const FOLD_ANGLE = 92;
const CREASE = 0.55;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function FoldHeading({
  text,
  trigger = "scroll",
  delay = 0,
  stagger = 0.05,
  duration = 0.8,
  className = "",
  style,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  const words = useMemo(
    () =>
      text.split(/(\s+)/).flatMap((w, wi) => {
        if (!w || /^\s+$/.test(w)) return [];
        const chars = w.match(/[A-Za-z0-9]+(?:[.,:'’][A-Za-z0-9]+)*|\p{L}\p{M}*|[\s\S]/gu) ?? [];
        return [{ key: `${wi}-${w}`, chars }];
      }),
    [text],
  );

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const pieces = Array.from(root.querySelectorAll<HTMLElement>(".fold-text-piece"));
    if (!pieces.length) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const easeOut = gsap.parseEase(reduced ? "power1.out" : "power3.out");
      const angle = reduced ? 0 : FOLD_ANGLE;
      const crease = reduced ? 0 : CREASE;
      const dur = reduced ? Math.min(duration, 0.22) : duration;
      const state = pieces.map((el) => ({ el, t: 0 }));

      const render = () => {
        state.forEach((s) => {
          const n = easeOut(s.t);
          s.el.style.transform = `rotateX(${-1 * (1 - n) * angle}deg)`;
          s.el.style.opacity = String(clamp(n, 0, 1));
          s.el.style.setProperty("--fold-crease", String(crease * clamp(1 - n, 0, 1)));
        });
      };

      let tl: gsap.core.Timeline | null = null;
      const play = () => {
        tl?.kill();
        tl = gsap.timeline({ onUpdate: render, delay });
        tl.fromTo(
          state,
          { t: 0 },
          { t: 1, duration: dur, ease: "none", stagger: { each: reduced ? Math.min(stagger, 0.02) : stagger, from: "start" } },
        );
      };

      render();
      let st: ScrollTrigger | null = null;
      if (trigger === "scroll") {
        st = ScrollTrigger.create({ trigger: root, start: "top 82%", once: true, onEnter: play });
      } else {
        play();
      }
      cleanup = () => {
        st?.kill();
        tl?.kill();
        gsap.killTweensOf(state);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [text, trigger, delay, stagger, duration]);

  return (
    <span ref={ref} className={`fold-text ${className}`.trim()} style={style}>
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {words.map((w, i) => (
          <span key={w.key}>
            {i > 0 && " "}
            <span className="fold-text-word">
              {w.chars.map((c, ci) => (
                <span key={ci} className="fold-text-segment">
                  <span className="fold-text-piece" data-fold-text={c} style={{ opacity: 0 }}>
                    {c}
                  </span>
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
