import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useContentList, usePageItem, type ListItem } from "@/lib/content-list";
import { shortTitle } from "./PageHero";
import type { VideoCardData } from "@/lib/home-feed";
import { FoldHeading } from "./FoldHeading";
import { trackPointer } from "./FxButton";
import { Eyebrow } from "./HomeHero";
import { CandleFlame } from "./CandleFlame";
import { DanielleCards } from "./InfoPages";
import { MoreArrow, VideoCard } from "./HomeFeedSections";
import { PageHero, type Crumb } from "./PageHero";
import { PageSections } from "./PageSections";
import { RichScrollText } from "./RichScrollText";
import { VideoModal } from "./VideoModal";

const H2 = "mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]";
const CARD = "shadow-[4px_4px_9px_rgba(0,0,0,0.25)]";
const HOME: Crumb = { label: "בית", href: "/" };
const ABOUT: Crumb = { label: "אודות", href: "/about" };
const DANIELLE: Crumb = { label: 'על דניאלי ע"ה', href: "/danielle" };

const DANIELLE_LINKS = [
  { label: "חברים כותבים על דניאלי", href: "/danielle/friends" },
  { label: "רגעים מחייה של דניאלי", href: "/danielle/moments" },
  { label: "יצירות של דניאלי", href: "/danielle/creations" },
  { label: "השירים של דניאלי", href: "/danielle/songs" },
  { label: "הספר – דניאלי שלי", href: "/danielle/book" },
];

function Head({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="text-center">
      <Eyebrow className="justify-center">{eyebrow}</Eyebrow>
      <h2 className={H2}>
        <FoldHeading text={title} />
      </h2>
      {intro && <p className="mx-auto mt-6 max-w-[900px] text-lg text-navy lg:text-[calc(var(--u)*24)]">{intro}</p>}
    </div>
  );
}

/** Links to the other "about Danielle" pages, on the dark curved band that closes the page. */
function OtherPages({ current }: { current: string }) {
  return (
    <>
      <Head eyebrow="עוד" title="להמשיך להכיר את דניאלי" />
      <div className="mt-10 lg:mt-[calc(var(--u)*50)]">
        <DanielleCards skip={current} />
      </div>
    </>
  );
}

function ItemDialog({ item, onClose }: { item: ListItem | null; onClose: () => void }) {
  const imgs = item ? (item.gallery.length ? item.gallery.map((g) => g.src) : item.image ? [item.image] : []) : [];
  return (
    <DialogPrimitive.Root open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 cursor-pointer bg-navy/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir="rtl"
          aria-describedby={undefined}
          className="site-theme fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[25px] bg-white p-6 text-navy shadow-2xl outline-none lg:p-10"
        >
          <DialogPrimitive.Title className="pe-12 text-[28px] font-bold leading-[1.2] lg:text-[32px]">{item?.title}</DialogPrimitive.Title>
          {item?.date && <p className="mt-2 text-base text-navy/70">{new Date(item.date).toLocaleDateString("he-IL")}</p>}
          {imgs.length > 0 && (
            <div className={`mt-6 grid gap-4 ${imgs.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {imgs.map((s, i) => (
                <img key={i} src={s} alt="" loading="lazy" className="w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
          <div className="rte-content mt-6 text-lg leading-[1.6] [&_img]:hidden" dangerouslySetInnerHTML={{ __html: item?.html ?? "" }} />
          <DialogPrimitive.Close aria-label="סגירה" onPointerEnter={trackPointer} onPointerMove={trackPointer} className="fx-btn fx-yellow absolute end-4 top-4 size-10 items-center justify-center">
            <X className="size-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** A grid of cards; a click opens the full text (and photos) in a dialog. */
function ItemGrid({ items, onOpen, quote = false }: { items: ListItem[]; onOpen: (i: ListItem) => void; quote?: boolean }) {
  return (
    <ul className="mx-auto mt-10 grid max-w-[1500px] grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-[calc(var(--u)*50)] lg:grid-cols-3 lg:gap-[calc(var(--u)*30)]">
      {items.map((it) => (
        <li key={it.id} className="flex">
          <button
            type="button"
            onClick={() => onOpen(it)}
            className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-[25px] bg-white text-start text-navy transition-transform duration-300 hover:-translate-y-1 ${CARD}`}
          >
            {it.image && !quote && <img src={it.image} alt="" loading="lazy" className="aspect-[414/290] w-full object-cover" />}
            <span className="flex flex-1 flex-col p-6">
              {it.date && <span className="text-base text-navy/70">{new Date(it.date).toLocaleDateString("he-IL")}</span>}
              <span className={`line-clamp-3 font-bold leading-[1.2] ${quote ? "text-[24px]" : "text-[22px]"}`}>{it.title}</span>
              {!quote && it.excerpt && <span className="mt-4 line-clamp-3 text-[18px] leading-[1.2]">{it.excerpt}</span>}
              <span className="mt-auto pt-4 font-bold underline-offset-4 group-hover:underline">לקריאה ←</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ListPage({
  title,
  crumbs,
  eyebrow,
  heading,
  intro,
  type,
  current,
  quote,
  empty = "התוכן יתווסף בקרוב.",
  children,
}: {
  title: string;
  crumbs: Crumb[];
  eyebrow: string;
  heading: string;
  intro?: string;
  type: string;
  current?: string;
  quote?: boolean;
  empty?: string;
  children?: ReactNode;
}) {
  const q = useContentList(type);
  const [open, setOpen] = useState<ListItem | null>(null);
  const items = q.data ?? [];
  return (
    <>
      <PageHero title={title} crumbs={crumbs} />
      <PageSections
        sections={[
          {
            key: "list",
            label: heading,
            tone: "glow",
            children: (
              <>
                <Head eyebrow={eyebrow} title={heading} {...(intro ? { intro } : {})} />
                {children}
                {items.length ? <ItemGrid items={items} onOpen={setOpen} quote={!!quote} /> : !q.isLoading && <p className="mt-10 text-center text-xl">{empty}</p>}
              </>
            ),
          },
          ...(current
            ? [{ key: "other", label: "עוד על דניאלי", tone: "dark" as const, edge: "sag" as const, children: <OtherPages current={current} /> }]
            : []),
        ]}
      />
      <ItemDialog item={open} onClose={() => setOpen(null)} />
    </>
  );
}

/** four words at most, then "…" */
const fourWords = (t: string) => {
  const w = t.trim().replace(/\s+/g, " ").split(" ");
  return w.length > 4 ? `${w.slice(0, 4).join(" ")}…` : t;
};

function FriendCard({ it }: { it: ListItem }) {
  return (
    <a
      href={`/danielle/friends/${it.slug || it.id}`}
      className="group/card relative flex flex-col rounded-[20px] bg-[#f7f5f2] px-7 pb-5 pt-6 text-navy transition-transform duration-300 hover:-translate-y-1 shadow-[2px_6px_14px_rgba(0,0,0,0.18)] lg:px-[calc(var(--u)*34)]"
    >
      <h3 className="truncate text-[22px] font-bold leading-[1.2] lg:text-[calc(var(--u)*24)]">{fourWords(it.title)}</h3>
      <div className="mt-3 flex items-start gap-4">
        <CandleFlame className="h-[110px] lg:h-[calc(var(--u)*123)]" />
        <p className="line-clamp-4 min-h-[5.2em] flex-1 text-[16px] leading-[1.3] lg:text-[calc(var(--u)*17)]">{it.excerpt}</p>
      </div>
      <MoreArrow className="mt-3 justify-end" />
    </a>
  );
}

export function FriendsPage() {
  const q = useContentList("friend_story");
  const items = q.data ?? [];
  return (
    <>
      <PageHero title="חברים כותבים על דניאלי" crumbs={[HOME, ABOUT, DANIELLE, { label: "חברים כותבים על דניאלי" }]} />
      <PageSections
        sections={[
          {
            key: "list",
            label: "חברים כותבים על דניאלי",
            tone: "glow",
            children: (
              <>
                <Head eyebrow="מה החברים מספרים" title="חברים מספרים על דניאלי" />
                <ul className="mx-auto mt-10 grid max-w-[1720px] grid-cols-1 gap-6 md:grid-cols-2 lg:mt-[calc(var(--u)*60)] lg:grid-cols-3 lg:gap-[calc(var(--u)*36)]">
                  {items.map((it) => (
                    <li key={it.id} className="flex">
                      <FriendCard it={it} />
                    </li>
                  ))}
                </ul>
                {!items.length && !q.isLoading && <p className="mt-10 text-center text-xl">התוכן יתווסף בקרוב.</p>}
              </>
            ),
          },
          { key: "other", label: "עוד על דניאלי", tone: "dark", edge: "sag", children: <OtherPages current="/danielle/friends" /> },
        ]}
      />
    </>
  );
}
export const MomentsPage = () => (
  <ListPage title="רגעים מחייה של דניאלי" crumbs={[HOME, ABOUT, DANIELLE, { label: "רגעים מחייה של דניאלי" }]} eyebrow={'על דניאלי ע"ה'} heading="רגעים מחייה של דניאלי" type="moment" current="/danielle/moments" />
);
export const CreationsPage = () => (
  <ListPage title="יצירות של דניאלי" crumbs={[HOME, ABOUT, DANIELLE, { label: "יצירות של דניאלי" }]} eyebrow={'על דניאלי ע"ה'} heading="יצירות של דניאלי" type="creation" current="/danielle/creations" />
);
export const BooksPage = () => (
  <ListPage title="ראו אור" crumbs={[HOME, { label: "ראו אור" }]} eyebrow="ספרים ופרסומים" heading="ראו אור" intro="ספרים, חוברות ופרסומים שיצאו לאור לזכרה של דניאלי." type="book" />
);
export const EventsPage = () => (
  <ListPage title="אירועים" crumbs={[HOME, { label: "אירועים" }]} eyebrow="אירועים וכנסים" heading="אירועים" type="event" />
);

/* ───────── שירים ───────── */
const SONGS: VideoCardData[] = [
  ["M8AWTCTMpRM", "יונתן רזאל – להביע אהבה"],
  ["0dNFEk-jnUs", "ישי ריבו – מספר על דניאלי"],
  ["rIA_VEftaII", "ישי לפידות – לאמא"],
  ["QBC-WZtSTBg", "גלעד שגב – ללכת קדימה"],
  ["czXVK16pryI", "ישי לפידות – פאר העולם"],
  ["sLQdjbtEjfM", "אביתר בנאי – פסיעות רגל"],
  ["5vQNUiptCpU", "עקיבא – צא מן העיר"],
  ["7Jo-3u7lHWQ", "אמיר דדון"],
].map(([youtubeId, title]) => ({ id: youtubeId as string, youtubeId: youtubeId as string, title: title as string })) as VideoCardData[];

export function SongsPage() {
  const [open, setOpen] = useState<VideoCardData | null>(null);
  return (
    <>
      <PageHero title="השירים של דניאלי" crumbs={[HOME, ABOUT, DANIELLE, { label: "השירים של דניאלי" }]} />
      <PageSections
        sections={[
          {
            key: "songs",
            label: "השירים של דניאלי",
            tone: "glow",
            children: (
              <>
                <Head eyebrow={'על דניאלי ע"ה'} title="השירים של דניאלי" intro="שירים שנכתבו, הולחנו ובוצעו לזכרה." />
                <ul className="mx-auto mt-10 grid max-w-[1500px] gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-[calc(var(--u)*50)] lg:grid-cols-4 lg:gap-x-[calc(var(--u)*30)]">
                  {SONGS.map((v) => (
                    <li key={v.id}>
                      <VideoCard v={v} onOpen={() => setOpen(v)} />
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
          { key: "other", label: "עוד על דניאלי", tone: "dark", edge: "sag", children: <OtherPages current="/danielle/songs" /> },
        ]}
      />
      <VideoModal youtubeId={open?.youtubeId ?? ""} title={open?.title ?? ""} open={!!open} onOpenChange={(o) => !o && setOpen(null)} />
    </>
  );
}

/* ───────── הספר ───────── */
export function BookPage() {
  const q = usePageItem("sefer-shel-danieli");
  return (
    <>
      <PageHero title="הספר – דניאלי שלי" crumbs={[HOME, ABOUT, DANIELLE, { label: "הספר – דניאלי שלי" }]} />
      <PageSections
        sections={[
          {
            key: "book",
            label: "הספר",
            tone: "glow",
            children: (
              <div className="max-w-[1100px]">
                <Eyebrow>{'על דניאלי ע"ה'}</Eyebrow>
                <h2 className={H2}>
                  <FoldHeading text="דניאלי שלי" />
                </h2>
                {q.data?.html ? (
                  <RichScrollText className="rte-content mt-8 text-lg leading-[1.6] text-navy lg:mt-[calc(var(--u)*40)] lg:text-[calc(var(--u)*24)]" html={q.data.html} />
                ) : (
                  !q.isLoading && <p className="mt-8 text-xl">הספר יתווסף בקרוב.</p>
                )}
              </div>
            ),
          },
          { key: "other", label: "עוד על דניאלי", tone: "dark", edge: "sag", children: <OtherPages current="/danielle/book" /> },
        ]}
      />
    </>
  );
}
