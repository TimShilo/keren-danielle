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

/** Shown instantly while the data arrives: the page header is already there, the body is an empty light-blue area. */
function PageSkeleton({ slug }: { slug: string }) {
  const title = decodeURIComponent(slug).replace(/-/g, " ");
  return (
    <>
      <PageHero title={title} crumbs={[{ label: "בית", href: "/" }, { label: "פעילויות", href: "/activities" }, { label: title }]} />
      {/* nothing grey is drawn while loading: just the light-blue area, so pictures and text come in from scratch */}
      <div aria-busy="true" className="relative -mt-[calc(var(--u)*92)] min-h-[70vh] bg-[#eef8ff]" />
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
