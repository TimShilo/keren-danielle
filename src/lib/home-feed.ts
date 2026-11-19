import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/media";
import type { Category } from "@/lib/content";

export interface NewsCardData {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  /** icon key for the category chip */
  icon: "education" | "health" | "tradition" | "welfare";
  image: string;
  href: string;
}
export interface VideoCardData {
  id: string;
  title: string;
  youtubeId: string;
}
export interface PressCardData {
  id: string;
  title: string;
  source: string;
  image: string;
  href: string;
  external: boolean;
}

// Shown until the first posts are published (everything is still a draft).
export const DEMO_NEWS: NewsCardData[] = [
  { id: "d1", title: "הוסטל ניגונים", excerpt: "ניגונים הינו ההוסטל היחידי מסוגו לנערות בסיכון ממשפחות דתיות וחרדיות, הפועל כבר 26 שנים ...", category: "רווחה וכלכלה", icon: "welfare", image: "/images/home/demo/news-1.webp", href: "/news" },
  { id: "d2", title: "קרן רעננה לזכר דניאלי זוננפלד", excerpt: "\"קרן רעננה\" (ע\"ר) פועלת בשיתוף פעולה הדוק עם קרן דניאלי בתמיכתה. הפעילות של קרן ...", category: "מסורת וחברה", icon: "tradition", image: "/images/home/demo/news-2.webp", href: "/news" },
  { id: "d3", title: "בכירי הרופאים בארץ בועידה...", excerpt: "הצלחה חסרת תקדים והדים רבים ל \"ועידה הרפואית השנתית ה-2 של בוני עולם ישראל\" ...", category: "בריאות ורפואה", icon: "health", image: "/images/home/demo/news-3.webp", href: "/news" },
  { id: "d4", title: "\"תקות דניאלי\" תכנית לתיגבור...", excerpt: "תקווה מספקת בית חם, רחום, שירותים חברתיים וחיי יהודות תוססים ובעיקר, חינוך איכותי ...", category: "חינוך ולמידה", icon: "education", image: "/images/home/demo/news-4.webp", href: "/news" },
];
export const DEMO_PRESS: PressCardData[] = [
  { id: "p1", title: "הוסטל ניגונים", source: "", image: "/images/home/demo/press-1.webp", href: "/press", external: false },
  { id: "p2", title: "israeli rabbinate grants rare permission for divorced....", source: "cnaan liphshiz", image: "/images/home/demo/press-2.webp", href: "/press", external: false },
  { id: "p3", title: "בר מצווה מרגשת בספארי", source: "ערוץ 7", image: "/images/home/demo/press-3.webp", href: "/press", external: false },
  { id: "p4", title: "מאות ילדים לקויי ראיה ובני משפחותיהם חגגו בר ובת מצווה", source: "גדי דויטש", image: "/images/home/demo/press-4.webp", href: "/press", external: false },
];

export const ICONS: Record<string, NewsCardData["icon"]> = {
  "בריאות ורפואה": "health",
  "חינוך ולמידה": "education",
  "מסורת וחברה": "tradition",
  "רווחה וקהילה": "welfare",
  "רווחה וכלכלה": "welfare",
};

export const ytId = (url: string) => /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(url)?.[1] ?? "";
export const strip = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export async function mediaMap(ids: string[]) {
  if (!ids.length) return new Map<string, string>();
  const { data } = await supabase.from("media").select("id,storage_path").in("id", ids);
  return new Map((data ?? []).map((m) => [m.id as string, mediaUrl(m.storage_path as string)]));
}

export function useHomeVideos() {
  return useQuery({
    queryKey: ["home", "videos"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<VideoCardData[]> => {
      const { data, error } = await supabase
        .from("content_videos")
        .select("id,title,url,home_order")
        .eq("show_on_home", true)
        .order("home_order", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .map((v) => ({ id: v.id as string, title: ((v.title as string) || "").trim(), youtubeId: ytId((v.url as string) || "") }))
        .filter((v) => v.youtubeId);
    },
  });
}

export function useHomeNews() {
  return useQuery({
    queryKey: ["home", "news"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<NewsCardData[]> => {
      const [{ data: items }, { data: cats }] = await Promise.all([
        supabase
          .from("content_items")
          .select("id,title,excerpt,body_html,slug,category_id,featured_media_id,item_date")
          .eq("type", "news")
          .eq("status", "published")
          .not("featured_media_id", "is", null)
          .order("item_date", { ascending: false, nullsFirst: false })
          .limit(10),
        supabase.from("categories").select("id,name_he,parent_id"),
      ]);
      const rows = items ?? [];
      const media = await mediaMap(rows.map((r) => r.featured_media_id as string));
      const catList = (cats ?? []) as Pick<Category, "id" | "name_he" | "parent_id">[];
      const mainName = (id: string | null) => {
        const c = catList.find((x) => x.id === id);
        const main = c?.parent_id ? catList.find((x) => x.id === c.parent_id) : c;
        return main?.name_he ?? "";
      };
      return rows.map((r) => {
        const category = mainName(r.category_id as string | null);
        const text = ((r.excerpt as string) || strip((r.body_html as string) || "")).slice(0, 260);
        return {
          id: r.id as string,
          title: r.title as string,
          excerpt: text,
          category,
          icon: ICONS[category] ?? "tradition",
          image: media.get(r.featured_media_id as string) ?? "",
          href: `/news/${(r.slug as string) || r.id}`,
        };
      });
    },
  });
}

export function useHomePress() {
  return useQuery({
    queryKey: ["home", "press"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<PressCardData[]> => {
      const { data } = await supabase
        .from("content_items")
        .select("id,title,external_url,featured_media_id,data,slug")
        .eq("type", "press_article")
        .eq("status", "published")
        .not("featured_media_id", "is", null)
        .order("sort_order", { ascending: true })
        .limit(10);
      const rows = data ?? [];
      const media = await mediaMap(rows.map((r) => r.featured_media_id as string));
      return rows.map((r) => {
        const d = (r.data ?? {}) as Record<string, unknown>;
        const ext = (r.external_url as string) || "";
        return {
          id: r.id as string,
          title: r.title as string,
          source: String(d["source"] ?? d["author"] ?? ""),
          image: media.get(r.featured_media_id as string) ?? "",
          href: ext || `/press/${(r.slug as string) || r.id}`,
          external: !!ext,
        };
      });
    },
  });
}

export interface SentenceData {
  id: string;
  lines: string[];
  attribution: string;
}

const SENTENCE_RAW: [string, string][] = [
  ["עולם שלום / אני איתך כל היום מזרח,<br>מערב ודרום / בינתיים זה המקום", "דניאלי בת 8"],
  ["מי שולט ומנהיג / בכל צעד וצעד בצרה אזכור תמיד,<br>שאני לא לבד", "דניאלי בת 9"],
  ["ירושלים, מסביבך הרים את / מבית מקדשנו נשאר מעט,<br>עצים מסביב כיפת הזהב / מבעד לחלון נשקף", "דניאלי בת 9"],
  ["כשאהיה גדולה, אם אהיה ציירת / אצייר לך פרחים ולב אדום,<br>זה יהיה ממני למזכרת / תיקחי את הציור לכל מקום.", "דניאלי בת 9"],
  ["על שפת הירדן ראיתי אותך / נפרשת על כף ידי,<br>ראיתי אותך מרהיבה ביופייך / ידעתי, זו ארץ אהבתי", "דניאלי בת 11"],
  ["להמשיך וללכת קדימה / גם אם הסוף נראה כה רחוק,<br>להאמין שלסוף עוד נגיע / ונשקע שם באושר עמוק", "דניאלי בת 11 וחצי"],
  ["כל פרח ונפלאותיו / כל אחד פורח ומלבלב,<br>אבל את פורחת כל השנה / מרנינה את ליבי האוהב", "דניאלי בת 11 וחצי"],
  ["רגעים קטנים של אושר / בלתי מוסבר ומרגש,<br>הלב רוצה שימשיך לנצח / ובוורידים זורמת אש", "דניאלי בת 11 וחצי"],
  ["הכי קל - ללכת אחרי כולם, לזרום / במורד הנחל, עד סוף העולם,<br>לא לעשות דבר ולחכות כל היום / לדרך שתוביל אותנו – לאן?", "דניאלי בת 11 וחצי"],
  ["לא שוים, כולם שונים, כל אחד ברמתו / זה אולי מה שמפריע לאחדות,<br>לא שווים, אך שואפים, למושיע מחכים / שיטשטש את השנאה והעבדות.", "דניאלי בת 12"],
  ["תן חיוך, מילים חמות, שיבקיעו את החומות / ויעודדו את כל העולם,<br>תנו את היד, תנו את הלב, לטשטש את הכאב / ותחזירו את האהבה לעם", "דניאלי בת 12"],
  ["יש דברים שנשמעים משוגעים / אבל מישהו הצליח לגלות,<br>אז תמשיכו לרוץ ברחבי הדמיון / ולרדוף אחרי משאלות", "דניאלי בת 12"],
  ["לשכוח את הדאגות בצד / לזרום עם החיים בשלווה,<br>להודות לאבא שבשמיים על הטוב והרע / ולזכור שהכל לטובה", "דניאלי בת 12"],
  ["אלה החיים, מורכבים עד מאוד / לא תמיד העתיד צבוע הורוד,<br>כי אלה החיים, ואיתם עוד נסתדר / ועם הזמן העובר הכול כבר ישתפר", "דניאלי בת 12 וחצי"],
  ["בעוד כמה ימים / כשנעגון בחוף,<br>הקור והרטיבות / יהפכו לעוד סתם סוף", "דניאלי בת 17 וחצי"],
];

/** Two lines at most: split on the verse break (<br>), the inner " / " separators become plain spaces. */
const toLines = (body: string) => {
  const clean = (t: string) => t.replace(/<[^>]*>/g, "").replace(/\s\/\s/g, " ").replace(/\s+/g, " ").trim();
  const parts = body.split(/<br\s*\/?>/).map(clean).filter(Boolean);
  if (parts.length >= 2) return [parts[0] as string, parts.slice(1).join(" ")];
  // no explicit break: split the single line in two at the " / " closest to the middle
  const bits = body.replace(/<[^>]*>/g, "").split(/\s\/\s/).map((x) => x.trim()).filter(Boolean);
  if (bits.length < 2) return bits;
  const half = Math.ceil(bits.length / 2);
  return [bits.slice(0, half).join(" "), bits.slice(half).join(" ")];
};

// Used until the sentences are published from the admin.
export const DEMO_SENTENCES: SentenceData[] = SENTENCE_RAW.map(([body, attribution], i) => ({
  id: `s${i}`,
  lines: toLines(body),
  attribution,
}));

export function useHomeSentences() {
  return useQuery({
    queryKey: ["home", "sentences"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<SentenceData[]> => {
      const { data } = await supabase
        .from("content_items")
        .select("id,title,body_html,data,sort_order")
        .eq("type", "sentence")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      return (data ?? []).map((r) => {
        const d = (r.data ?? {}) as Record<string, unknown>;
        return {
          id: r.id as string,
          lines: toLines(((r.body_html as string) || (r.title as string) || "")),
          attribution: String(d["attribution"] ?? ""),
        };
      });
    },
  });
}
