import { ArrowLeft, GraduationCap, Hospital, ScrollText, User, Users } from "lucide-react";
import { useState } from "react";
import {
  DEMO_NEWS,
  DEMO_PRESS,
  useHomeNews,
  useHomePress,
  useHomeVideos,
  type NewsCardData,
  type PressCardData,
  type VideoCardData,
} from "@/lib/home-feed";
import { FoldHeading } from "./FoldHeading";
import { FxButton } from "./FxButton";
import { Eyebrow } from "./HomeHero";
import { LoopCarousel } from "./LoopCarousel";
import { ParallaxDecor } from "./ParallaxDecor";
import { VideoModal } from "./VideoModal";

/** 414 design-px card + 18 design-px gap (split as padding so the loop maths includes the gap) */
const ITEM = "w-[clamp(300px,calc(var(--u)*432),590px)] px-[clamp(8px,calc(var(--u)*9),14px)]";
const CARD_SHADOW = "shadow-[4px_4px_9px_rgba(0,0,0,0.25)]";

/** "לפרטים": round arrow; on card hover a yellow disc grows inside it and the arrow turns white */
function MoreArrow({ className = "" }: { className?: string }) {
  return (
    <span className={`flex ${className}`}>
      <span
        aria-hidden
        className="relative grid size-8 place-items-center overflow-hidden rounded-full border-2 border-navy text-navy transition-colors duration-500 group-hover/card:border-brand-yellow group-focus-visible/card:border-brand-yellow"
      >
        <span className="absolute inset-0 scale-0 rounded-full bg-brand-yellow transition-transform duration-500 ease-out group-hover/card:scale-100 group-focus-visible/card:scale-100" />
        <ArrowLeft className="relative size-4" />
      </span>
      <span className="sr-only">לפרטים</span>
    </span>
  );
}

const CHIP = {
  education: { Icon: GraduationCap, color: "#F37021" },
  health: { Icon: Hospital, color: "#8AC640" },
  tradition: { Icon: ScrollText, color: "#E2B600" },
  welfare: { Icon: Users, color: "#C41D24" },
} as const;

export function NewsCard({ n }: { n: NewsCardData }) {
  const { Icon, color } = CHIP[n.icon];
  return (
    <a href={n.href} className={`group/card flex h-full w-full flex-col overflow-hidden rounded-[25px] bg-white text-navy ${CARD_SHADOW}`}>
      {n.image ? (
        <img src={n.image} alt="" loading="lazy" className="aspect-[414/267] w-full object-cover" />
      ) : (
        <span aria-hidden className="grid aspect-[414/267] w-full place-items-center bg-[#eef8ff]">
          <Icon className="size-14" style={{ color }} />
        </span>
      )}
      <div className="flex flex-1 flex-col px-6 pb-4 pt-6">
        <p className="flex items-center gap-2 text-lg leading-[1.3] text-[#1d2838]">
          <Icon className="size-5" style={{ color }} aria-hidden />
          {n.category}
        </p>
        <h3 className="mt-2 line-clamp-2 text-[22px] font-bold leading-[1] text-[#1d2838]">{n.title}</h3>
        <p className="mt-5 line-clamp-3 text-[18px] font-normal leading-[1.2] text-[#1d2838]">{n.excerpt}</p>
        <MoreArrow className="mt-auto pt-2" />
      </div>
    </a>
  );
}

export function VideoCard({ v, onOpen }: { v: VideoCardData; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="group block w-full text-start" aria-label={`נגן: ${v.title}`}>
      <span className="relative block aspect-[414/267] overflow-hidden rounded-[27px] bg-navy">
        <img
          src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <img
          src="/images/home/svg/play.svg"
          alt=""
          className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110 lg:size-[calc(var(--u)*64)]"
        />
      </span>
      <span className="mt-5 line-clamp-3 block px-2 text-center text-[24px] font-normal leading-[1] text-[var(--card-ink,#1d2838)]">{v.title}</span>
    </button>
  );
}

function PressCard({ p }: { p: PressCardData }) {
  return (
    <a
      href={p.href}
      {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group/card flex h-full w-full flex-col overflow-hidden rounded-[25px] bg-white text-navy ${CARD_SHADOW}`}
    >
      <span className="relative block aspect-[414/267] shrink-0 border-b-2 border-black/40 bg-white">
        <img src={p.image} alt="" loading="lazy" className="absolute inset-0 size-full object-contain p-[14%]" />
      </span>
      <span className="flex flex-1 flex-col p-6">
        <span className="line-clamp-2 text-[24px] font-bold leading-[1.3] text-[#1d2838]">{p.title}</span>
        <span className="mt-auto flex items-center gap-2 pt-4 text-lg text-navy">
          <User className="size-4 fill-brand-blue text-brand-blue" aria-hidden />
          {p.source}
        </span>
        <MoreArrow className="pt-4" />
      </span>
    </a>
  );
}

/** Dark "lens" with the latest news, drifting to the right. */
export function NewsLens() {
  const q = useHomeNews();
  const news = q.data && q.data.length ? q.data : DEMO_NEWS;
  return (
    <section aria-label="חדשות ועדכונים" className="relative mt-[100px]">
      <img
        src="/images/home/svg/news-lens.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 size-full"
      />
      <ParallaxDecor
        src="/images/home/svg/hearts-birds.svg"
        depth={-1.2}
        phase={1}
        className="absolute hidden lg:block lg:left-[calc(var(--u)*100)] lg:top-[calc(var(--u)*110)] lg:w-[calc(var(--u)*242)]"
      />
      <div className="px-[5%] pb-20 pt-28 text-center text-white lg:pb-[calc(var(--u)*121)] lg:pt-[calc(var(--u)*162)]">
        <Eyebrow className="justify-center">מה חדש?</Eyebrow>
        <h2 className="mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]">
          <FoldHeading text="חדשות ועדכונים" />
        </h2>
      </div>
      <div className="-mt-10 lg:-mt-[calc(var(--u)*34)]">
        <LoopCarousel
          label="חדשות ועדכונים"
          direction="right"
          items={news.map((n) => (
            <div key={n.id} className="h-full w-full">
              <NewsCard n={n} />
            </div>
          ))}
          itemClassName={`${ITEM} flex`}
        />
      </div>
      <p className="flex justify-center pb-24 pt-6 text-center lg:pb-[calc(var(--u)*130)] lg:pt-[calc(var(--u)*54)]">
        <FxButton href="/news" variant="yellow" className="h-[50px] text-xl lg:h-[calc(var(--u)*50)] lg:text-[calc(var(--u)*20)] [&_.fx-label]:leading-none lg:[&_.fx-label]:px-[calc(var(--u)*34)]">
          לכל החדשות והעדכונים ←
        </FxButton>
      </p>
    </section>
  );
}

/** Looping video thumbnails (the videos flagged "show on home page"), drifting to the left. */
export function VideoLoop() {
  const q = useHomeVideos();
  const [open, setOpen] = useState<VideoCardData | null>(null);
  const videos = q.data ?? [];
  if (!videos.length) return null;
  return (
    <section aria-label="סרטונים" className="relative mt-[100px]">
      <LoopCarousel
        label="סרטונים"
        direction="left"
        speed={30}
        items={videos.map((v) => (
          <VideoCard key={v.id} v={v} onOpen={() => setOpen(v)} />
        ))}
        itemClassName={ITEM}
      />
      <VideoModal
        youtubeId={open?.youtubeId ?? ""}
        title={open?.title ?? ""}
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
      />
    </section>
  );
}

/** "כתבו עלינו": press cards, drifting to the right. */
export function PressLoop() {
  const q = useHomePress();
  const press = q.data && q.data.length ? q.data : DEMO_PRESS;
  return (
    <section aria-label="כתבו עלינו" className="relative mt-[100px]">
      <div className="px-[5%] text-center">
        <Eyebrow className="justify-center">בתקשורת</Eyebrow>
        <h2 className="mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]">
          <FoldHeading text="כתבו עלינו" />
        </h2>
      </div>
      <div className="mt-4 lg:mt-[calc(var(--u)*30)]">
        <LoopCarousel
          label="כתבו עלינו"
          direction="right"
          speed={34}
          items={press.map((p) => (
            <div key={p.id} className="h-full w-full">
              <PressCard p={p} />
            </div>
          ))}
          itemClassName={`${ITEM} flex`}
        />
      </div>
      <p className="flex justify-center pt-6 text-center">
        <FxButton href="/press" variant="yellow" className="h-[50px] text-xl lg:h-[calc(var(--u)*50)] lg:text-[calc(var(--u)*20)] [&_.fx-label]:leading-none lg:[&_.fx-label]:px-[calc(var(--u)*34)]">
          לכל הכתבות ←
        </FxButton>
      </p>
    </section>
  );
}
