import { EnterFromCorner } from "./EnterFromCorner";
import { FoldHeading } from "./FoldHeading";
import { FxButton } from "./FxButton";
import { ParallaxDecor } from "./ParallaxDecor";
import { ScrollText } from "./ScrollText";
import { Eyebrow } from "./HomeHero";

const LINES = [
  'דניאלי זוננפלד ע"ה',
  'תשנ"ה-תשע"ה (1995-2015)',
  "הייתה שילוב מושלם של מעלות, כישרונות, ענווה ומידות תרומיות.",
  "דניאלי נלקחה מאתנו בחטף בשנת העשרים לחייה,",
  "והשאיר אחריה חלל גדול, אך גם דרך מאירה -",
  "להמשיך ולצעוד בה",
];

/** "על דניאלי": navy section, text on the right, portrait glued to the bottom edge. */
export function AboutDanielle() {
  return (
    <section
      data-dark=""
      id="about"
      aria-label="על דניאלי"
      className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(to_bottom,#082944_17%,#0c448a_93%)] text-white lg:block lg:h-[calc(var(--u)*806)]"
    >
      {/* Hearts: drift gently with / against the mouse */}
      <ParallaxDecor
        src="/images/home/decor-heart-outline.svg"
        depth={-1.1}
        phase={0}
        className="absolute hidden lg:block lg:left-[calc(var(--u)*225)] lg:top-[calc(var(--u)*237)] lg:w-[calc(var(--u)*247)]"
      />
      <ParallaxDecor
        src="/images/home/heart-fill-a.png"
        depth={1.5}
        phase={2}
        className="absolute hidden lg:block lg:left-[calc(var(--u)*1565)] lg:top-[calc(var(--u)*372)] lg:w-[calc(var(--u)*219)]"
        imgClassName="opacity-[0.6]"
      />
      <ParallaxDecor
        src="/images/home/heart-fill-b.png"
        depth={-1.7}
        phase={4}
        className="absolute hidden lg:block lg:left-[calc(var(--u)*1715)] lg:top-[calc(var(--u)*560)] lg:w-[calc(var(--u)*181)]"
        imgClassName="opacity-[0.5]"
      />

      {/* Text */}
      <div className="relative z-10 order-1 px-[5%] pt-[100px] lg:absolute lg:right-[calc(var(--u)*970)] lg:top-[calc(var(--u)*131)] lg:w-[calc(var(--u)*626)] lg:p-0">
        <Eyebrow>הרוח שממשיכה איתנו</Eyebrow>
        <h2 className="mt-6 text-[clamp(40px,11vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*39)] lg:text-[calc(var(--u)*64)]">
          <FoldHeading text="על דניאלי" />
        </h2>
        <div className="mt-6 text-2xl leading-[1.2] lg:mt-[calc(var(--u)*20)] lg:text-[calc(var(--u)*32)]">
          {LINES.map((l) => (
            <ScrollText key={l} as="p" text={l} start="top 88%" end="bottom 55%" />
          ))}
        </div>
        <div className="mt-10 lg:mt-[calc(var(--u)*47)]">
          <FxButton
            href="/danielle"
            variant="yellow"
            className="h-[58px] text-xl lg:h-[calc(var(--u)*58)] lg:w-[calc(var(--u)*206)] lg:text-[calc(var(--u)*20)] [&_.fx-label]:leading-none lg:[&_.fx-label]:px-0"
          >
            הסיפור של דניאלי ←
          </FxButton>
        </div>
      </div>

      {/* Portrait: runs to the bottom edge and slips under the next section's curve (no gap) */}
      <EnterFromCorner
        src="/images/home/danielle-about.webp"
        alt="דניאלי זוננפלד ע״ה"
        width={633}
        height={775}
        loading="lazy"
        className="relative z-[1] order-2 mx-auto mt-10 block w-[80%] max-w-[420px] lg:absolute lg:left-[calc(var(--u)*1127)] lg:top-[calc(var(--u)*10)] lg:mx-0 lg:mt-0 lg:w-[calc(var(--u)*660)] lg:max-w-none lg:rotate-[1.84deg] lg:origin-top"
      />

      <div className="pointer-events-none relative z-[2] order-3 -mt-px h-10 bg-[#eef8ff] lg:hidden" />
    </section>
  );
}
