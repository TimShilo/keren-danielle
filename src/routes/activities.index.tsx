import { createFileRoute } from "@tanstack/react-router";
import { Band } from "@/components/site/Band";
import { FoldHeading } from "@/components/site/FoldHeading";
import { Eyebrow } from "@/components/site/HomeHero";
import { SiteShell } from "@/components/site/SiteShell";
import { useActivitiesOverview } from "@/lib/activities";

export const Route = createFileRoute("/activities/")({
  head: () => ({ meta: [{ title: "פעילויות – קרן דניאלי" }] }),
  component: ActivitiesIndex,
});

function ActivitiesIndex() {
  const q = useActivitiesOverview();
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-[linear-gradient(to_bottom,#082944_26%,#0c448a_95%)] px-[5%] pb-[calc(var(--u)*150)] pt-36 text-white lg:pt-[calc(var(--u)*230)]">
        <Eyebrow>פעילות הקרן</Eyebrow>
        <h1 className="mt-4 text-[clamp(40px,10vw,64px)] font-bold leading-[1.05] lg:mt-[calc(var(--u)*24)] lg:text-[calc(var(--u)*64)]">
          <FoldHeading text="פעילויות" trigger="mount" />
        </h1>
      </section>
      <Band tone="white" curveTop>
        <ul className="grid gap-8 px-[5%] pb-[100px] pt-[calc(var(--u)*40)] sm:grid-cols-2">
          {(q.data ?? []).map((m) => (
            <li key={m.href}>
              <a href={m.href} className="block rounded-[25px] bg-white p-8 text-navy shadow-[4px_4px_9px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1">
                <h2 className="text-[32px] font-bold leading-[1.2]">{m.name}</h2>
                <ul className="mt-4 space-y-1 text-xl">
                  {m.subs.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </a>
            </li>
          ))}
        </ul>
      </Band>
    </SiteShell>
  );
}
