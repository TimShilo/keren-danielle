import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { PostView } from "@/components/site/PostPage";
import { SiteShell } from "@/components/site/SiteShell";
import { useNewsPost } from "@/lib/news-post";

export const Route = createFileRoute("/danielle/friends/$slug")({
  head: () => ({ meta: [{ title: "חברים כותבים על דניאלי – קרן דניאלי" }] }),
  component: FriendRoute,
});

const CRUMBS = [
  { label: "בית", href: "/" },
  { label: "אודות", href: "/about" },
  { label: 'על דניאלי ע"ה', href: "/danielle" },
  { label: "חברים כותבים על דניאלי", href: "/danielle/friends" },
];

function FriendRoute() {
  const { slug } = Route.useParams();
  const q = useNewsPost(slug, "friend");
  return (
    <SiteShell>
      {q.isLoading ? (
        <>
          <PageHero title="חברים כותבים על דניאלי" crumbs={CRUMBS} />
          <div aria-busy="true" className="relative -mt-[calc(var(--u)*92)] min-h-[70vh] bg-[#eef8ff]" />
        </>
      ) : !q.data ? (
        <div className="grid min-h-[70vh] place-items-center px-[5%] text-center">
          <div>
            <h1 className="text-[50px] font-bold">הסיפור לא נמצא</h1>
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
