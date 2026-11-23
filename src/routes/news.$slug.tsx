import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { PostView } from "@/components/site/PostPage";
import { SiteShell } from "@/components/site/SiteShell";
import { useNewsPost } from "@/lib/news-post";

export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${decodeURIComponent(params.slug).replace(/-/g, " ")} – קרן דניאלי` }] }),
  component: NewsRoute,
});

function NewsRoute() {
  const { slug } = Route.useParams();
  const q = useNewsPost(slug);
  const title = decodeURIComponent(slug).replace(/-/g, " ");
  return (
    <SiteShell>
      {q.isLoading ? (
        <>
          <PageHero title={title} crumbs={[{ label: "בית", href: "/" }, { label: "חדשות ועדכונים", href: "/news" }, { label: title }]} />
          <div aria-busy="true" className="relative -mt-[calc(var(--u)*92)] min-h-[70vh] bg-[#eef8ff]" />
        </>
      ) : !q.data ? (
        <div className="grid min-h-[70vh] place-items-center px-[5%] text-center">
          <div>
            <h1 className="text-[50px] font-bold">הכתבה לא נמצאה</h1>
            <p className="mt-4 text-xl">ייתכן שהיא עדיין לא פורסמה.</p>
            <Link to="/" className="mt-8 inline-block text-xl font-bold underline">
              חזרה לדף הבית
            </Link>
          </div>
        </div>
      ) : (
        <PostView post={q.data} />
      )}
    </SiteShell>
  );
}
