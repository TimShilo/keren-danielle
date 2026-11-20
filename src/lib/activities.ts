import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/media";
import type { Category } from "@/lib/content";
import { ICONS, strip, ytId, type NewsCardData, type VideoCardData } from "@/lib/home-feed";

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
  logo: { src: string; alt: string } | null;
  layout: { gallery: boolean; video: boolean; posts: boolean; team: boolean };
  /** optional second block of the page ("more"): its own heading and rich text */
  more: { title: string; html: string } | null;
  /** optional per-page choice of the body backgrounds, in order: "glow" | "white" | "dark" */
  tones: string[];
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
/** Hand-picked picture (and optional small partner logo under the title) for specific pages, by page slug. */
export const PAGE_OVERRIDES: Record<string, { image?: string; logo?: { src: string; alt: string } }> = {
  "לב-דניאלי": { image: "/images/home/activities/page-lev-daniel.webp", logo: { src: "/images/home/logos/bonei-olam.webp", alt: "בוני עולם" } },
  "פרס-דניאלי": { image: "/images/home/activities/page-prize.webp" },
  "בשביל-דניאלי": { image: "/images/home/activities/page-bishvil.webp", logo: { src: "/images/home/logos/bishvil.webp", alt: "בשביל דניאלי" } },
  "בת-מלך": { image: "/images/home/activities/page-bat-melech.webp", logo: { src: "/images/home/logos/bat-melech.webp", alt: "בת מלך" } },
  "לזכר-דניאלי": { image: "/images/home/activities/page-lezecher.webp", logo: { src: "/images/home/logos/tikva.webp", alt: "תקות דניאלי" } },
  "מדרשת-דניאלי": { image: "/images/home/activities/page-midrasha.webp", logo: { src: "/images/home/logos/midrasha.webp", alt: "מדרשת דניאלי" } },
  "קרן-רעננה": { image: "/images/home/activities/page-raanana.webp", logo: { src: "/images/home/logos/raanana.webp", alt: "קרן רעננה" } },
  "עשייה-והנצחה": { logo: { src: "/images/home/logos/hantzacha.webp", alt: "עשיה והנצחה" } },
};

export const activityHref = (slug: string) => `/activities/${encodeURIComponent(slug)}`;

function cleanBody(html: string) {
  // Imported pages still carry Elementor wrappers; keep only the content.
  return html
    .replace(/<div class="elementor-element[^>]*>/g, "<div>")
    .replace(/\sdata-[a-z_-]+="[^"]*"/g, "")
    .trim();
}

type Cat = Pick<Category, "id" | "name_he" | "parent_id"> & Row;
const NEWS_COLS = "id,title,excerpt,body_html,slug,category_id,item_date,featured:media!featured_media_id(storage_path)";
const pathUrl = (m: unknown) => {
  const path = m && typeof m === "object" ? str((m as Row)["storage_path"]) : "";
  return path ? mediaUrl(path) : "";
};

/** Card photo fallback: the first picture inside the post text. */
const firstBodyImage = (html: string) => /<img[^>]+src="([^"]+)"/i.exec(html)?.[1] ?? "";

/** News of one sub-activity: posts filed under it + posts linked to it as a secondary category (2 parallel queries). */
async function loadNews(catId: string, cats: Cat[]): Promise<NewsCardData[]> {
  const [own, linked] = await Promise.all([
    supabase
      .from("content_items")
      .select(NEWS_COLS)
      .eq("type", "news")
      .eq("status", "published")
      .eq("category_id", catId)
      .order("item_date", { ascending: false, nullsFirst: false })
      .limit(60),
    supabase
      .from("content_category_links")
      .select(`content_items!inner(${NEWS_COLS},type,status,featured_media_id)`)
      .eq("category_id", catId)
      .eq("content_items.type", "news")
      .eq("content_items.status", "published")
      .limit(60),
  ]);
  const rows = new Map<string, Row>();
  for (const r of (own.data ?? []) as Row[]) rows.set(str(r["id"]), r);
  for (const l of (linked.data ?? []) as Row[]) {
    const it = l["content_items"] as Row | null;
    if (it) rows.set(str(it["id"]), it);
  }
  const mainName = (id: string | null) => {
    const c = cats.find((x) => x.id === id);
    const main = c?.parent_id ? cats.find((x) => x.id === c.parent_id) : c;
    return main?.name_he ?? "";
  };
  return [...rows.values()]
    .sort((a, b) => str(b["item_date"]).localeCompare(str(a["item_date"])))
    .slice(0, 60)
    .map((r) => {
      const category = mainName(str(r["category_id"]) || null);
      return {
        id: str(r["id"]),
        title: str(r["title"]),
        excerpt: (str(r["excerpt"]) || strip(str(r["body_html"]))).slice(0, 260),
        category,
        icon: ICONS[category] ?? "tradition",
        image: pathUrl(r["featured"]) || firstBodyImage(str(r["body_html"])),
        href: `/news/${str(r["slug"]) || str(r["id"])}`,
      };
    });
}

export async function fetchActivityPage(slug: string): Promise<ActivityPage | null> {
  // Round trip 1 (parallel): all categories + the page item (with its main photo)
  const [catsRes, itemRes] = await Promise.all([
    supabase.from("categories").select("id,name_he,slug,parent_id,description_html,featured_media_id,sort_order"),
    supabase
      .from("content_items")
      .select("id,title,slug,excerpt,body_html,category_id,data,featured:media!featured_media_id(storage_path)")
      .eq("type", "activity")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle(),
  ]);
  const cats = (catsRes.data ?? []) as Cat[];
  const item = itemRes.data as Row | null;

  // Round trip 2 (parallel): everything the page shows
  if (item) {
    const d = (item["data"] ?? {}) as Row;
    const layout = (d["layout"] ?? {}) as Row;
    const on = (k: string) => layout[k] === "true" || layout[k] === true;
    const cat = cats.find((c) => c.id === item["category_id"]);
    const mainCat = cat?.parent_id ? cats.find((c) => c.id === cat.parent_id) : undefined;
    const id = str(item["id"]);
    const extraMedia = [str(d["header_media_id"]), str(d["side_media_id"])].filter(Boolean);
    const [g, v, t, extra, news] = await Promise.all([
      supabase.from("content_media").select("media_id,title,caption,sort_order,media(storage_path)").eq("content_id", id).eq("role", "gallery").order("sort_order"),
      supabase.from("content_videos").select("id,title,url,sort_order").eq("content_id", id).order("sort_order"),
      supabase.from("content_team").select("id,name,role,sort_order,media(storage_path)").eq("content_id", id).order("sort_order"),
      extraMedia.length ? supabase.from("media").select("id,storage_path").in("id", extraMedia) : Promise.resolve({ data: [] as Row[] }),
      cat ? loadNews(str(cat.id), cats) : Promise.resolve([] as NewsCardData[]),
    ]);
    const extraMap = new Map(((extra.data ?? []) as Row[]).map((m) => [str(m["id"]), mediaUrl(str(m["storage_path"]))]));
    const featured = pathUrl(item["featured"]);
    const moreHtml = str(d["intro_more_html"]).trim();
    return {
      kind: "sub",
      title: str(item["title"]),
      sectionTitle: str(d["section_title"]),
      handwritingTitle: str(d["handwriting_title"]),
      bodyHtml: cleanBody(str(item["body_html"])),
      excerpt: str(item["excerpt"]),
      main: mainCat ? { name: mainCat.name_he, slug: str(mainCat["slug"]), href: activityHref(str(mainCat["slug"])) } : null,
      sub: { name: cat?.name_he ?? str(item["title"]) },
      headerImage: extraMap.get(str(d["header_media_id"])) ?? "",
      sideImage: PAGE_OVERRIDES[slug]?.image ?? extraMap.get(str(d["side_media_id"])) ?? featured,
      heroImage: extraMap.get(str(d["header_media_id"])) ?? featured,
      logo: PAGE_OVERRIDES[slug]?.logo ?? null,
      more: moreHtml
        ? { title: `${str(d["section_title_more"])} ${str(d["handwriting_title_more"])}`.trim(), html: cleanBody(moreHtml) }
        : null,
      tones: Array.isArray(d["section_tones"]) ? (d["section_tones"] as unknown[]).map(String) : [],
      layout: { gallery: on("gallery_switcher"), video: on("video_switcher"), posts: on("posts_switcher"), team: on("team") },
      gallery: ((g.data ?? []) as Row[]).flatMap((x) => {
        const image = pathUrl(x["media"]);
        return image ? [{ id: `${str(x["media_id"])}-${str(x["sort_order"])}`, image, title: str(x["title"]), caption: str(x["caption"]) }] : [];
      }),
      videos: ((v.data ?? []) as Row[])
        .map((x) => ({ id: str(x["id"]), title: str(x["title"]).trim(), youtubeId: ytId(str(x["url"])) }))
        .filter((x) => x.youtubeId),
      team: ((t.data ?? []) as Row[]).map((x) => ({ id: str(x["id"]), name: str(x["name"]), role: str(x["role"]), image: pathUrl(x["media"]) })),
      news,
      newsHref: "/news",
    };
  }

  // a main activity page (top-level category)
  const main = cats.find((c) => !c.parent_id && c["slug"] === slug);
  if (!main) return null;
  const subsCats = cats.filter((c) => c.parent_id === main.id).sort((a, b) => Number(a["sort_order"] ?? 0) - Number(b["sort_order"] ?? 0));
  const [pages, mainMedia] = await Promise.all([
    supabase
      .from("content_items")
      .select("slug,excerpt,category_id,featured:media!featured_media_id(storage_path)")
      .eq("type", "activity")
      .eq("status", "published")
      .in("category_id", subsCats.map((c) => c.id)),
    str(main["featured_media_id"]) ? supabase.from("media").select("storage_path").eq("id", str(main["featured_media_id"])).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const pageRows = (pages.data ?? []) as Row[];
  return {
    kind: "main",
    title: main.name_he,
    descriptionHtml: str(main["description_html"]),
    image: mainMedia.data ? mediaUrl(str((mainMedia.data as Row)["storage_path"])) : "",
    slug,
    subs: subsCats.map((c) => {
      const page = pageRows.find((p) => p["category_id"] === c.id);
      return {
        name: c.name_he,
        slug: str(c["slug"]),
        href: page ? activityHref(str(page["slug"])) : null,
        image: page ? pathUrl(page["featured"]) : "",
        excerpt: page ? strip(str(page["excerpt"])) : "",
      };
    }),
  };
}

export const activityPageQuery = (slug: string) => ({
  queryKey: ["activity-page", slug],
  staleTime: 5 * 60_000,
  queryFn: () => fetchActivityPage(slug),
});

export function useActivityPage(slug: string) {
  return useQuery(activityPageQuery(slug));
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

export interface MegaMenuGroup {
  name: string;
  href: string;
  subs: { name: string; href: string }[];
}

/** Menu data: the four main activities with their sub-activities (links go to the sub-activity pages). */
export function useMegaMenu() {
  return useQuery({
    queryKey: ["mega-menu"],
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<MegaMenuGroup[]> => {
      const [catsRes, pagesRes] = await Promise.all([
        supabase.from("categories").select("id,name_he,slug,parent_id,sort_order").order("sort_order"),
        supabase.from("content_items").select("slug,category_id").eq("type", "activity").eq("status", "published"),
      ]);
      const cats = (catsRes.data ?? []) as (Pick<Category, "id" | "name_he" | "parent_id"> & Row)[];
      const pages = (pagesRes.data ?? []) as Row[];
      return cats
        .filter((c) => !c.parent_id)
        .map((m) => ({
          name: m.name_he,
          href: activityHref(str(m["slug"])),
          subs: cats
            .filter((c) => c.parent_id === m.id)
            .map((c) => {
              const page = pages.find((p) => p["category_id"] === c.id);
              return { name: c.name_he, href: page ? activityHref(str(page["slug"])) : activityHref(str(m["slug"])) };
            }),
        }));
    },
  });
}
