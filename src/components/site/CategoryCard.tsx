import { GraduationCap, Hospital, ScrollText, Users, type LucideIcon } from "lucide-react";

const BY_NAME: Record<string, { img: string; Icon: LucideIcon }> = {
  "בריאות ורפואה": { img: "/images/home/activities/cat-health.webp", Icon: Hospital },
  "חינוך ולמידה": { img: "/images/home/activities/cat-education.webp", Icon: GraduationCap },
  "רווחה וקהילה": { img: "/images/home/activities/cat-society.webp", Icon: Users },
  "מסורת וחברה": { img: "/images/home/activities/cat-judaism.webp", Icon: ScrollText },
};

/**
 * Square category card: photo under a #0B4387 veil (70%) with the title and the sub-activities.
 * On hover the veil slides down into a 48px strip (title + icon in white) and the photo shows.
 */
export function CategoryCard({ name, href, subs }: { name: string; href: string; subs: string[] }) {
  const meta = BY_NAME[name];
  const Icon = meta?.Icon ?? ScrollText;
  return (
    <a
      href={href}
      className="group relative block aspect-square w-full overflow-hidden bg-navy text-white outline-none"
      aria-label={name}
    >
      {meta && (
        <img
          src={meta.img}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
        />
      )}

      {/* the veil: full cover, drops to a 48px strip on hover */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[#0B4387]/70 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[calc(100%-48px)] group-focus-visible:translate-y-[calc(100%-48px)]"
      />

      {/* title + icon: centred on the card, slides down onto the strip on hover */}
      <h2 className="absolute inset-x-0 top-1/2 flex h-12 -translate-y-1/2 items-center justify-center gap-3 px-4 text-[28px] font-bold leading-none transition-[top,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:top-[calc(100%-24px)] group-focus-visible:top-[calc(100%-24px)] lg:text-[calc(var(--u)*32)]">
        <Icon aria-hidden className="size-7 shrink-0" />
        {name}
      </h2>

      {/* sub-activities under the title (fade out on hover) */}
      <ul className="absolute inset-x-0 top-[calc(50%+34px)] flex flex-col items-center gap-1 px-6 text-center text-lg leading-[1.4] transition-[opacity,transform] duration-500 group-hover:translate-y-3 group-hover:opacity-0 group-focus-visible:translate-y-3 group-focus-visible:opacity-0 lg:text-[calc(var(--u)*20)]">
        {subs.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </a>
  );
}
