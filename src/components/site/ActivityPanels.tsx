import { ArrowLeft } from "lucide-react";

const PANELS = [
  {
    key: "health",
    title: "בריאות ורפואה",
    text: "שותפות קרובה במיזמים בתחומי הבריאות והרפואה. העלאה על נס של התנדבות, התמסרות, ורפואה עם לב.",
    href: "/activities/health",
    img: "/images/home/activities/health.webp",
  },
  {
    key: "education",
    title: "חינוך ולמידה",
    text: "ייזום פעילות חינוכית ומלגות ייחודיות. תרומה למסגרות חינוך, בקשת גילאים ומגזרים. קידום למידה ומצוינות במגוון תחומים.",
    href: "/activities/education",
    img: "/images/home/activities/education.webp",
  },
  {
    key: "society",
    title: "חברה ורווחה",
    text: "תמיכה במיזמי רווחה וקהילה, סיוע לנזקקים ולנערות בסיכון, וחיזוק החוסן החברתי.",
    href: "/activities/society",
    img: "/images/home/activities/society.webp",
  },
  {
    key: "judaism",
    title: "יהדות",
    text: "העמקת הלימוד והמסורת: ערבי לימוד, שיעורים ומיזמים ברוח תורתה של דניאלי.",
    href: "/activities/judaism",
    img: "/images/home/activities/judaism.webp",
  },
];

/**
 * Four full-width panels with a blue veil. The hovered panel grows, its veil fades out
 * and a white caption (title, text, arrow) slides up from the bottom.
 */
export function ActivityPanels() {
  return (
    <ul className="flex w-full flex-col gap-4 lg:h-[830px] lg:flex-row lg:gap-[calc(var(--u)*18)]">
      {PANELS.map((p) => (
        <li key={p.key} className="min-w-0 lg:grow lg:basis-0 lg:transition-[flex-grow] lg:duration-[1200ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:hover:grow-[2.25] lg:has-[a:focus-visible]:grow-[2.25]">
          <a
            href={p.href}
            aria-label={p.title}
            className="group relative flex h-[360px] w-full flex-col overflow-hidden bg-navy text-white outline-none sm:h-[460px] lg:h-full"
          >
            <img
              src={p.img}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-[1500ms] ease-out lg:group-hover:scale-[1.04] lg:group-focus-visible:scale-[1.04]"
            />
            {/* blue veil */}
            <div className="absolute inset-0 bg-[rgba(11,67,135,0.7)] transition-opacity duration-[900ms] lg:group-hover:opacity-0 lg:group-focus-visible:opacity-0" />

            {/* title on the veil */}
            <h3 className="absolute inset-x-0 bottom-0 px-6 pb-8 text-[28px] font-bold leading-[0.8] transition-[opacity,transform] duration-[900ms] lg:px-[calc(var(--u)*40)] lg:pb-[calc(var(--u)*68)] lg:text-[calc(var(--u)*32)] lg:group-hover:translate-y-4 lg:group-hover:opacity-0 lg:group-focus-visible:translate-y-4 lg:group-focus-visible:opacity-0">
              {p.title}
            </h3>

            {/* white caption (always on mobile, on hover on desktop) */}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-0 flex-col items-center bg-white px-6 py-5 text-center text-navy transition-[transform,opacity] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-[calc(var(--u)*164)] lg:translate-y-full lg:justify-center lg:px-[calc(var(--u)*50)] lg:py-0 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
              <p className="text-2xl font-bold leading-[0.9] text-brand-blue lg:text-[calc(var(--u)*32)]">{p.title}</p>
              <p className="mt-2 text-base leading-tight lg:mt-[calc(var(--u)*8)] lg:text-[calc(var(--u)*20)] lg:leading-none">{p.text}</p>
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
