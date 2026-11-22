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
import { MAIN_ICONS, SUB_PHOTO_POS, SUB_PHOTO_POS_OPEN, SUB_PHOTOS } from "./CategoryCard";
import { FoldHeading } from "./FoldHeading";
import { FxButton } from "./FxButton";
import { GlowSection } from "./GlowSection";
import { NewsCard, VideoCard } from "./HomeFeedSections";
import { PageHero } from "./PageHero";
import { RevealStripes } from "./RevealStripes";
import { RichScrollText } from "./RichScrollText";
import { PageSections, TONES, type Tone } from "./PageSections";
import { Eyebrow } from "./HomeHero";
import { CurvedGallery } from "./CurvedGallery";
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

function GalleryCard({ g, pageTitle }: { g: GalleryItem; pageTitle: string }) {
  const showTitle = !!g.title && g.title.trim() !== pageTitle.trim();
  return (
    <div className={`flex h-full w-full flex-col overflow-hidden rounded-[25px] bg-white text-navy ${CARD}`}>
      <img src={g.image} alt={g.title} loading="lazy" className="aspect-[414/290] w-full object-cover" />
      {(showTitle || g.caption) && (
        <div className="p-6">
          {showTitle && <h3 className="line-clamp-2 text-[24px] font-bold leading-[1.3] text-[#1d2838]">{g.title}</h3>}
          {g.caption && <p className="mt-1 line-clamp-3 text-[18px] leading-[1.4] text-[#1d2838]">{g.caption}</p>}
        </div>
      )}
    </div>
  );
}

function TeamCard({ m }: { m: TeamMember }) {
  return (
    <li className={`flex flex-col items-center rounded-[25px] bg-white p-6 text-center text-navy transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-2 hover:shadow-[4px_12px_22px_rgba(0,0,0,0.25)] ${CARD}`}>
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

type SectionKey = "more" | "gallery" | "video" | "team" | "news";

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
  if (page.layout.team && page.team.length) order.push("team"); // the team comes right after the intro
  if (page.more) order.push("more");
  if (page.layout.gallery && page.gallery.length) order.push("gallery"); // photos come before videos and news
  if (page.layout.video && page.videos.length) order.push("video");
  if (page.news.length) order.push("news");


  // every page gets at least one dark blue area: the photos, or (when there are none) the videos, else the news
  const darkKey: SectionKey | undefined = order.includes("gallery") ? "gallery" : order.includes("video") ? "video" : order.includes("news") ? "news" : undefined;

  const render: Record<SectionKey, () => React.ReactNode> = {
    more: () =>
      page.more ? (
        <>
          <SectionHead eyebrow="עוד על הפעילות" title={page.more.title || "עוד"} center={false} />
          <div className={page.more.image ? "mt-8 grid items-center gap-8 lg:mt-[calc(var(--u)*40)] lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]" : ""}>
            {page.more.image && (
              <RevealStripes src={page.more.image} alt={page.more.title} className="mx-auto w-full max-w-[560px] lg:max-w-none" />
            )}
            <RichScrollText
              className={`rte-content max-w-[1200px] text-lg leading-[1.5] lg:text-[calc(var(--u)*24)] [&_ol]:columns-1 [&_ol]:gap-x-12 sm:[&_ol]:columns-2 lg:[&_ol]:columns-3 [&_li]:break-inside-avoid [&_li]:py-0.5 ${page.more.image ? "" : "mt-8 lg:mt-[calc(var(--u)*40)]"}`}
              html={page.more.html}
              start="top 85%"
              end="bottom 60%"
            />
          </div>
        </>
      ) : null,
    gallery: () => (
      <>
        <SectionHead eyebrow="גלריה" title="תמונות" />
        <div className="mt-6 lg:mt-[calc(var(--u)*30)]">
          <CurvedGallery
            label="גלריית תמונות"
            photos={page.gallery.map((g) => ({ src: g.image, alt: g.title || page.title, caption: /^(למלא|לכתוב)/.test(g.caption.trim()) ? "" : g.caption }))}
            fallback={
              <LoopCarousel
                label="גלריית תמונות"
                direction="right"
                items={page.gallery.map((g) => (
                  <div key={g.id} className="h-full w-full">
                    <GalleryCard g={g} pageTitle={page.title} />
                  </div>
                ))}
                itemClassName={`${ITEM} flex`}
              />
            }
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
        <div className="mt-10 lg:mt-[calc(var(--u)*50)]">
          <LoopCarousel
            label="חדשות ועדכונים"
            direction="left"
            speed={30}
            items={page.news.map((n) => (
              <div key={n.id} className="h-full w-full">
                <NewsCard n={n} />
              </div>
            ))}
            itemClassName={`${ITEM} flex`}
          />
        </div>
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

      <PageSections
        sections={[
          {
            key: "intro",
            label: title,
            tone: "glow",
            children: (
              <>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
                <div>
                  <Eyebrow>{page.sub.name}</Eyebrow>
                  <h2 className={H2}>
                    <FoldHeading text={title} />
                  </h2>
                  {page.logo && (
                    <img src={page.logo.src} alt={page.logo.alt} loading="lazy" className="mt-4 h-14 w-auto object-contain lg:mt-[calc(var(--u)*18)] lg:h-[calc(var(--u)*72)]" />
                  )}
                  <RichScrollText
                    className="rte-content mt-6 text-lg leading-[1.5] text-navy lg:mt-[calc(var(--u)*32)] lg:text-[calc(var(--u)*24)] lg:leading-[1.45]"
                    html={page.bodyHtml || (page.excerpt ? `<p>${page.excerpt}</p>` : "")}
                  />
                </div>
                {page.sideImage && (
                  <RevealStripes src={page.sideImage} alt={page.title} className="mx-auto w-full max-w-[560px] lg:max-w-none">
                    <img
                      data-deco
                      src="/images/home/svg/bracket-yellow.svg"
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute -bottom-4 -right-4 hidden w-28 translate-x-3 translate-y-3 lg:block"
                    />
                  </RevealStripes>
                )}
              </div>
              </>
            ),
          },
          ...order.map((key, i) => ({
            key,
            // fixed order on every page: intro, team/more, photos (always the dark curved wall), videos, news
            edge: (key === darkKey ? "sag" : undefined) as "sag" | undefined,
            tone: (key === darkKey
              ? "dark"
              : (TONES as string[]).includes(page.tones[i + 1] ?? "")
                ? (page.tones[i + 1] as Tone)
                : key === "news"
                  ? "glow"
                  : "white") as Tone,
            children: render[key](),
          })),
        ]}
      />

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
      <GlowSection curveTop aria-label="הפעילויות" className="pb-[100px] pt-[100px]">
        <div className="px-[5%]">
          <Eyebrow>על התחום</Eyebrow>
          <h2 className={H2}>
            <FoldHeading text={page.title} />
          </h2>
          {page.descriptionHtml ? (
            <RichScrollText
              className="rte-content mt-6 max-w-[900px] text-lg leading-[1.5] text-navy lg:mt-[calc(var(--u)*28)] lg:text-[calc(var(--u)*24)]"
              html={page.descriptionHtml}
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
              pos: SUB_PHOTO_POS[sub.name],
              posOpen: SUB_PHOTO_POS_OPEN[sub.name],
            }))}
          />
        </div>
      </GlowSection>
    </>
  );
}

export { activityHref };
