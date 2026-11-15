import { useEffect, useRef, useState } from "react";
import { FoldHeading } from "./FoldHeading";
import { ScrollText } from "./ScrollText";
import { SiteHeader } from "./SiteHeader";
import { VideoModal } from "./VideoModal";

const FILM_YOUTUBE_ID = "IDX0I_8vipw";

const TITLE_LINES = ["לאהוב.", "לתת.", "להתחבר."];
const INTRO = [
  'קרן דניאלי הינה עמותה שהוקמה בשנת תשע"ה (2015) כדי להנציח את זכרה הבלתי נשכח של דניאלי זוננפלד ע"ה.',
  "מטרת העמותה היא ליזום ולהשתתף במפעלים של עשיה ונתינה, ולהפיץ את האור האכפתיות והאהבה שסמלו את דניאלי",
];

/** Section label: 16px yellow dot + 24px text, sits above every H2. */
export function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-2xl leading-[1.3] ${className}`}>
      <span aria-hidden className="size-4 shrink-0 rounded-full bg-brand-yellow" />
      <span>{children}</span>
    </p>
  );
}

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // autoplay policies require the muted *property*, not just the attribute
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    v.play().catch(() => {});
  }, []);

  // Chain the three title lines so letters keep unfolding one after another.
  let offset = 0.35;
  const lines = TITLE_LINES.map((t) => {
    const d = offset;
    offset += Array.from(t).length * 0.05;
    return { t, d };
  });

  return (
    <section
      aria-label="פתיחה"
      className="relative isolate flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_50%_50%,#f6eec9_28%,#eef8ff_100%)] [--u:calc(100vw/1920)] lg:block lg:h-[calc(var(--u)*1056)]"
    >
      {/* Background: still painting first, the looping (silent) video fades in over it */}
      <img
        src="/images/home/hero-poster.webp"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.73]"
      />
      <video
        ref={videoRef}
        className={`absolute inset-0 -z-10 h-full w-full object-cover opacity-0 transition-opacity duration-1000 ${videoReady ? "!opacity-[0.73]" : ""}`}
        src="/images/home/hero-video.mp4"
        poster="/images/home/hero-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlaying={() => setVideoReady(true)}
      />

      <SiteHeader />

      {/* Portrait */}
      <img
        src="/images/home/danielle-hero.webp"
        alt="דניאלי זוננפלד ע״ה"
        width={873}
        height={822}
        fetchPriority="high"
        className="relative z-10 order-2 mx-auto mt-6 block w-[88%] max-w-[520px] lg:absolute lg:left-[calc(var(--u)*401)] lg:top-[calc(var(--u)*204)] lg:mt-0 lg:w-[calc(var(--u)*873)] lg:max-w-none"
      />

      {/* Text column (right side) */}
      <div className="relative z-20 order-1 px-[5%] pt-28 lg:absolute lg:inset-auto lg:right-[5%] lg:top-[calc(var(--u)*284)] lg:w-[calc(var(--u)*560)] lg:p-0">
        <Eyebrow className="lg:text-[calc(var(--u)*24)]">קרן דניאלי</Eyebrow>
        <h1 className="mt-6 text-[clamp(64px,19vw,112px)] font-extrabold leading-[0.8] lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*128)]">
          {lines.map((l) => (
            <span key={l.t} className="block">
              <FoldHeading text={l.t} trigger="mount" delay={l.d} />
            </span>
          ))}
        </h1>
        <div className="mt-10 max-w-[480px] text-lg leading-[1.3] lg:mt-[calc(var(--u)*31)] lg:w-[calc(var(--u)*477)] lg:max-w-none lg:text-[calc(var(--u)*20)]">
          {INTRO.map((t, i) => (
            <ScrollText key={i} as="p" text={t} mode="mount" delay={1.0 + i * 0.5} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 lg:mt-[calc(var(--u)*23)] lg:gap-[calc(var(--u)*13)]">
          <a
            href="/about"
            className="inline-flex h-[50px] items-center justify-center rounded-full bg-brand-yellow px-8 text-xl font-bold leading-none transition-transform hover:-translate-y-0.5 lg:h-[calc(var(--u)*50)] lg:w-[calc(var(--u)*179)] lg:px-0 lg:text-[calc(var(--u)*20)]"
          >
            אודות הקרן ←
          </a>
          <a
            href="/danielle"
            className="inline-flex h-[50px] items-center justify-center rounded-full border-2 border-navy px-8 text-xl font-bold leading-none transition-colors hover:bg-navy hover:text-white lg:h-[calc(var(--u)*50)] lg:w-[calc(var(--u)*222)] lg:px-0 lg:text-[calc(var(--u)*20)]"
          >
            הסיפור של דניאלי ←
          </a>
        </div>
      </div>

      {/* Black bird */}
      <img
        src="/images/home/black-bird.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute z-20 hidden lg:block lg:left-[calc(var(--u)*1262)] lg:top-[calc(var(--u)*470)] lg:w-[calc(var(--u)*102)]"
      />

      {/* Navy corner with the film button */}
      <div className="absolute bottom-0 left-0 z-20 hidden lg:block lg:top-[calc(var(--u)*598)] lg:w-[calc(var(--u)*444)]">
        <img src="/images/home/hero-corner.svg" alt="" aria-hidden className="block h-auto w-full" />
        <button
          type="button"
          onClick={() => setFilmOpen(true)}
          className="absolute top-[38.6%] flex w-[calc(var(--u)*100)] flex-col items-center gap-[calc(var(--u)*24)] text-white"
          style={{ left: "29.28%" }}
          aria-label="לסרט על דניאלי"
        >
          <img src="/images/home/svg/play.svg" alt="" className="size-[calc(var(--u)*64)]" />
          <span className="whitespace-nowrap text-[calc(var(--u)*16)] leading-[1.3]">לסרט על דניאלי</span>
        </button>
      </div>

      {/* Navy wave that opens the next section */}
      <svg
        aria-hidden
        viewBox="0 0 1920 100"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 z-20 hidden w-full lg:block lg:h-[calc(var(--u)*100)]"
      >
        <path d="M0 0C599.5 96.5 1358.74 77.1 1920 14.5V100H0Z" fill="#072845" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 z-20 h-10 bg-navy lg:hidden" />
      <button
        type="button"
        onClick={() => setFilmOpen(true)}
        className="absolute bottom-14 start-4 z-30 flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm text-white lg:hidden"
      >
        <img src="/images/home/svg/play.svg" alt="" className="size-6" />
        לסרט על דניאלי
      </button>
      <VideoModal youtubeId={FILM_YOUTUBE_ID} title="סרט על דניאלי" open={filmOpen} onOpenChange={setFilmOpen} />
    </section>
  );
}
