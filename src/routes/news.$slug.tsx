import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Facebook, Link2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { GlowSection } from "@/components/site/GlowSection";
import { PageHero } from "@/components/site/PageHero";
import { RevealStripes } from "@/components/site/RevealStripes";
import { SiteShell } from "@/components/site/SiteShell";
import { useNewsPost, type NewsPost } from "@/lib/news-post";

export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${decodeURIComponent(params.slug).replace(/-/g, " ")} – קרן דניאלי` }] }),
  component: NewsRoute,
});

const SHARE_BTN =
  "grid size-11 cursor-pointer place-items-center rounded-full bg-white/15 text-white transition-colors duration-300 hover:bg-brand-yellow hover:text-navy";

function SharePanel({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.href), []);
  const u = encodeURIComponent(url);
  return (
    <div className="flex h-full flex-col justify-between bg-[linear-gradient(to_bottom,#082944_26%,#0c448a_95%)] px-8 py-10 text-center text-white lg:py-[calc(var(--u)*50)] lg:pl-[calc(var(--u)*150)] lg:pr-[calc(var(--u)*50)]">
      <h2 className="text-[clamp(26px,5vw,40px)] font-bold leading-[1.15] lg:text-[calc(var(--u)*40)]">{title}</h2>
      <div className="my-8 flex items-center gap-4" aria-hidden>
        <span className="h-0.5 flex-1 bg-white" />
        <img src="/images/home/black-bird.svg" alt="" className="w-7 brightness-0 invert" />
        <span className="h-0.5 flex-1 bg-white" />
      </div>
      <div>
        <p className="text-lg lg:text-[calc(var(--u)*22)]">שיתוף</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <a className={SHARE_BTN} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label="שיתוף בפייסבוק">
            <Facebook className="size-5" />
          </a>
          <a className={SHARE_BTN} href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="שיתוף בוואטסאפ">
            <MessageCircle className="size-5" />
          </a>
          <button
            type="button"
            className={SHARE_BTN}
            aria-label="העתקת קישור"
            onClick={() => {
              void navigator.clipboard?.writeText(url).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            <Link2 className="size-5" />
          </button>
        </div>
        <p aria-live="polite" className="mt-2 h-5 text-sm text-brand-yellow">
          {copied ? "הקישור הועתק" : ""}
        </p>
      </div>
    </div>
  );
}

function PostView({ post }: { post: NewsPost }) {
  const crumbs = [
    { label: "בית", href: "/" },
    { label: "חדשות ועדכונים", href: "/news" },
    ...(post.sub ? [{ label: post.sub.name, href: post.sub.href }] : []),
    { label: post.title },
  ];
  const date = post.date ? new Date(post.date).toLocaleDateString("he-IL") : "";
  return (
    <>
      <PageHero title={post.title} crumbs={crumbs} />
      <GlowSection curveTop aria-label={post.title} className="px-[5%] pb-[100px] pt-[100px]">
        {/* 70vw wide, flush with the right edge of the screen; the left end is a half circle */}
        <div className={`grid items-stretch gap-0 overflow-hidden lg:-mr-[5vw] lg:w-[70vw] lg:rounded-l-full ${post.image ? "lg:grid-cols-2" : "lg:min-h-[26vw]"}`}>
          {post.image && (
            <RevealStripes src={post.image} alt={post.title} className="w-full" />
          )}
          <SharePanel title={post.title} />
        </div>

        {(date || post.sub) && (
          <p className="mt-10 flex flex-wrap items-center justify-center gap-x-4 text-lg text-navy lg:text-[calc(var(--u)*20)]">
            {post.sub && (
              <a href={post.sub.href} className="font-bold underline-offset-4 hover:underline">
                {post.sub.name}
              </a>
            )}
            {date && <span>{date}</span>}
          </p>
        )}

        <div
          className="rte-content mx-auto mt-8 max-w-[1100px] text-lg leading-[1.6] text-navy lg:mt-[calc(var(--u)*40)] lg:text-[calc(var(--u)*22)] [&_img]:mx-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {(post.prev || post.next) && (
          <nav aria-label="חדשות נוספות" className="mx-auto mt-[100px] grid max-w-[1500px] gap-6 sm:grid-cols-[1fr_auto_1fr] sm:gap-0">
            {post.prev ? (
              <a href={post.prev.href} className="group flex items-center gap-4 text-navy">
                <ChevronRight className="size-6 shrink-0 text-navy/50 transition-colors group-hover:text-brand-yellow" />
                <span>
                  <span className="block text-base">הקודם</span>
                  <span className="block text-xl font-bold transition-colors group-hover:text-[#b99a00]">{post.prev.title}</span>
                </span>
              </a>
            ) : (
              <span />
            )}
            <span aria-hidden className="mx-8 hidden w-0.5 bg-brand-yellow sm:block" />
            {post.next ? (
              <a href={post.next.href} className="group flex items-center justify-end gap-4 text-end text-navy">
                <span>
                  <span className="block text-base">הבא</span>
                  <span className="block text-xl font-bold transition-colors group-hover:text-[#b99a00]">{post.next.title}</span>
                </span>
                <ChevronLeft className="size-6 shrink-0 text-navy/50 transition-colors group-hover:text-brand-yellow" />
              </a>
            ) : (
              <span />
            )}
          </nav>
        )}
      </GlowSection>
    </>
  );
}

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
