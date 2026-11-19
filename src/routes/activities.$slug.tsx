import { createFileRoute, Link } from "@tanstack/react-router";
import { MainActivityView, SubActivityView } from "@/components/site/ActivityView";
import { SiteShell } from "@/components/site/SiteShell";
import { useActivityPage } from "@/lib/activities";

export const Route = createFileRoute("/activities/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${decodeURIComponent(params.slug).replace(/-/g, " ")} – קרן דניאלי` }],
  }),
  component: ActivityRoute,
});

function ActivityRoute() {
  const { slug } = Route.useParams();
  const q = useActivityPage(slug);
  return (
    <SiteShell>
      {q.isLoading ? (
        <div className="grid min-h-[70vh] place-items-center text-2xl text-navy">טוען…</div>
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
