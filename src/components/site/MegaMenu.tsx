import { useMegaMenu } from "@/lib/activities";
import { MAIN_ICONS } from "./CategoryCard";
import { ScrollText } from "lucide-react";

const THUMBS: Record<string, string> = {
  "בריאות ורפואה": "/images/home/activities/cat-health.webp",
  "חינוך ולמידה": "/images/home/activities/cat-education.webp",
  "רווחה וקהילה": "/images/home/activities/cat-society.webp",
  "מסורת וחברה": "/images/home/activities/cat-judaism.webp",
};

/** "פעילויות" mega menu: four columns, each with the main activity (photo, icon) and its sub-activities. */
export function MegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  const q = useMegaMenu();
  const groups = q.data ?? [];
  return (
    <div
      dir="rtl"
      className="grid grid-cols-4 gap-x-[calc(var(--u)*40)] px-[calc(var(--u)*96)] pb-[calc(var(--u)*40)] pt-[calc(var(--u)*130)]"
    >
      {groups.map((g) => {
        const Icon = MAIN_ICONS[g.name] ?? ScrollText;
        const thumb = THUMBS[g.name];
        return (
          <div key={g.href} className="min-w-0">
            <a
              href={g.href}
              onClick={onNavigate}
              className="group flex items-center gap-[calc(var(--u)*16)] text-white"
            >
              {thumb && (
                <img
                  src={thumb}
                  alt=""
                  loading="lazy"
                  className="size-[calc(var(--u)*72)] shrink-0 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <span className="flex min-w-0 items-center gap-[calc(var(--u)*10)] text-[calc(var(--u)*24)] font-bold leading-[1.15] transition-colors duration-300 group-hover:text-brand-yellow">
                <Icon aria-hidden className="size-[calc(var(--u)*26)] shrink-0" />
                {g.name}
              </span>
            </a>
            <ul className="mt-[calc(var(--u)*14)] space-y-[calc(var(--u)*6)] pe-[calc(var(--u)*88)]">
              {g.subs.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    onClick={onNavigate}
                    className="group/sub flex items-center gap-[calc(var(--u)*10)] text-[calc(var(--u)*18)] leading-[1.35] text-white/90 transition-colors duration-300 hover:text-brand-yellow"
                  >
                    <Icon aria-hidden className="size-[calc(var(--u)*18)] shrink-0 opacity-80" />
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
