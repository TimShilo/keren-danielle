import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { categoryLabel, type Category, type ContentItem } from "@/lib/content";
import { Field, GhostButton, PrimaryButton, inputClass } from "./ui";

interface Props {
  typeMeta: { type: ContentItem["type"]; label: string; single: string };
  item: ContentItem | null;
  categories: Category[];
  onClose: () => void;
}

export function ItemEditor({ typeMeta, item, categories, onClose }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(item?.title ?? "");
  const [date, setDate] = useState(item?.item_date ?? "");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? "");
  const [parentId, setParentId] = useState(item?.parent_id ?? "");
  const [status, setStatus] = useState<ContentItem["status"]>(item?.status ?? "draft");
  const [externalUrl, setExternalUrl] = useState(item?.external_url ?? "");
  const [excerpt, setExcerpt] = useState(item?.excerpt ?? "");
  const [body, setBody] = useState(item?.body_html ?? "");
  const [dataText, setDataText] = useState(JSON.stringify(item?.data ?? {}, null, 2));

  const showParent = typeMeta.type === "news" || typeMeta.type === "activity";
  const parents = useQuery({
    queryKey: ["items", "activity"],
    enabled: showParent,
    queryFn: async () => {
      const { data } = await supabase
        .from("content_items")
        .select("id,title")
        .eq("type", "activity")
        .eq("language", "he")
        .order("title");
      return (data ?? []) as { id: string; title: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      let data: Record<string, unknown> = {};
      try {
        data = dataText.trim() ? JSON.parse(dataText) : {};
      } catch {
        throw new Error("שדה הנתונים המתקדמים אינו JSON תקין");
      }
      const payload = {
        title: title.trim(),
        item_date: date || null,
        category_id: categoryId || null,
        parent_id: parentId || null,
        status,
        external_url: externalUrl.trim() || null,
        excerpt: excerpt.trim() || null,
        body_html: body || null,
        data,
      };
      if (!payload.title) throw new Error("חובה למלא כותרת");
      const q = item
        ? supabase.from("content_items").update(payload).eq("id", item.id)
        : supabase
            .from("content_items")
            .insert({ ...payload, type: typeMeta.type, language: "he" });
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("נשמר");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
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
          <SheetTitle className="text-xl font-extrabold">
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
          <Field label="קטגוריה">
            <select
              className={inputClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">ללא קטגוריה</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(categories, c.id)}
                </option>
              ))}
            </select>
          </Field>
          {showParent && (
            <Field
              label={typeMeta.type === "news" ? "משויך לפעילות" : "פעילות אב (אם זו תת-פעילות)"}
            >
              <select
                className={inputClass}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">—</option>
                {(parents.data ?? [])
                  .filter((p) => p.id !== item?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </Field>
          )}
          <Field label="קישור למקור חיצוני">
            <input
              dir="ltr"
              className={inputClass}
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          </Field>
          <Field label="תקציר">
            <textarea
              rows={2}
              className={inputClass}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </Field>
          <Field label="תוכן (HTML)" hint="אפשר להדביק HTML. עורך עשיר יתווסף בהמשך.">
            <textarea
              rows={12}
              dir="auto"
              className={`${inputClass} font-mono`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
          <Field
            label="נתונים מתקדמים (JSON)"
            hint="שדות ייחודיים לסוג התוכן: אזורי עמוד, קישור לספר, מקור כתבה ועוד."
          >
            <textarea
              rows={5}
              dir="ltr"
              className={`${inputClass} font-mono`}
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
            />
          </Field>
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
