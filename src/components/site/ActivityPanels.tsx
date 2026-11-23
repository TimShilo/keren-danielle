import { useQueryClient } from "@tanstack/react-query";
import { activityPageQuery } from "@/lib/activities";
import { loadGsap } from "@/lib/gsap";
import { ArrowLeft, GraduationCap, Hospital, ScrollText, Users, type LucideIcon } from "lucide-react";

const ICONS = { health: Hospital, education: GraduationCap, society: ScrollText, judaism: Users } as const;

export interface PanelItem {
  key: string;
  title: string;
  text?: string;
  href: string;
  img?: string | undefined;
  icon?: LucideIcon | undefined;
  /** CSS object-position of the photo (default: centre) */
  pos?: string | undefined;
  /** object-position once the panel is expanded */
  posOpen?: string | undefined;
}

const PANELS: PanelItem[] = [
  {
    key: "health",
    title: "בריאות ורפואה",
    text: "שותפות קרובה במיזמים בתחומי הבריאות והרפואה. העלאה על נס של התנדבות, התמסרות, ורפואה עם לב.",
    href: "/activities/%D7%91%D7%A8%D7%99%D7%90%D7%95%D7%AA-%D7%95%D7%A8%D7%A4%D7%95%D7%90%D7%94",
    img: "/images/home/activities/health.webp",
    posOpen: "50% 0%", // keep the heads in frame when expanded
  },
  {
    key: "education",
    title: "חינוך ולמידה",
    text: "ייזום פעילות חינוכית ומלגות ייחודיות. תרומה למסגרות חינוך, בקשת גילאים ומגזרים. קידום למידה ומצוינות במגוון תחומים.",
    href: "/activities/%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%95%D7%9C%D7%9E%D7%99%D7%93%D7%94",
    img: "/images/home/activities/education.webp",
  },
  {
    key: "society",
    title: "חברה ורווחה",
    text: "תמיכה במיזמי רווחה וקהילה, סיוע לנזקקים ולנערות בסיכון, וחיזוק החוסן החברתי.",
    href: "/activities/%D7%A8%D7%95%D7%95%D7%97%D7%94-%D7%95%D7%A7%D7%94%D7%99%D7%9C%D7%94",
    img: "/images/home/activities/society.webp",
  },
  {
    key: "judaism",
    title: "יהדות",
    text: "העמקת הלימוד והמסורת: ערבי לימוד, שיעורים ומיזמים ברוח תורתה של דניאלי.",
    href: "/activities/%D7%9E%D7%A1%D7%95%D7%A8%D7%AA-%D7%95%D7%97%D7%91%D7%A8%D7%94",
    img: "/images/home/activities/judaism.webp",
    posOpen: "50% 0%",
  },
];

const STRIPES = 7;
const runs = new WeakMap<Element, { kill: () => void }>();

/** Hover: the full-colour photo rises in vertical stripes (right to left) over the veiled picture. */
async function playStripes(root: Element) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const layer = root.querySelector<HTMLElement>("[data-player]");
  const strips = Array.from(root.querySelectorAll<HTMLElement>("[data-pstripe]"));
  if (!layer || !strips.length) return;
  const { gsap } = await loadGsap();
  runs.get(root)?.kill();
  gsap.killTweensOf([layer, ...strips]);
  gsap.set(layer, { opacity: 1 });
  gsap.set(strips, { clipPath: "inset(100% 0 0 0)" });
  const tl = gsap.to(strips, {
    clipPath: "inset(0% 0 0 0)",
    duration: 0.95,
    delay: 0.2,
    ease: "power3.out",
    stagger: { each: 0.11, from: "end" },
  });
  runs.set(root, { kill: () => tl.kill() });
}

function stopStripes(root: Element) {
  const layer = root.querySelector<HTMLElement>("[data-player]");
  const strips = Array.from(root.querySelectorAll<HTMLElement>("[data-pstripe]"));
  if (!layer) return;
  runs.get(root)?.kill();
  void loadGsap().then(({ gsap }) => {
    gsap.killTweensOf([layer, ...strips]);
    gsap.to(layer, { opacity: 0, duration: 0.4, ease: "power1.out", onComplete: () => void gsap.set(strips, { clipPath: "inset(100% 0 0 0)" }) });
  });
}

/**
 * Four full-width panels with a blue veil. The hovered panel grows, its veil fades out
 * and a white caption (title, text, arrow) slides up from the bottom.
 */
export function ActivityPanels({ items = PANELS }: { items?: PanelItem[] }) {
  const qc = useQueryClient();
  // warm the page's data while the pointer is still over the panel, so the page opens already filled
  const warm = (href: string) => {
    const m = /\/activities\/([^/?#]+)/.exec(href);
    if (m?.[1]) void qc.prefetchQuery(activityPageQuery(decodeURIComponent(m[1])));
  };
  return (
    <ul data-dark="" className="flex w-full flex-col gap-4 lg:[--ph:max(70vh,480px)] lg:h-[var(--ph)] lg:flex-row lg:gap-[calc(var(--u)*18)]">
      {items.map((p) => (
        <li key={p.key} className="min-w-0 lg:grow lg:basis-0 lg:transition-[flex-grow,flex-basis] lg:duration-[1200ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:hover:grow-0 lg:hover:basis-[calc(var(--ph)*1.364)] lg:has-[a:focus-visible]:grow-0 lg:has-[a:focus-visible]:basis-[calc(var(--ph)*1.364)]">
          <a
            href={p.href}
            onPointerEnter={(e) => {
              warm(p.href);
              if (e.pointerType !== "touch") void playStripes(e.currentTarget);
            }}
            onPointerLeave={(e) => stopStripes(e.currentTarget)}
            onFocus={(e) => {
              warm(p.href);
              void playStripes(e.currentTarget);
            }}
            onBlur={(e) => stopStripes(e.currentTarget)}
            aria-label={p.title}
            className="group relative flex h-[360px] w-full flex-col overflow-hidden bg-[#0b4387] text-white outline-none sm:h-[460px] lg:h-full"
          >
            {p.img ? (
              <img
                src={p.img}
                alt=""
                loading="lazy"
                style={{ "--pos": p.pos ?? "50% 50%", "--pos-open": p.posOpen ?? "50% 100%" } as React.CSSProperties}
                className="absolute inset-x-0 top-0 h-full w-full object-cover [object-position:var(--pos)] transition-[height,object-position,transform,opacity] duration-[1200ms] ease-out lg:group-hover:opacity-0 lg:group-focus-visible:opacity-0 lg:group-hover:h-[calc(100%-var(--u)*164)] lg:group-hover:[object-position:var(--pos-open)] lg:group-focus-visible:h-[calc(100%-var(--u)*164)] lg:group-focus-visible:[object-position:var(--pos-open)]"
              />
            ) : (
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,#082944,#0c448a)]" />
            )}
            {/* hover photo: stripes rise over the veiled picture (desktop) */}
            {p.img && (
              <div
                aria-hidden
                data-player
                dir="ltr"
                style={{ "--pos-open": p.posOpen ?? "50% 100%" } as React.CSSProperties}
                className="pointer-events-none absolute inset-x-0 top-0 z-[1] hidden h-[calc(100%-var(--u)*164)] opacity-0 lg:flex"
              >
                {Array.from({ length: STRIPES }, (_, i) => (
                  <div key={i} data-pstripe className="relative -mr-px h-full flex-1 overflow-hidden pr-px" style={{ clipPath: "inset(100% 0 0 0)" }}>
                    <img
                      src={p.img}
                      alt=""
                      draggable={false}
                      className="absolute top-0 block h-full max-w-none object-cover [object-position:var(--pos-open)]"
                      style={{ width: `${STRIPES * 100}%`, left: `${-i * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
            {/* blue veil */}
            <div className="absolute inset-0 bg-[rgba(11,67,135,0.7)] transition-opacity duration-[900ms] lg:group-hover:opacity-0 lg:group-focus-visible:opacity-0" />

            {/* title on the veil */}
            <h3 className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 px-6 pb-8 text-center text-[28px] font-bold leading-[0.8] transition-[opacity,transform] duration-[900ms] lg:px-[calc(var(--u)*40)] lg:pb-[calc(var(--u)*68)] lg:text-[calc(var(--u)*32)] lg:group-hover:translate-y-4 lg:group-hover:opacity-0 lg:group-focus-visible:translate-y-4 lg:group-focus-visible:opacity-0">
              {(() => {
                const Icon = p.icon ?? ICONS[p.key as keyof typeof ICONS] ?? ScrollText;
                return <Icon aria-hidden className="size-7 shrink-0 lg:size-[calc(var(--u)*34)]" />;
              })()}
              {p.title}
            </h3>

            {/* white caption (always on mobile, on hover on desktop) */}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-0 flex-col items-center bg-white px-6 py-5 text-center text-navy transition-[transform,opacity] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-[calc(var(--u)*164)] lg:translate-y-full lg:justify-center lg:px-[calc(var(--u)*50)] lg:py-0 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
              <p className="flex items-center justify-center gap-3 text-center text-2xl font-bold leading-[0.9] text-brand-blue lg:text-[calc(var(--u)*32)]">
                {(() => {
                  const Icon = p.icon ?? ICONS[p.key as keyof typeof ICONS] ?? ScrollText;
                  return <Icon aria-hidden className="size-6 shrink-0 lg:size-[calc(var(--u)*30)]" />;
                })()}
                {p.title}
              </p>
              {p.text && (
                <p className="mt-2 line-clamp-3 text-base leading-tight lg:mt-[calc(var(--u)*8)] lg:text-[calc(var(--u)*20)] lg:leading-none">{p.text}</p>
              )}
              <span className="mt-3 grid size-8 place-items-center rounded-full border border-brand-blue text-brand-blue lg:mt-[calc(var(--u)*12)] lg:size-[calc(var(--u)*33)]">
                <ArrowLeft className="size-4 lg:size-[calc(var(--u)*18)]" />
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
