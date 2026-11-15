// Lazy GSAP loader: keeps GSAP out of the server render and registers ScrollTrigger once.
let cached: Promise<{ gsap: typeof import("gsap").gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger }> | null = null;

export function loadGsap() {
  if (!cached) {
    cached = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      g.gsap.registerPlugin(s.ScrollTrigger);
      return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
    });
  }
  return cached;
}
