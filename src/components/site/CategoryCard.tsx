import { GraduationCap, Hospital, ScrollText, Users, type LucideIcon } from "lucide-react";

/** Photos for sub-activities (by name); anything else falls back to the activity page's own image. */
export const SUB_PHOTOS: Record<string, string> = {
  "למענם": "/images/home/activities/sub-lemaanam.webp",
  "לב דניאלי בוני עולם": "/images/home/activities/sub-lev-bonei-olam.webp",
  "בת מלך": "/images/home/activities/sub-batmelech.webp",
  "מדרשת דניאלי": "/images/home/activities/sub-midreshet.webp",
  "JLE בית דניאלי": "/images/home/activities/sub-jle.webp",
  "קרן רעננה": "/images/home/activities/sub-raanana.webp",
  "בנועם דניאלי": "/images/home/activities/sub-noam.webp",
  "מיזמי קורונה": "/images/home/activities/sub-corona.webp",
  "בעקבות דניאלי": "/images/home/activities/sub-bekvot.webp",
  "בשביל דניאלי": "/images/home/activities/sub-bishvil.webp",
  "עשיה והנצחה": "/images/home/activities/sub-asiya.webp",
  "בדרכה של דניאלי": "/images/home/activities/sub-baderech.webp",
  "פרס דניאלי": "/images/home/activities/sub-prize.webp",
  "קליניקת דניאלי": "/images/home/activities/sub-clinic.webp",
};
/** Crop focus (CSS object-position) for photos that need it inside tall panels. */
export const SUB_PHOTO_POS: Record<string, string> = {
  "בת מלך": "40% 50%",
  "מדרשת דניאלי": "70% 50%",
  "JLE בית דניאלי": "55% 50%",
  "קרן רעננה": "50% 50%",
  "בנועם דניאלי": "78% 50%", // the speaker and the rabbis are on the right
  "מיזמי קורונה": "35% 50%", // the two men with the box
  "בעקבות דניאלי": "55% 50%", // the young woman
  "בשביל דניאלי": "40% 50%",
  "עשיה והנצחה": "70% 50%", // the teacher is on the right
  "בדרכה של דניאלי": "50% 100%", // show the girls, less of the wall above
  "למענם": "6% 50%", // keep the elderly man in frame
  "פרס דניאלי": "50% 100%", // show the people, less of the painting above
};
/** Crop focus once the panel is expanded: favour the people (bottom of the photo), less background above. */
export const SUB_PHOTO_POS_OPEN: Record<string, string> = {
  "בת מלך": "50% 0%",
  "מדרשת דניאלי": "50% 25%",
  "JLE בית דניאלי": "50% 40%",
  "קרן רעננה": "50% 70%",
  "בנועם דניאלי": "50% 20%",
  "מיזמי קורונה": "50% 30%",
  "בעקבות דניאלי": "50% 15%",
  "בשביל דניאלי": "50% 0%",
  "עשיה והנצחה": "50% 25%",
  "קליניקת דניאלי": "50% 80%",
  "לב דניאלי בוני עולם": "50% 55%", // keep the standing speaker's head in frame
  "למענם": "50% 30%", // keep the elderly man's head in frame
};
export const MAIN_ICONS: Record<string, LucideIcon> = {
  "בריאות ורפואה": Hospital,
  "חינוך ולמידה": GraduationCap,
  "רווחה וקהילה": Users,
  "מסורת וחברה": ScrollText,
};

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
export function CategoryCard({
  name,
  href,
  subs = [],
  image,
  icon,
}: {
  name: string;
  href: string;
  subs?: string[];
  /** overrides the built-in photo of the main categories */
  image?: string | undefined;
  icon?: LucideIcon | undefined;
}) {
  const meta = BY_NAME[name];
  const Icon = icon ?? meta?.Icon ?? ScrollText;
  const photo = image ?? meta?.img;
  return (
    <a
      href={href}
      className="group relative block aspect-square w-full overflow-hidden bg-navy text-white outline-none"
      aria-label={name}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
        />
      ) : (
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,#082944,#0c448a)]" />
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
      {subs.length > 0 && (
      <ul className="absolute inset-x-0 top-[calc(50%+34px)] flex flex-col items-center gap-1 px-6 text-center text-lg leading-[1.4] transition-[opacity,transform] duration-500 group-hover:translate-y-3 group-hover:opacity-0 group-focus-visible:translate-y-3 group-focus-visible:opacity-0 lg:text-[calc(var(--u)*20)]">
        {subs.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      )}
    </a>
  );
}
