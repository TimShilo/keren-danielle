import { createFileRoute } from "@tanstack/react-router";
import { Band } from "@/components/site/Band";
import { CategoryCard } from "@/components/site/CategoryCard";
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
        <ul className="mx-auto grid max-w-[1400px] gap-5 px-[5%] pb-[100px] pt-[calc(var(--u)*110)] sm:grid-cols-2">
          {(q.data ?? []).map((m) => (
            <li key={m.href}>
              <CategoryCard name={m.name} href={m.href} subs={m.subs} />
            </li>
          ))}
        </ul>
      </Band>
    </SiteShell>
  );
}
