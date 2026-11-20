import { useEffect, useRef } from "react";

/**
 * Looping silent background video.
 *
 * The <video> is written as plain HTML (muted + autoplay as real attributes), so the browser starts playing it
 * the moment it parses the page. With the usual React <video muted> the muted attribute is not sent in the
 * server HTML (React only sets it as a property after hydration), the browser blocks autoplay, and the video
 * only starts seconds later, once all the scripts have loaded.
 */
export function BackgroundVideo({
  src,
  poster,
  className = "",
  opacity = 0.73,
  preload = "auto",
}: {
  src: string;
  poster: string;
  className?: string;
  opacity?: number;
  preload?: "auto" | "metadata";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    const v = box?.querySelector("video");
    if (!box || !v) return;
    const ready = () => box.setAttribute("data-ready", "");
    v.muted = true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    if (!v.paused && v.readyState >= 3) ready();
    v.addEventListener("playing", ready);
    v.play().catch(() => {});
    return () => v.removeEventListener("playing", ready);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`bg-video ${className}`}
      style={{ "--bv-opacity": opacity } as React.CSSProperties}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `<video src="${src}" poster="${poster}" autoplay muted loop playsinline preload="${preload}" disablepictureinpicture onplaying="this.parentNode.setAttribute('data-ready','')"></video>`,
      }}
    />
  );
}
