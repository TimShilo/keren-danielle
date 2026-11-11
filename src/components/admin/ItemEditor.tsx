import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import {
  CONTENT_TYPES,
  MOVABLE_TYPES,
  mainOf,
  type Category,
  type ContentItem,
} from "@/lib/content";
import { Field, GhostButton, PrimaryButton, inputClass } from "./ui";
import { ActivityFields } from "./ActivityFields";
import { RichTextEditor } from "./RichTextEditor";
import { ItemTeam, type TeamRow } from "./ItemTeam";
import { ItemMedia, type FeaturedRef, type GalleryRow, type VideoRow } from "./ItemMedia";

interface Props {
  typeMeta: { type: ContentItem["type"]; label: string; single: string };
  item: ContentItem | null;
  categories: Category[];
  onClose: () => void;
}

function safeParse(text: string): Record<string, unknown> {
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function ItemEditor({ typeMeta, item, categories, onClose }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(item?.title ?? "");
  const [date, setDate] = useState(item?.item_date ?? "");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "");
  const mainId = mainOf(categories, categoryId || null)?.id ?? "";
  const [status, setStatus] = useState<ContentItem["status"]>(item?.status ?? "draft");
  const [externalUrl, setExternalUrl] = useState(item?.external_url ?? "");
  const [excerpt, setExcerpt] = useState(item?.excerpt ?? "");
  const [body, setBody] = useState(item?.body_html ?? "");
  const [dataText, setDataText] = useState(JSON.stringify(item?.data ?? {}, null, 2));

  const [featured, setFeatured] = useState<FeaturedRef | null>(null);
  const [gallery, setGallery] = useState<GalleryRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [typeValue, setTypeValue] = useState<ContentItem["type"]>(typeMeta.type);
  const movable = MOVABLE_TYPES.includes(typeMeta.type);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const destinations = useQuery({
    queryKey: ["move-destinations"],
    enabled: typeMeta.type !== "sentence",
    queryFn: async () => {
      const { data } = await supabase
        .from("content_items")
        .select("id,title,type")
        .in("type", ["activity", "page"])
        .eq("language", "he")
        .order("title");
      return (data ?? []) as { id: string; title: string; type: string }[];
    },
  });
  const [extraCats, setExtraCats] = useState<string[]>([]);
  const [extraLoaded, setExtraLoaded] = useState(!item);
  const showExtra = [
    "news",
    "press_article",
    "event",
    "friend_story",
    "book",
    "publication",
  ].includes(typeMeta.type);
  useQuery({
    queryKey: ["item-links", item?.id],
    enabled: !!item && showExtra,
    staleTime: 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("content_category_links")
        .select("category_id")
        .eq("content_id", item!.id);
      setExtraCats((data ?? []).map((r) => r.category_id));
      setExtraLoaded(true);
      return data ?? [];
    },
  });
  const showMedia = typeMeta.type !== "sentence";

  // load the item's existing featured image, gallery and videos
  const existing = useQuery({
    queryKey: ["item-media", item?.id],
    enabled: !!item && showMedia,
    staleTime: 0,
    queryFn: async () => {
      const id = item!.id;
      const [g, v, f, t] = await Promise.all([
        supabase
          .from("content_media")
          .select("media_id,title,caption,sort_order,media(storage_path)")
          .eq("content_id", id)
          .eq("role", "gallery")
          .order("sort_order"),
        supabase
          .from("content_videos")
          .select("id,url,title,sort_order")
          .eq("content_id", id)
          .order("sort_order"),
        item!.featured_media_id
          ? supabase
              .from("media")
              .select("id,storage_path")
              .eq("id", item!.featured_media_id)
              .single()
          : Promise.resolve({ data: null }),
        supabase
          .from("content_team")
          .select("id,name,role,sort_order")
          .eq("content_id", id)
          .order("sort_order"),
      ]);
      return { g: g.data ?? [], v: v.data ?? [], f: f.data as FeaturedRef | null, t: t.data ?? [] };
    },
  });
  useEffect(() => {
    if (!existing.data) return;
    setFeatured(existing.data.f);
    setGallery(
      existing.data.g.map((r) => ({
        media_id: r.media_id,
        storage_path: (r.media as unknown as { storage_path: string } | null)?.storage_path ?? "",
        title: r.title ?? "",
        caption: r.caption ?? "",
        persisted: true,
      })),
    );
    setVideos(
      existing.data.v.map((r) => ({
        key: r.id,
        url: r.url,
        title: r.title ?? "",
        persisted: true,
      })),
    );
    setTeam(existing.data.t.map((r) => ({ key: r.id, name: r.name, role: r.role ?? "" })));
  }, [existing.data]);

  const save = useMutation({
    mutationFn: async () => {
      const data = safeParse(dataText);
      let parent: string | null = null;
      if (typeValue === "news" && categoryId) {
        const { data: page } = await supabase
          .from("content_items")
          .select("id")
          .eq("type", "activity")
          .eq("language", "he")
          .eq("category_id", categoryId)
          .limit(1)
          .maybeSingle();
        parent = page?.id ?? null;
      }
      const payload = {
        title: title.trim(),
        item_date: date || null,
        category_id: categoryId || null,
        type: typeValue,
        parent_id: typeValue === "news" ? parent : (item?.parent_id ?? null),
        status,
        external_url: externalUrl.trim() || null,
        excerpt: excerpt.trim() || null,
        body_html: body || null,
        featured_media_id: showMedia ? (featured?.id ?? null) : (item?.featured_media_id ?? null),
        data,
      };
      if (!payload.title) throw new Error("חובה למלא כותרת");
      let id = item?.id;
      if (item) {
        const { error } = await supabase.from("content_items").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from("content_items")
          .insert({ ...payload, language: "he" })
          .select("id")
          .single();
        if (error) throw error;
        id = created.id;
      }
      if (showExtra && id && extraLoaded) {
        const dl = await supabase.from("content_category_links").delete().eq("content_id", id);
        if (dl.error) throw dl.error;
        const keep = extraCats.filter((c) => c !== categoryId);
        if (keep.length) {
          const { error } = await supabase
            .from("content_category_links")
            .insert(keep.map((c) => ({ content_id: id, category_id: c, source: "manual" })));
          if (error) throw error;
        }
      }
      if (showMedia && id && (!item || existing.data)) {
        // replace the gallery and videos with what is on screen
        const d1 = await supabase
          .from("content_media")
          .delete()
          .eq("content_id", id)
          .eq("role", "gallery");
        if (d1.error) throw d1.error;
        if (gallery.length) {
          const { error } = await supabase.from("content_media").insert(
            gallery.map((g, i) => ({
              content_id: id,
              media_id: g.media_id,
              role: "gallery",
              sort_order: i,
              title: g.title.trim() || null,
              caption: g.caption.trim() || null,
            })),
          );
          if (error) throw error;
        }
        if (typeMeta.type === "activity") {
          const dt = await supabase.from("content_team").delete().eq("content_id", id);
          if (dt.error) throw dt.error;
          const members = team.filter((m) => m.name.trim());
          if (members.length) {
            const { error } = await supabase.from("content_team").insert(
              members.map((m, i) => ({
                content_id: id,
                name: m.name.trim(),
                role: m.role.trim() || null,
                sort_order: i,
              })),
            );
            if (error) throw error;
          }
        }
        const d2 = await supabase.from("content_videos").delete().eq("content_id", id);
        if (d2.error) throw d2.error;
        const vids = videos.filter((v) => v.url.trim());
        if (vids.length) {
          const { error } = await supabase.from("content_videos").insert(
            vids.map((v, i) => ({
              content_id: id,
              url: v.url.trim(),
              title: v.title.trim() || null,
              sort_order: i,
            })),
          );
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success("נשמר");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["item-media"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      qc.invalidateQueries({ queryKey: ["nav-counts"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("content_items").delete().eq("id", item!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("נמחק");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      qc.invalidateQueries({ queryKey: ["nav-counts"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="admin-theme w-full overflow-y-auto bg-background sm:max-w-2xl"
        dir="rtl"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            {item ? `עריכת ${typeMeta.single}` : `${typeMeta.single} חדש/ה`}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 p-4">
          <Field label="כותרת">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="תאריך">
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="סטטוס">
              <select
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentItem["status"])}
              >
                <option value="draft">טיוטה</option>
                <option value="published">פורסם</option>
              </select>
            </Field>
          </div>
          {movable && (
            <Field
              label="שייך לעמוד"
              hint="אם הפוסט הוכנס לעמוד הלא נכון, בחרי כאן את העמוד הנכון."
            >
              <select
                className={inputClass}
                value={typeValue}
                onChange={(e) => setTypeValue(e.target.value as ContentItem["type"])}
              >
                {CONTENT_TYPES.filter((t) => MOVABLE_TYPES.includes(t.type)).map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="קטגוריה ראשית">
            <select
              className={inputClass}
              value={mainId}
              onChange={(e) => {
                setCategoryId(e.target.value);
              }}
            >
              <option value="">ללא קטגוריה</option>
              {categories
                .filter((c) => !c.parent_id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_he}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="קטגוריה משנית">
            <select
              className={inputClass}
              value={categoryId !== mainId ? categoryId : ""}
              disabled={!mainId}
              onChange={(e) => setCategoryId(e.target.value || mainId)}
            >
              <option value="">{mainId ? "ללא קטגוריה משנית" : "בחרי קודם קטגוריה ראשית"}</option>
              {categories
                .filter((c) => c.parent_id === mainId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_he}
                  </option>
                ))}
            </select>
          </Field>
          {showExtra && (
            <Field
              label="קטגוריות משניות נוספות"
              hint="הפריט יוצג גם בעמודי הפעילויות המשניות שתסמני כאן."
            >
              <div className="max-h-48 space-y-3 overflow-y-auto rounded-xl border bg-card p-3">
                {categories
                  .filter((t) => !t.parent_id)
                  .map((top) => (
                    <div key={top.id}>
                      <div className="mb-1 text-xs font-bold text-muted-foreground">
                        {top.name_he}
                      </div>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {categories
                          .filter((c) => c.parent_id === top.id && c.id !== categoryId)
                          .map((c) => (
                            <label
                              key={c.id}
                              className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                            >
                              <input
                                type="checkbox"
                                className="size-4"
                                checked={extraCats.includes(c.id)}
                                onChange={(e) =>
                                  setExtraCats((prev) =>
                                    e.target.checked
                                      ? [...prev, c.id]
                                      : prev.filter((x) => x !== c.id),
                                  )
                                }
                              />
                              {c.name_he}
                            </label>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </Field>
          )}
          {["news", "press_article", "book", "publication"].includes(typeMeta.type) && (
            <Field label="קישור למקור חיצוני">
              <input
                dir="ltr"
                className={inputClass}
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </Field>
          )}
          <Field
            label={
              typeMeta.type === "activity" ? "תיאור קצר (מוצג בכרטיס בעמוד פעילות האב)" : "תקציר"
            }
          >
            <textarea
              rows={2}
              className={inputClass}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </Field>
          <div className="space-y-1.5 text-sm font-medium">
            <span>תוכן</span>
            <RichTextEditor value={body} onChange={setBody} />
          </div>
          {typeMeta.type === "activity" && (
            <ActivityFields
              data={safeParse(dataText)}
              onChange={(next) => setDataText(JSON.stringify(next, null, 2))}
            />
          )}
          {typeMeta.type === "activity" &&
            (safeParse(dataText)["layout"] as Record<string, unknown> | undefined)?.["team"] ===
              "true" && <ItemTeam team={team} onChange={setTeam} />}
          {showMedia && (
            <ItemMedia
              itemId={item?.id}
              destinations={(destinations.data ?? []).filter((d) => d.id !== item?.id)}
              featured={featured}
              gallery={gallery}
              videos={videos}
              onFeatured={setFeatured}
              onGallery={setGallery}
              onVideos={setVideos}
            />
          )}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <PrimaryButton type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="size-4 animate-spin" />} שמירה
              </PrimaryButton>
              <GhostButton type="button" onClick={onClose}>
                ביטול
              </GhostButton>
            </div>
            {item && (
              <GhostButton
                type="button"
                className="text-destructive"
                disabled={remove.isPending}
                onClick={() => window.confirm("למחוק את הפריט לצמיתות?") && remove.mutate()}
              >
                <Trash2 className="size-4" /> מחיקה
              </GhostButton>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
