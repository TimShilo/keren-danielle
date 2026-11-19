import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEMO_SENTENCES, useHomeSentences } from "@/lib/home-feed";
import { FxIconButton } from "./FxButton";
import { ParallaxDecor } from "./ParallaxDecor";

const INTERVAL = 7000;

/** Danielle's own lines, rotating over the landscape video. */
export function QuoteCarousel() {
  const q = useHomeSentences();
  const sentences = q.data && q.data.length ? q.data : DEMO_SENTENCES;
  const [i, setI] = useState(0);
  const paused = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const n = sentences.length;

  useEffect(() => {
    const t = window.setInterval(() => {
      if (!paused.current) setI((x) => (x + 1) % n);
    }, INTERVAL);
    return () => window.clearInterval(t);
  }, [n]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {});
  }, []);

  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <section
      aria-label="משפטים של דניאלי"
      className="relative isolate overflow-hidden bg-[#eef8ff] lg:h-[calc(var(--u)*580)]"
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
    >
      {/* same looping (silent) video as the hero, softly faded in at the top */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
      >
        <img src="/images/home/hero-poster.webp" alt="" loading="lazy" className="size-full object-cover opacity-[0.73]" />
        <video
          ref={videoRef}
          className={`absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-1000 ${videoReady ? "!opacity-[0.73]" : ""}`}
          src="/images/home/hero-video.mp4"
          poster="/images/home/hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={() => setVideoReady(true)}
        />
      </div>

      {/* decor */}
      <ParallaxDecor
        src="/images/home/svg/heart-shape.svg"
        depth={-1}
        phase={3}
        className="absolute hidden lg:block lg:left-[calc(var(--u)*74)] lg:top-[calc(var(--u)*30)] lg:w-[calc(var(--u)*254)]"
      />
      <ParallaxDecor
        src="/images/home/svg/birds-flock.svg"
        depth={1.4}
        phase={1}
        className="absolute hidden lg:block lg:left-[calc(var(--u)*284)] lg:top-[calc(var(--u)*117)] lg:w-[calc(var(--u)*163)]"
      />

      {/* portrait, glued to the bottom edge */}
      <img
        src="/images/home/danielle-stand.webp"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute bottom-0 right-0 hidden w-[calc(var(--u)*300)] lg:block lg:right-[calc(var(--u)*51)]"
      />

      {/* sentences */}
      <div className="relative z-10 mx-auto flex min-h-[420px] max-w-[min(100%,calc(var(--u)*1560))] flex-col items-center justify-center px-[5%] py-[100px] text-center lg:min-h-0 lg:px-0 lg:py-0 lg:pt-[calc(var(--u)*60)]">
        <img src="/images/home/svg/quote-mark.svg" alt="" aria-hidden className="mb-4 w-8 lg:mb-[calc(var(--u)*24)] lg:w-[calc(var(--u)*40)]" />
        <div className="grid w-full" aria-live="polite">
          {sentences.map((s, idx) => (
            <figure
              key={s.id}
              aria-hidden={idx !== i}
              className={`col-start-1 row-start-1 transition-[opacity,transform] duration-[900ms] ease-out ${
                idx === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
              }`}
            >
              <blockquote className="text-[clamp(20px,5vw,34px)] font-bold leading-[1.25] text-navy lg:text-[calc(var(--u)*38)]">
                {s.lines.map((l, k) => (
                  <span key={k} className="block">
                    {l}
                  </span>
                ))}
              </blockquote>
              {s.attribution && (
                <figcaption className="mt-5 text-lg text-navy lg:mt-[calc(var(--u)*28)] lg:text-[calc(var(--u)*24)]">
                  {s.attribution}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 lg:mt-[calc(var(--u)*30)]">
          <FxIconButton variant="white" aria-label="המשפט הקודם" onClick={() => go(-1)} className="size-10 text-navy shadow-md lg:size-[calc(var(--u)*48)]">
            <ArrowRight className="size-4 lg:size-[calc(var(--u)*20)]" />
          </FxIconButton>
          <div className="flex items-center gap-2" role="tablist" aria-label="בחירת משפט">
            {sentences.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-label={`משפט ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === i ? "w-6 bg-navy" : "w-2 bg-navy/30 hover:bg-navy/60"}`}
              />
            ))}
          </div>
          <FxIconButton variant="white" aria-label="המשפט הבא" onClick={() => go(1)} className="size-10 text-navy shadow-md lg:size-[calc(var(--u)*48)]">
            <ArrowLeft className="size-4 lg:size-[calc(var(--u)*20)]" />
          </FxIconButton>
        </div>
      </div>
    </section>
  );
}
