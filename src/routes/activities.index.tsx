import { createFileRoute } from "@tanstack/react-router";
import { Band } from "@/components/site/Band";
import { PageHero } from "@/components/site/PageHero";
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
      <PageHero title="פעילויות" crumbs={[{ label: "בית", href: "/" }, { label: "פעילויות" }]} />
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
