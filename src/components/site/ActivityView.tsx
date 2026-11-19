import { useState } from "react";
import {
  activityHref,
  type GalleryItem,
  type MainActivityPage,
  type SubActivityPage,
  type TeamMember,
} from "@/lib/activities";
import type { VideoCardData } from "@/lib/home-feed";
import { Band } from "./Band";
import { ActivityPanels } from "./ActivityPanels";
import { MAIN_ICONS, SUB_PHOTOS } from "./CategoryCard";
import { FoldHeading } from "./FoldHeading";
import { FxButton } from "./FxButton";
import { GlowSection } from "./GlowSection";
import { NewsCard, VideoCard } from "./HomeFeedSections";
import { PageHero } from "./PageHero";
import { Eyebrow } from "./HomeHero";
import { LoopCarousel } from "./LoopCarousel";
import { ScrollText } from "./ScrollText";
import { VideoModal } from "./VideoModal";

const ITEM = "w-[clamp(300px,calc(var(--u)*432),590px)] px-[clamp(8px,calc(var(--u)*9),14px)]";
const CARD = "shadow-[4px_4px_9px_rgba(0,0,0,0.25)]";
const H2 = "mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]";
const PAD = "px-[5%] pb-[100px] pt-[calc(var(--u)*30)]";

function SectionHead({ eyebrow, title, center = true }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <Eyebrow className={center ? "justify-center" : ""}>{eyebrow}</Eyebrow>
      <h2 className={H2}>
        <FoldHeading text={title} />
      </h2>
    </div>
  );
}

function GalleryCard({ g }: { g: GalleryItem }) {
  return (
    <div className={`flex h-full w-full flex-col overflow-hidden rounded-[25px] bg-white text-navy ${CARD}`}>
      <img src={g.image} alt={g.title} loading="lazy" className="aspect-[414/290] w-full object-cover" />
      {(g.title || g.caption) && (
        <div className="p-6">
          {g.title && <h3 className="line-clamp-2 text-[24px] font-bold leading-[1.3] text-[#1d2838]">{g.title}</h3>}
          {g.caption && <p className="mt-1 line-clamp-3 text-[18px] leading-[1.4] text-[#1d2838]">{g.caption}</p>}
        </div>
      )}
    </div>
  );
}

function TeamCard({ m }: { m: TeamMember }) {
  return (
    <li className={`flex flex-col items-center rounded-[25px] bg-white p-6 text-center text-navy ${CARD}`}>
      {m.image ? (
        <img src={m.image} alt="" loading="lazy" className="size-32 rounded-full object-cover" />
      ) : (
        <span aria-hidden className="grid size-32 place-items-center rounded-full bg-brand-yellow text-5xl font-bold">
          {m.name.slice(0, 1)}
        </span>
      )}
      <h3 className="mt-4 text-[24px] font-bold leading-[1.3]">{m.name}</h3>
      {m.role && <p className="text-[18px] leading-[1.4] text-[#1d2838]">{m.role}</p>}
    </li>
  );
}

type SectionKey = "gallery" | "video" | "team" | "news";

export function SubActivityView({ page }: { page: SubActivityPage }) {
  const [open, setOpen] = useState<VideoCardData | null>(null);
  const crumbs = [
    { label: "בית", href: "/" },
    { label: "פעילויות", href: "/activities" },
    ...(page.main ? [{ label: page.main.name, href: page.main.href }] : []),
    { label: page.title },
  ];

  const title = page.sectionTitle || page.handwritingTitle ? `${page.sectionTitle} ${page.handwritingTitle}`.trim() : page.title;

  // present sections, in order; tones alternate glow / white so two equal areas never touch
  const order: SectionKey[] = [];
  if (page.layout.gallery && page.gallery.length) order.push("gallery");
  if (page.layout.video && page.videos.length) order.push("video");
  if (page.layout.team && page.team.length) order.push("team");
  if (page.layout.posts && page.news.length) order.push("news");

  const render: Record<SectionKey, () => React.ReactNode> = {
    gallery: () => (
      <>
        <SectionHead eyebrow="גלריה" title="תמונות" />
        <div className="mt-6 lg:mt-[calc(var(--u)*30)]">
          <LoopCarousel
            label="גלריית תמונות"
            direction="right"
            items={page.gallery.map((g) => (
              <div key={g.id} className="h-full w-full">
                <GalleryCard g={g} />
              </div>
            ))}
            itemClassName={`${ITEM} flex`}
          />
        </div>
      </>
    ),
    video: () => (
      <>
        <SectionHead eyebrow="וידאו" title="סרטונים" />
        <div className="mt-6 lg:mt-[calc(var(--u)*30)]">
          <LoopCarousel
            label="סרטונים"
            direction="left"
            speed={30}
            items={page.videos.map((v) => (
              <VideoCard key={v.id} v={v} onOpen={() => setOpen(v)} />
            ))}
            itemClassName={ITEM}
          />
        </div>
      </>
    ),
    team: () => (
      <>
        <SectionHead eyebrow="הצוות" title="הצוות שלנו" />
        <ul className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-[5%] sm:grid-cols-2 lg:grid-cols-4">
          {page.team.map((m) => (
            <TeamCard key={m.id} m={m} />
          ))}
        </ul>
      </>
    ),
    news: () => (
      <>
        <SectionHead eyebrow="מה חדש?" title="חדשות ועדכונים" />
        <ul className="mx-auto mt-10 grid max-w-[1500px] grid-cols-1 gap-6 px-[5%] sm:grid-cols-2 lg:mt-[calc(var(--u)*50)] lg:grid-cols-3">
          {page.news.slice(0, 3).map((n) => (
            <li key={n.id} className="flex">
              <NewsCard n={n} />
            </li>
          ))}
        </ul>
        <p className="mt-10 flex justify-center text-center">
          <FxButton href={page.newsHref} variant="yellow" className="h-[50px] text-xl lg:h-[calc(var(--u)*50)] lg:text-[calc(var(--u)*20)] [&_.fx-label]:leading-none lg:[&_.fx-label]:px-[calc(var(--u)*34)]">
            לכל החדשות והעדכונים ←
          </FxButton>
        </p>
      </>
    ),
  };

  return (
    <>
      <PageHero title={page.title} crumbs={crumbs} />

      {/* intro: white */}
      <Band tone="white" curveTop aria-label={title}>
        <div className="grid items-center gap-10 px-[5%] pb-[100px] pt-[calc(var(--u)*40)] lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
          <div>
            <Eyebrow>{page.sub.name}</Eyebrow>
            <h2 className={H2}>
              <FoldHeading text={title} />
            </h2>
            <div
              className="rte-content mt-6 text-lg leading-[1.5] text-navy lg:mt-[calc(var(--u)*32)] lg:text-[calc(var(--u)*24)] lg:leading-[1.45]"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml || (page.excerpt ? `<p>${page.excerpt}</p>` : "") }}
            />
          </div>
          {page.sideImage && (
            <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
              <img src={page.sideImage} alt={page.title} loading="lazy" className="aspect-[4/3] w-full rounded-[25px] object-cover shadow-[4px_4px_9px_rgba(0,0,0,0.25)]" />
              <img
                src="/images/home/svg/bracket-yellow.svg"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -bottom-4 -right-4 hidden w-28 lg:block"
              />
            </div>
          )}
        </div>
      </Band>

      {order.map((key, i) =>
        i % 2 === 0 ? (
          <GlowSection key={key} aria-label={key} className={PAD}>
            {render[key]()}
          </GlowSection>
        ) : (
          <Band key={key} tone="white" aria-label={key} className={PAD}>
            {render[key]()}
          </Band>
        ),
      )}

      <VideoModal
        youtubeId={open?.youtubeId ?? ""}
        title={open?.title ?? ""}
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
      />
    </>
  );
}

export function MainActivityView({ page }: { page: MainActivityPage }) {
  const crumbs = [{ label: "בית", href: "/" }, { label: "פעילויות", href: "/activities" }, { label: page.title }];
  return (
    <>
      <PageHero title={page.title} crumbs={crumbs} />
      <GlowSection curveTop aria-label="הפעילויות" className="pb-[100px] pt-[calc(var(--u)*40)]">
        <div className="px-[5%]">
          <Eyebrow>על התחום</Eyebrow>
          <h2 className={H2}>
            <FoldHeading text={page.title} />
          </h2>
          {page.descriptionHtml ? (
            <div
              className="rte-content mt-6 max-w-[900px] text-lg leading-[1.5] text-navy lg:mt-[calc(var(--u)*28)] lg:text-[calc(var(--u)*24)]"
              dangerouslySetInnerHTML={{ __html: page.descriptionHtml }}
            />
          ) : (
            <ScrollText as="p" text="הפעילויות של קרן דניאלי בתחום זה:" className="mt-6 text-lg text-navy lg:mt-[calc(var(--u)*28)] lg:text-[calc(var(--u)*24)]" />
          )}
        </div>
        <div className="mt-10 lg:mt-[calc(var(--u)*50)]">
          <ActivityPanels
            items={page.subs.map((sub) => ({
              key: sub.slug,
              title: sub.name,
              text: sub.excerpt,
              href: sub.href ?? "#",
              img: SUB_PHOTOS[sub.name] ?? (sub.image || undefined),
              icon: MAIN_ICONS[page.title],
            }))}
          />
        </div>
      </GlowSection>
    </>
  );
}

export { activityHref };
