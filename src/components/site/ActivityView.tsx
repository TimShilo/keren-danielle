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
import { FoldHeading } from "./FoldHeading";
import { GlowSection } from "./GlowSection";
import { NewsCard, VideoCard } from "./HomeFeedSections";
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

function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="פירורי לחם" className="text-base text-white/85 lg:text-xl">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden className="text-brand-yellow">/</span>}
            {c.href ? (
              <a href={c.href} className="underline-offset-4 hover:underline">
                {c.label}
              </a>
            ) : (
              <span aria-current="page" className="font-bold text-white">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Dark hero of an inner page (same gradient as "חדשות ועדכונים"), flat on top under the header. */
function PageHero({
  eyebrow,
  title,
  crumbs,
  image,
}: {
  eyebrow: string;
  title: string;
  crumbs: { label: string; href?: string }[];
  image?: string;
}) {
  return (
    <section
      aria-label={title}
      className="relative isolate overflow-hidden bg-[linear-gradient(to_bottom,#082944_26%,#0c448a_95%)] px-[5%] pb-[calc(var(--u)*150)] pt-36 text-white lg:pt-[calc(var(--u)*230)]"
    >
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-0 -z-10 hidden h-full w-[48%] object-cover opacity-30 [mask-image:linear-gradient(to_right,#000_30%,transparent)] lg:block rtl:[mask-image:linear-gradient(to_right,#000_30%,transparent)]"
        />
      )}
      <Crumbs items={crumbs} />
      <div className="mt-8 lg:mt-[calc(var(--u)*44)]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-[clamp(40px,10vw,64px)] font-bold leading-[1.05] lg:mt-[calc(var(--u)*24)] lg:text-[calc(var(--u)*64)]">
          <FoldHeading text={title} trigger="mount" />
        </h1>
      </div>
    </section>
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
    { label: "דף הבית", href: "/" },
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
              <div key={g.id} className="h-full">
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
        <p className="mt-10 text-center">
          <a href={page.newsHref} className="text-xl font-bold text-navy underline-offset-8 hover:underline lg:text-2xl">
            לכל החדשות והעדכונים ←
          </a>
        </p>
      </>
    ),
  };

  return (
    <>
      <PageHero eyebrow={page.main?.name ?? "פעילות הקרן"} title={page.title} crumbs={crumbs} image={page.heroImage} />

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
          <GlowSection key={key} curveTop aria-label={key} className={PAD}>
            {render[key]()}
          </GlowSection>
        ) : (
          <Band key={key} tone="white" curveTop aria-label={key} className={PAD}>
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
  const crumbs = [{ label: "דף הבית", href: "/" }, { label: "פעילויות", href: "/activities" }, { label: page.title }];
  return (
    <>
      <PageHero eyebrow="פעילות הקרן" title={page.title} crumbs={crumbs} image={page.image} />
      <Band tone="white" curveTop>
        <div className="grid items-start gap-10 px-[5%] pb-[100px] pt-[calc(var(--u)*40)] lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
          <div>
            <Eyebrow>על התחום</Eyebrow>
            <h2 className={H2}>
              <FoldHeading text={page.title} />
            </h2>
            {page.descriptionHtml ? (
              <div className="rte-content mt-6 text-lg text-navy lg:text-[calc(var(--u)*24)]" dangerouslySetInnerHTML={{ __html: page.descriptionHtml }} />
            ) : (
              <ScrollText as="p" text="הפעילויות של קרן דניאלי בתחום זה:" className="mt-6 text-lg text-navy lg:text-[calc(var(--u)*24)]" />
            )}
          </div>
          {page.image && <img src={page.image} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-[25px] object-cover shadow-[4px_4px_9px_rgba(0,0,0,0.25)]" />}
        </div>
      </Band>
      <GlowSection curveTop aria-label="הפעילויות" className={PAD}>
        <SectionHead eyebrow="הפעילויות" title={`פעילויות ב${page.title}`} />
        <ul className="mx-auto mt-10 grid max-w-[1500px] grid-cols-1 gap-6 px-[5%] sm:grid-cols-2 lg:grid-cols-3">
          {page.subs.map((s) => {
            const body = (
              <>
                {s.image ? (
                  <img src={s.image} alt="" loading="lazy" className="aspect-[414/267] w-full object-cover" />
                ) : (
                  <span aria-hidden className="block aspect-[414/267] w-full bg-[linear-gradient(135deg,#082944,#0c448a)]" />
                )}
                <span className="block p-6">
                  <span className="block text-[24px] font-bold leading-[1.3] text-[#1d2838]">{s.name}</span>
                  {s.excerpt && <span className="mt-1 line-clamp-3 block text-[18px] leading-[1.4] text-[#1d2838]">{s.excerpt}</span>}
                </span>
              </>
            );
            const cls = `flex h-full w-full flex-col overflow-hidden rounded-[25px] bg-white text-navy ${CARD}`;
            return (
              <li key={s.slug} className="flex">
                {s.href ? (
                  <a href={s.href} className={`${cls} transition-transform duration-300 hover:-translate-y-1`}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </GlowSection>
    </>
  );
}

export { activityHref };
