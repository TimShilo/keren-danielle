// Lazy GSAP loader: keeps GSAP out of the server render and registers ScrollTrigger once.
let cached: Promise<{ gsap: typeof import("gsap").gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger }> | null = null;

export function loadGsap() {
  if (!cached) {
    cached = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      g.gsap.registerPlugin(s.ScrollTrigger);
      // The page keeps changing height after first paint (data arrives, images and fonts load): re-measure every
      // trigger when that happens, otherwise animations further down the page start at the wrong scroll position.
      if (typeof window !== "undefined" && "ResizeObserver" in window) {
        let timer = 0;
        const refresh = () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => s.ScrollTrigger.refresh(), 120);
        };
        new ResizeObserver(refresh).observe(document.documentElement);
        window.addEventListener("load", refresh, { once: true });
      }
      return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
    });
  }
  return cached;
}
