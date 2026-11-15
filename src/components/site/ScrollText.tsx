import { createElement, useEffect, useMemo, useRef, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * Running text that reveals word by word as the page scrolls
 * (words start faint and slightly low, then settle).
 */
interface Props {
  text: string;
  as?: "p" | "div" | "span";
  className?: string;
  start?: string;
  end?: string;
  /** "scroll" (default): words settle as the page scrolls. "mount": plays once on load (for text already on screen). */
  mode?: "scroll" | "mount";
  delay?: number;
}

const LATIN = /^[A-Za-z0-9@#&+._:/%'"’,\-–—()]+$/;

export function ScrollText({ text, as = "p", className = "", start = "top 80%", end = "bottom 70%", mode = "scroll", delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  const words = useMemo(() => {
    const out: { text: string; ltr: boolean; endsWithLatin: boolean }[] = [];
    let gap = "";
    for (const part of text.match(/\S+|\s+/g) ?? []) {
      if (/^\s+$/.test(part)) {
        gap = part;
        continue;
      }
      const ltr = LATIN.test(part);
      const last = out[out.length - 1];
      if (ltr && last?.ltr && last.endsWithLatin && gap) {
        last.text += gap + part;
        last.endsWithLatin = /[A-Za-z]/.test(part);
      } else {
        out.push({ text: (out.length ? gap : "") + part, ltr, endsWithLatin: ltr && /[A-Za-z]/.test(part) });
      }
      gap = "";
    }
    return out;
  }, [text]);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const units = root.querySelectorAll(".word-unit");
    if (!units.length) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      if (mode === "mount") {
        const t = gsap.from(units, { opacity: 0, y: 20, duration: 0.8, ease: "power2.out", stagger: 0.035, delay });
        cleanup = () => {
          t.kill();
        };
        return;
      }
      const tween = gsap.from(units, {
        duration: 1,
        ease: "power1.out",
        opacity: 0.25,
        y: 20,
        stagger: 0.08,
        scrollTrigger: { trigger: root, start, end, scrub: 1 },
      });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [text, start, end, mode, delay]);

  const children: ReactNode[] = words.map((w, i) => {
    const lead = w.text.match(/^\s+/)?.[0] ?? "";
    const body = w.text.slice(lead.length);
    return (
      <span key={`${i}-${body}`}>
        {lead}
        <span className="word-unit">{w.ltr ? <span className="ltr-unit">{body}</span> : body}</span>
      </span>
    );
  });

  return createElement(as, { ref, className: `scroll-text ${className}`.trim() }, children);
}
