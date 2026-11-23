import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/media";

export interface NewsPost {
  id: string;
  title: string;
  html: string;
  image: string;
  date: string;
  main: { name: string; href: string } | null;
  sub: { name: string; href: string } | null;
  prev: { title: string; href: string } | null;
  next: { title: string; href: string } | null;
}

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const postHref = (r: Row, base = "/news") => `${base}/${str(r["slug"]) || str(r["id"])}`;

function cleanBody(html: string) {
  return html
    .replace(/<div class="elementor-element[^>]*>/g, "<div>")
    .replace(/\sdata-[a-z_-]+="[^"]*"/g, "")
    .trim();
}

export type PostKind = "news" | "friend";

async function fetchNewsPost(slug: string, kind: PostKind = "news"): Promise<NewsPost | null> {
  const type = kind === "friend" ? "friend_story" : "news";
  const base0 = kind === "friend" ? "/danielle/friends" : "/news";
  const key = decodeURIComponent(slug);
  const cols = "id,title,body_html,slug,category_id,item_date,featured:media!featured_media_id(storage_path)";
  const base = supabase.from("content_items").select(cols).eq("type", type).eq("status", "published");
  const { data } = UUID.test(key) ? await base.eq("id", key).maybeSingle() : await base.eq("slug", key).maybeSingle();
  if (!data) return null;
  const r = data as unknown as Row;

  // category chain + the neighbours inside the same activity (2 parallel queries)
  const catId = str(r["category_id"]);
  const [cats, siblings] = await Promise.all([
    supabase.from("categories").select("id,name_he,slug,parent_id"),
    kind === "friend"
      ? supabase
          .from("content_items")
          .select("id,title,slug,item_date")
          .eq("type", "friend_story")
          .eq("status", "published")
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("title")
          .limit(200)
      : catId
        ? supabase
            .from("content_items")
            .select("id,title,slug,item_date")
            .eq("type", "news")
            .eq("status", "published")
            .eq("category_id", catId)
            .order("item_date", { ascending: false, nullsFirst: false })
            .order("title")
            .limit(200)
        : Promise.resolve({ data: [] as Row[] }),
  ]);
  const all = (cats.data ?? []) as Row[];
  const sub = all.find((c) => str(c["id"]) === catId) ?? null;
  const main = sub ? (all.find((c) => str(c["id"]) === str(sub["parent_id"])) ?? null) : null;
  const href = (c: Row) => `/activities/${encodeURIComponent(str(c["slug"]))}`;

  const list = (siblings.data ?? []) as Row[];
  const at = list.findIndex((x) => str(x["id"]) === str(r["id"]));
  const nb = (i: number) => (i >= 0 && i < list.length ? { title: str(list[i]?.["title"]), href: postHref(list[i] as Row, base0) } : null);

  // main picture: the featured one, else the first picture inside the text (and take it out of the text)
  let html = cleanBody(str(r["body_html"]));
  const feat = r["featured"] && typeof r["featured"] === "object" ? str((r["featured"] as Row)["storage_path"]) : "";
  let image = feat ? mediaUrl(feat) : "";
  if (!image) {
    const m = /<img[^>]+src="([^"]+)"[^>]*>/i.exec(html);
    if (m) {
      image = m[1] ?? "";
      html = html.replace(m[0], "");
    }
  }
  return {
    id: str(r["id"]),
    title: str(r["title"]),
    html,
    image,
    date: str(r["item_date"]),
    main: main ? { name: str(main["name_he"]), href: href(main) } : null,
    sub: sub ? { name: str(sub["name_he"]), href: href(sub) } : null,
    prev: at > 0 ? nb(at - 1) : null,
    next: at >= 0 ? nb(at + 1) : null,
  };
}

export const useNewsPost = (slug: string, kind: PostKind = "news") =>
  useQuery({ queryKey: ["news-post", kind, slug], queryFn: () => fetchNewsPost(slug, kind), staleTime: 5 * 60_000 });
