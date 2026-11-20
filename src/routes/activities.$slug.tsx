import { createFileRoute, Link } from "@tanstack/react-router";
import { MainActivityView, SubActivityView } from "@/components/site/ActivityView";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { useActivityPage } from "@/lib/activities";

export const Route = createFileRoute("/activities/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${decodeURIComponent(params.slug).replace(/-/g, " ")} – קרן דניאלי` }],
  }),
  component: ActivityRoute,
});

/** Shown instantly while the data arrives: the page header is already there, the body is a soft placeholder. */
function PageSkeleton({ slug }: { slug: string }) {
  const title = decodeURIComponent(slug).replace(/-/g, " ");
  return (
    <>
      <PageHero title={title} crumbs={[{ label: "בית", href: "/" }, { label: "פעילויות", href: "/activities" }, { label: title }]} />
      <div className="relative -mt-[calc(var(--u)*92)] bg-[#eef8ff] px-[5%] pb-[100px] pt-[calc(var(--u)*140)]" aria-busy="true">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
          <div className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded-full bg-navy/10" />
            <div className="h-14 w-3/4 animate-pulse rounded-lg bg-navy/10" />
            <div className="h-4 w-full animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-navy/10" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-navy/10" />
          </div>
          <div className="aspect-[4/3] w-full animate-pulse bg-navy/10" />
        </div>
      </div>
    </>
  );
}

function ActivityRoute() {
  const { slug } = Route.useParams();
  const q = useActivityPage(slug);
  return (
    <SiteShell>
      {q.isLoading ? (
        <PageSkeleton slug={slug} />
      ) : !q.data ? (
        <div className="grid min-h-[70vh] place-items-center px-[5%] text-center">
          <div>
            <h1 className="text-5xl font-bold">העמוד לא נמצא</h1>
            <p className="mt-4 text-xl">ייתכן שהוא עדיין לא פורסם.</p>
            <Link to="/" className="mt-8 inline-block text-xl font-bold underline">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      ) : q.data.kind === "sub" ? (
        <SubActivityView page={q.data} />
      ) : (
        <MainActivityView page={q.data} />
      )}
    </SiteShell>
  );
}
