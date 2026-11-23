import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { PostView } from "@/components/site/PostPage";
import { SiteShell } from "@/components/site/SiteShell";
import { useNewsPost } from "@/lib/news-post";

export const Route = createFileRoute("/press/$slug")({
  head: () => ({ meta: [{ title: "כתבו עלינו – קרן דניאלי" }] }),
  component: PressRoute,
});

const CRUMBS = [
  { label: "בית", href: "/" },
  { label: "כתבו עלינו", href: "/press" },
];

function PressRoute() {
  const { slug } = Route.useParams();
  const q = useNewsPost(slug, "press");
  return (
    <SiteShell>
      {q.isLoading ? (
        <>
          <PageHero title="כתבו עלינו" crumbs={CRUMBS} />
          <div aria-busy="true" className="relative -mt-[calc(var(--u)*92)] min-h-[70vh] bg-[#eef8ff]" />
        </>
      ) : !q.data ? (
        <div className="grid min-h-[70vh] place-items-center px-[5%] text-center">
          <div>
            <h1 className="text-[50px] font-bold">הכתבה לא נמצאה</h1>
            <Link to="/" className="mt-8 inline-block text-xl font-bold underline">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      ) : (
        <PostView post={q.data} crumbs={[...CRUMBS, { label: q.data.title }]} />
      )}
    </SiteShell>
  );
}
