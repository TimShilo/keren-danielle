import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/content";
import { ICONS, mediaMap, strip, ytId, type NewsCardData, type VideoCardData } from "@/lib/home-feed";

export interface ActivityLink {
  name: string;
  slug: string;
  href: string;
}
export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  caption: string;
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}
export interface SubActivityPage {
  kind: "sub";
  title: string;
  sectionTitle: string;
  handwritingTitle: string;
  bodyHtml: string;
  excerpt: string;
  main: ActivityLink | null;
  sub: { name: string };
  headerImage: string;
  sideImage: string;
  heroImage: string;
  layout: { gallery: boolean; video: boolean; posts: boolean; team: boolean };
  gallery: GalleryItem[];
  videos: VideoCardData[];
  team: TeamMember[];
  news: NewsCardData[];
  newsHref: string;
}
export interface MainActivityPage {
  kind: "main";
  title: string;
  descriptionHtml: string;
  image: string;
  slug: string;
  subs: { name: string; slug: string; href: string | null; image: string; excerpt: string }[];
}
export type ActivityPage = SubActivityPage | MainActivityPage;

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
export const activityHref = (slug: string) => `/activities/${encodeURIComponent(slug)}`;

function cleanBody(html: string) {
  // Imported pages still carry Elementor wrappers; keep only the content.
  return html
    .replace(/<div class="elementor-element[^>]*>/g, "<div>")
    .replace(/\sdata-[a-z_-]+="[^"]*"/g, "")
    .trim();
}

async function loadNews(catId: string, cats: Pick<Category, "id" | "name_he" | "parent_id">[]): Promise<NewsCardData[]> {
  const { data: links } = await supabase.from("content_category_links").select("content_id").eq("category_id", catId);
  const ids = (links ?? []).map((l) => l.content_id as string);
  const base = supabase
    .from("content_items")
    .select("id,title,excerpt,body_html,slug,category_id,featured_media_id,item_date")
    .eq("type", "news")
    .eq("status", "published")
    .not("featured_media_id", "is", null)
    .order("item_date", { ascending: false, nullsFirst: false })
    .limit(12);
  const { data } = await (ids.length ? base.or(`category_id.eq.${catId},id.in.(${ids.join(",")})`) : base.eq("category_id", catId));
  const rows = (data ?? []) as Row[];
  const media = await mediaMap(rows.map((r) => str(r["featured_media_id"])));
  const mainName = (id: string | null) => {
    const c = cats.find((x) => x.id === id);
    const main = c?.parent_id ? cats.find((x) => x.id === c.parent_id) : c;
    return main?.name_he ?? "";
  };
  return rows.map((r) => {
    const category = mainName(str(r["category_id"]) || null);
    return {
      id: str(r["id"]),
      title: str(r["title"]),
      excerpt: (str(r["excerpt"]) || strip(str(r["body_html"]))).slice(0, 260),
      category,
      icon: ICONS[category] ?? "tradition",
      image: media.get(str(r["featured_media_id"])) ?? "",
      href: `/news/${str(r["slug"]) || str(r["id"])}`,
    };
  });
}

export function useActivityPage(slug: string) {
  return useQuery({
    queryKey: ["activity-page", slug],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ActivityPage | null> => {
      const { data: catsData } = await supabase.from("categories").select("id,name_he,slug,parent_id,description_html,featured_media_id,sort_order");
      const cats = (catsData ?? []) as (Pick<Category, "id" | "name_he" | "parent_id"> & Row)[];

      // 1) a sub-activity page (content item of type "activity")
      const { data: item } = await supabase
        .from("content_items")
        .select("id,title,slug,excerpt,body_html,category_id,featured_media_id,data")
        .eq("type", "activity")
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();
      if (item) {
        const d = ((item as Row)["data"] ?? {}) as Row;
        const layout = (d["layout"] ?? {}) as Row;
        const on = (k: string) => layout[k] === "true" || layout[k] === true;
        const cat = cats.find((c) => c.id === (item as Row)["category_id"]);
        const mainCat = cat?.parent_id ? cats.find((c) => c.id === cat.parent_id) : undefined;
        const id = str((item as Row)["id"]);
        const [g, v, t] = await Promise.all([
          supabase.from("content_media").select("media_id,title,caption,sort_order").eq("content_id", id).eq("role", "gallery").order("sort_order"),
          supabase.from("content_videos").select("id,title,url,sort_order").eq("content_id", id).order("sort_order"),
          supabase.from("content_team").select("id,name,role,media_id,sort_order").eq("content_id", id).order("sort_order"),
        ]);
        const mediaIds = [
          str((item as Row)["featured_media_id"]),
          str(d["header_media_id"]),
          str(d["side_media_id"]),
          ...(g.data ?? []).map((x) => str(x.media_id)),
          ...(t.data ?? []).map((x) => str(x.media_id)),
        ].filter(Boolean);
        const media = await mediaMap([...new Set(mediaIds)]);
        const news = cat ? await loadNews(str(cat.id), cats) : [];
        const featured = media.get(str((item as Row)["featured_media_id"])) ?? "";
        return {
          kind: "sub",
          title: str((item as Row)["title"]),
          sectionTitle: str(d["section_title"]),
          handwritingTitle: str(d["handwriting_title"]),
          bodyHtml: cleanBody(str((item as Row)["body_html"])),
          excerpt: str((item as Row)["excerpt"]),
          main: mainCat ? { name: mainCat.name_he, slug: str(mainCat["slug"]), href: activityHref(str(mainCat["slug"])) } : null,
          sub: { name: cat?.name_he ?? str((item as Row)["title"]) },
          headerImage: media.get(str(d["header_media_id"])) ?? "",
          sideImage: media.get(str(d["side_media_id"])) ?? featured,
          heroImage: media.get(str(d["header_media_id"])) ?? featured,
          layout: { gallery: on("gallery_switcher"), video: on("video_switcher"), posts: on("posts_switcher"), team: on("team") },
          gallery: (g.data ?? []).flatMap((x) => {
            const image = media.get(str(x.media_id));
            return image ? [{ id: `${str(x.media_id)}-${str(x.sort_order)}`, image, title: str(x.title), caption: str(x.caption) }] : [];
          }),
          videos: (v.data ?? [])
            .map((x) => ({ id: str(x.id), title: str(x.title).trim(), youtubeId: ytId(str(x.url)) }))
            .filter((x) => x.youtubeId),
          team: (t.data ?? []).map((x) => ({ id: str(x.id), name: str(x.name), role: str(x.role), image: media.get(str(x.media_id)) ?? "" })),
          news,
          newsHref: "/news",
        };
      }

      // 2) a main activity page (top-level category)
      const main = cats.find((c) => !c.parent_id && c["slug"] === slug);
      if (!main) return null;
      const subsCats = cats.filter((c) => c.parent_id === main.id).sort((a, b) => Number(a["sort_order"] ?? 0) - Number(b["sort_order"] ?? 0));
      const { data: pages } = await supabase
        .from("content_items")
        .select("slug,excerpt,category_id,featured_media_id")
        .eq("type", "activity")
        .eq("status", "published")
        .in("category_id", subsCats.map((c) => c.id));
      const pageRows = (pages ?? []) as Row[];
      const media = await mediaMap(
        [...new Set([str(main["featured_media_id"]), ...pageRows.map((p) => str(p["featured_media_id"]))].filter(Boolean))],
      );
      return {
        kind: "main",
        title: main.name_he,
        descriptionHtml: str(main["description_html"]),
        image: media.get(str(main["featured_media_id"])) ?? "",
        slug,
        subs: subsCats.map((c) => {
          const page = pageRows.find((p) => p["category_id"] === c.id);
          return {
            name: c.name_he,
            slug: str(c["slug"]),
            href: page ? activityHref(str(page["slug"])) : null,
            image: page ? media.get(str(page["featured_media_id"])) ?? "" : "",
            excerpt: page ? strip(str(page["excerpt"])) : "",
          };
        }),
      };
    },
  });
}

export function useActivitiesOverview() {
  return useQuery({
    queryKey: ["activities-overview"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name_he,slug,parent_id,sort_order").order("sort_order");
      const cats = (data ?? []) as (Pick<Category, "id" | "name_he" | "parent_id"> & Row)[];
      return cats
        .filter((c) => !c.parent_id)
        .map((m) => ({
          name: m.name_he,
          href: activityHref(str(m["slug"])),
          subs: cats.filter((c) => c.parent_id === m.id).map((c) => c.name_he),
        }));
    },
  });
}
