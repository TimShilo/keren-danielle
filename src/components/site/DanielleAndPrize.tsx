import { FoldHeading } from "./FoldHeading";
import { RevealStripes } from "./RevealStripes";
import { ScrollText } from "./ScrollText";

interface Card {
  href: string;
  titleLines: string[];
  text: string;
  img: string;
  alt: string;
  /** design coordinates on the 1920-wide canvas (the navy band is 371 → 1783) */
  photo: { left: number; top: number };
  /** yellow corner position relative to the photo */
  bracket: { left: number; top: number };
  textRight: number;
  textTop: number;
}

const CARDS: Card[] = [
  {
    href: "/danielle",
    titleLines: ["דניאלי", "מאז ומתמיד"],
    text: "דניאלי, נולדה בריו דה ז'ניירו שבברזיל בב' באדר א' תשנ“ה (02/02/1995). כבר מקטנות ניתן היה להבחין בייחודיות שלה. בחיוכה, באהבת האדם שבה ובשמחת החיים המיוחדת –שבתה את ליבם של כל רואיה.",
    img: "/images/home/danielle-child.webp",
    alt: "דניאלי בילדותה",
    photo: { left: 1499, top: 121 },
    bracket: { left: 165, top: 223 },
    textRight: 1475,
    textTop: 172,
  },
  {
    href: "/prize",
    titleLines: ["פרס דניאלי", "לרפואה עם לב"],
    text: "הפרס בא להעריך ולהוקיר את האנושיות והשותפות האמיתית של הצוות הרפואי, עם המטופלים ובני משפחתם. ולהגביר את המודעות לחשיבות האהבה והאנושיות בשירותי הרפואה.",
    img: "/images/home/prize-award.webp",
    alt: "טקס פרס דניאלי לרפואה עם לב",
    photo: { left: 752, top: 121 },
    bracket: { left: 165, top: 223 },
    textRight: 715,
    textTop: 172,
  },
];

const u = (n: number) => `calc(var(--u) * ${n})`;

/** Navy "pill" with two linked cards: Danielle always / the Danielle Prize. */
export function DanielleAndPrize() {
  return (
    <div className="w-full">
      <div data-dark="" className="relative flex w-full flex-col gap-12 bg-navy px-[5%] py-12 text-white lg:block lg:h-[calc(var(--u)*613)] lg:bg-transparent lg:p-0">
        {/* the navy band: round left end at 371, runs to the right edge of the screen */}
        <div aria-hidden className="absolute hidden bg-navy lg:left-[calc(var(--u)*371)] lg:right-0 lg:top-0 lg:block lg:h-full lg:rounded-l-[calc(var(--u)*306.5)]" />
        {CARDS.map((c, idx) => (
          <a
            key={c.href}
            href={c.href}
            className="group flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8 lg:contents"
          >
            {/* photo + yellow corner */}
            <span
              className="relative order-1 block w-full max-w-[311px] shrink-0 lg:absolute lg:left-[var(--l)] lg:top-[var(--t)] lg:order-none lg:w-[calc(var(--u)*311)] lg:max-w-none"
              style={{ "--l": u(c.photo.left), "--t": u(c.photo.top) } as React.CSSProperties}
            >
              <RevealStripes
                src={c.img}
                alt={c.alt}
                stripes={6}
                aspect="311 / 370"
                className="transition-transform duration-500 ease-out group-hover:-translate-y-2"
              />
              <img
                src="/images/home/svg/bracket-yellow.svg"
                alt=""
                aria-hidden
                className="pointer-events-none absolute hidden max-w-none transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2 lg:left-[var(--l)] lg:top-[var(--t)] lg:block lg:h-[calc(var(--u)*157)] lg:w-[calc(var(--u)*156)]"
                style={{ "--l": u(c.bracket.left), "--t": u(c.bracket.top) } as React.CSSProperties}
              />
            </span>

            {/* text */}
            <span
              className="order-2 block w-full max-w-[420px] lg:absolute lg:right-[calc(100%-var(--r))] lg:top-[var(--t)] lg:order-none lg:w-[calc(var(--u)*176)] lg:max-w-none"
              style={{ "--r": u(c.textRight), "--t": u(c.textTop) } as React.CSSProperties}
            >
              <h3 className="whitespace-nowrap [&_.fold-text]:whitespace-nowrap! text-[28px] font-bold leading-[0.8] lg:text-[calc(var(--u)*32)]">
                {c.titleLines.map((l) => (
                  <span key={l} className="block">
                    <FoldHeading text={l} />
                  </span>
                ))}
              </h3>
              <ScrollText
                as="p"
                text={c.text}
                start="top 88%"
                end="bottom 60%"
                className="mt-5 text-lg leading-[1.05] lg:mt-[calc(var(--u)*16)] lg:text-[calc(var(--u)*20)]"
              />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
