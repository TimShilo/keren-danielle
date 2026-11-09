export type ContentType =
  "activity" | "news" | "event" | "book" | "press_article" | "friend_story" | "sentence" | "video";

export const CONTENT_TYPES: { type: ContentType; slug: string; label: string; single: string }[] = [
  { type: "activity", slug: "activities", label: "פעילויות", single: "פעילות" },
  { type: "news", slug: "news", label: "חדשות ועדכונים", single: "חדשה" },
  { type: "event", slug: "events", label: "אירועים", single: "אירוע" },
  { type: "book", slug: "books", label: "ראו אור", single: "ספר" },
  { type: "press_article", slug: "press", label: "כתבות מהעיתונות", single: "כתבה" },
  { type: "friend_story", slug: "friends", label: "חברים מספרים", single: "סיפור" },
  { type: "sentence", slug: "sentences", label: "משפטים", single: "משפט" },
  { type: "video", slug: "videos", label: "סרטונים", single: "סרטון" },
];

export const typeBySlug = (slug: string) => CONTENT_TYPES.find((t) => t.slug === slug);

export interface Category {
  id: string;
  parent_id: string | null;
  slug: string;
  name_he: string;
  name_en: string | null;
  sort_order: number;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  language: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  body_html: string | null;
  item_date: string | null;
  category_id: string | null;
  parent_id: string | null;
  status: "draft" | "published";
  external_url: string | null;
  data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABEL: Record<string, string> = { draft: "טיוטה", published: "פורסם" };

export function categoryLabel(cats: Category[], id: string | null): string {
  if (!id) return "";
  const c = cats.find((x) => x.id === id);
  if (!c) return "";
  const p = c.parent_id ? cats.find((x) => x.id === c.parent_id) : null;
  return p ? `${p.name_he} › ${c.name_he}` : c.name_he;
}
