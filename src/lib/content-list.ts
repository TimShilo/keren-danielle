import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/media";
import { strip } from "@/lib/home-feed";

export interface ListItem {
  id: string;
  slug: string;
  title: string;
  html: string;
  excerpt: string;
  date: string;
  image: string;
  gallery: { src: string; caption: string }[];
}

type Row = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const path = (m: unknown) => (m && typeof m === "object" ? str((m as Row)["storage_path"]) : "");

function cleanBody(html: string) {
  return html
    .replace(/<div class="elementor-element[^>]*>/g, "<div>")
    .replace(/\sdata-[a-z_-]+="[^"]*"/g, "")
    .trim();
}

async function fetchList(type: string): Promise<ListItem[]> {
  const { data } = await supabase
    .from("content_items")
    .select(
      "id,title,slug,body_html,excerpt,item_date,sort_order,featured:media!featured_media_id(storage_path),content_media(sort_order,role,caption,media(storage_path))",
    )
    .eq("type", type)
    .eq("status", "published")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("item_date", { ascending: false, nullsFirst: false })
    .limit(200);
  return ((data ?? []) as Row[]).map((r) => {
    const html = cleanBody(str(r["body_html"]));
    const gallery = ((r["content_media"] ?? []) as Row[])
      .filter((g) => path(g["media"]))
      .sort((a, b) => Number(a["sort_order"] ?? 0) - Number(b["sort_order"] ?? 0))
      .map((g) => ({ src: mediaUrl(path(g["media"])), caption: str(g["caption"]) }));
    const feat = path(r["featured"]);
    const inBody = /<img[^>]+src="([^"]+)"/i.exec(html)?.[1] ?? "";
    return {
      id: str(r["id"]),
      slug: str(r["slug"]),
      title: str(r["title"]),
      html,
      excerpt: (str(r["excerpt"]) || strip(html)).slice(0, 220),
      date: str(r["item_date"]),
      image: feat ? mediaUrl(feat) : (gallery[0]?.src ?? inBody),
      gallery,
    };
  });
}

export const useContentList = (type: string) =>
  useQuery({ queryKey: ["content-list", type], queryFn: () => fetchList(type), staleTime: 5 * 60_000 });

export function usePageItem(slug: string) {
  return useQuery({
    queryKey: ["page-item", slug],
    queryFn: async () => {
      const { data } = await supabase.from("content_items").select("title,body_html").eq("type", "page").eq("status", "published").eq("slug", slug).maybeSingle();
      return data ? { title: str((data as Row)["title"]), html: cleanBody(str((data as Row)["body_html"])) } : null;
    },
  });
}

export interface PressItem {
  id: string;
  title: string;
  source: string;
  image: string;
  href: string;
  external: boolean;
}

/** Every published press article (the archive page): newest first, undated ones after. */
export function usePressArchive() {
  return useQuery({
    queryKey: ["press-archive"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<PressItem[]> => {
      const { data } = await supabase
        .from("content_items")
        .select("id,title,slug,external_url,data,item_date,sort_order,featured:media!featured_media_id(storage_path)")
        .eq("type", "press_article")
        .eq("status", "published")
        .order("item_date", { ascending: false, nullsFirst: false })
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("title")
        .limit(500);
      return ((data ?? []) as Row[]).map((r) => {
        const d = (r["data"] ?? {}) as Row;
        const ext = str(r["external_url"]);
        const feat = path(r["featured"]);
        return {
          id: str(r["id"]),
          title: str(r["title"]),
          source: str(d["source_label"]) || str(d["source"]) || str(d["author"]),
          image: feat ? mediaUrl(feat) : "",
          href: ext || `/press/${str(r["slug"]) || str(r["id"])}`,
          external: !!ext,
        };
      });
    },
  });
}
