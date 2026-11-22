import { createFileRoute } from "@tanstack/react-router";
import { ActivityPanels } from "@/components/site/ActivityPanels";
import { FoldHeading } from "@/components/site/FoldHeading";
import { GlowSection } from "@/components/site/GlowSection";
import { Eyebrow } from "@/components/site/HomeHero";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/activities/")({
  head: () => ({ meta: [{ title: "פעילויות – קרן דניאלי" }] }),
  component: ActivitiesIndex,
});

/** Same four panels and headings as the "ממשיכים את הטוב" section on the home page. */
function ActivitiesIndex() {
  return (
    <SiteShell>
      <PageHero title="פעילויות" crumbs={[{ label: "בית", href: "/" }, { label: "פעילויות" }]} />
      <GlowSection curveTop aria-label="פעילות הקרן" className="pb-[100px] pt-[100px]">
        <div className="px-[5%]">
          <Eyebrow>פעילות הקרן</Eyebrow>
          <h2 className="mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]">
            <FoldHeading text="ממשיכים את הטוב" />
          </h2>
        </div>
        <div className="mt-10 lg:mt-[calc(var(--u)*73)]">
          <ActivityPanels />
        </div>
      </GlowSection>
    </SiteShell>
  );
}
