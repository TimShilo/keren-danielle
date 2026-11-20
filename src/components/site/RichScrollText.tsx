import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

const LATIN = /^[A-Za-z0-9@#&+._:/%'"’,\-–—()]+$/;

/** Wraps every word of every text node in a .word-unit (Latin / digit runs get an LTR island). */
function splitWords(root: HTMLElement) {
  const wrap = (node: Text) => {
    const text = node.nodeValue ?? "";
    if (!text.trim()) return;
    const frag = document.createDocumentFragment();
    for (const part of text.match(/\S+|\s+/g) ?? []) {
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }
      const w = document.createElement("span");
      w.className = "word-unit";
      if (LATIN.test(part)) {
        const inner = document.createElement("span");
        inner.className = "ltr-unit";
        inner.textContent = part;
        w.appendChild(inner);
      } else {
        w.textContent = part;
      }
      frag.appendChild(w);
    }
    node.parentNode?.replaceChild(frag, node);
  };
  const walk = (node: Node) => {
    if (node.nodeType === 3) return wrap(node as Text);
    if (node.nodeType !== 1) return;
    const el = node as HTMLElement;
    if (el.matches(".word-unit, .ltr-unit") || ["SCRIPT", "STYLE"].includes(el.tagName)) return;
    Array.from(el.childNodes).forEach(walk);
  };
  walk(root);
}

/**
 * Rich text (HTML from the editor) with the running-text reveal: words fade up one after another
 * as the block scrolls through the screen (scrubbed), same effect as ScrollText.
 */
export function RichScrollText({
  html,
  className = "",
  start = "top 80%",
  end = "bottom 70%",
}: {
  html: string;
  className?: string;
  start?: string;
  end?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.dataset["splitDone"] === html) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    el.innerHTML = html; // always start from the clean markup
    el.dataset["splitDone"] = html;
    splitWords(el);
    const words = el.querySelectorAll(".word-unit");
    if (!words.length) return;
    let cancelled = false;
    let kill: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const tween = gsap.from(words, {
        duration: 1,
        ease: "power1.out",
        opacity: 0.25,
        y: 20,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start, end, scrub: 1 },
      });
      kill = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => {
      cancelled = true;
      kill?.();
      delete el.dataset["splitDone"];
    };
  }, [html, start, end]);

  return <div ref={ref} className={`scroll-text ${className}`.trim()} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
