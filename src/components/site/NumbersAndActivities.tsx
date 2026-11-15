import { ActivityPanels } from "./ActivityPanels";
import { BirdFlock } from "./BirdFlock";
import { CountUp } from "./CountUp";
import { FoldHeading } from "./FoldHeading";
import { GlowSection } from "./GlowSection";
import { Eyebrow } from "./HomeHero";

const STATS = [
  { label: "שנים של פעילות", node: <CountUp end={11} prefix="+" /> },
  { label: "מקבלי שרות", node: <CountUp end={31500} prefix="+" grouped /> },
  { label: "מיזמים", node: <CountUp end={143} prefix="+" /> },
  { label: "ממליצים לפרס דניאלי", node: <CountUp end={3.6} decimals={1} suffix="M" /> },
];

/** "המספרים שמאחורי הקרן" + "ממשיכים את הטוב" on the light-blue glow background. */
export function NumbersAndActivities() {
  return (
    <GlowSection id="numbers" aria-label="המספרים שמאחורי הקרן" className="py-[100px]">
      <BirdFlock />

      {/* Numbers */}
      <div className="relative z-10 px-[5%] text-center">
        <Eyebrow className="justify-center">המספרים מספרים</Eyebrow>
        <h2 className="mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]">
          <FoldHeading text="המספרים שמאחורי הקרן" />
        </h2>
        <dl className="mx-auto mt-12 grid max-w-[1320px] grid-cols-2 gap-x-6 gap-y-10 text-start lg:mt-[calc(var(--u)*82)] lg:flex lg:max-w-none lg:justify-between lg:gap-0 lg:px-[calc(var(--u)*326)]">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col-reverse leading-[1.3]">
              <dt className="mt-1 text-lg text-ink lg:text-[calc(var(--u)*24)]">{s.label}</dt>
              <dd className="text-[32px] font-bold text-brand-blue lg:text-[calc(var(--u)*36)]">{s.node}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Activities */}
      <div className="relative z-10 mt-20 lg:mt-[calc(var(--u)*105)]">
        <div className="px-[5%]">
          <Eyebrow>פעילות הקרן</Eyebrow>
          <h2 className="mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]">
            <FoldHeading text="ממשיכים את הטוב" />
          </h2>
        </div>
        <div className="mt-10 lg:mt-[calc(var(--u)*73)]">
          <ActivityPanels />
        </div>
      </div>
    </GlowSection>
  );
}
