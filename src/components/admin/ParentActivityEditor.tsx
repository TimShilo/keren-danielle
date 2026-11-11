import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slug";
import { mediaUrl, type MediaRow } from "@/lib/media";
import type { Category } from "@/lib/content";
import { Field, GhostButton, PrimaryButton, inputClass } from "./ui";
import { MediaPicker } from "./MediaPicker";

interface Props {
  parent: Category;
  subs: Category[];
  pages: { id: string; title: string; category_id: string | null; status: string }[];
  onClose: () => void;
}

export function ParentActivityEditor({ parent, subs, pages, onClose }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState(parent.name_he);
  const [description, setDescription] = useState(parent.description_html ?? "");
  const [featuredId, setFeaturedId] = useState(parent.featured_media_id ?? "");
  const [picker, setPicker] = useState(false);
  const [newName, setNewName] = useState("");

  const img = useQuery({
    queryKey: ["media-by-id", featuredId],
    enabled: !!featuredId,
    queryFn: async () => {
      const { data } = await supabase
        .from("media")
        .select("storage_path")
        .eq("id", featuredId)
        .single();
      return data?.storage_path as string | undefined;
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["nav-counts"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("חובה למלא שם");
      const { error } = await supabase
        .from("categories")
        .update({
          name_he: name.trim(),
          description_html: description || null,
          featured_media_id: featuredId || null,
        })
        .eq("id", parent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("נשמר");
      refresh();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reorder = useMutation({
    mutationFn: async ({ i, d }: { i: number; d: -1 | 1 }) => {
      const a = subs[i];
      const b = subs[i + d];
      if (!a || !b) return;
      // swap their positions; renumber so equal values cannot collide
      const order = subs.map((s) => s.id);
      [order[i], order[i + d]] = [order[i + d] as string, order[i] as string];
      for (let k = 0; k < order.length; k++) {
        const { error } = await supabase
          .from("categories")
          .update({ sort_order: k + 1 })
          .eq("id", order[k] as string);
        if (error) throw error;
      }
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const addSub = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) throw new Error("יש למלא שם");
      const { error } = await supabase.from("categories").insert({
        name_he: newName.trim(),
        slug: slugify(newName),
        parent_id: parent.id,
        sort_order: subs.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewName("");
      toast.success("פעילות משנית נוספה");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="left"
        className="admin-theme w-full overflow-y-auto bg-background sm:max-w-2xl"
        dir="rtl"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">פעילות ראשית: {parent.name_he}</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-4 p-4"
        >
          <Field label="שם">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="טקסט פתיחה (HTML)" hint="מופיע בראש עמוד פעילות האב.">
            <textarea
              rows={7}
              className={`${inputClass} font-mono`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <section className="space-y-3 rounded-2xl border bg-card p-4">
            <h3 className="text-base font-bold">תמונה ראשית</h3>
            {featuredId && img.data ? (
              <img src={mediaUrl(img.data)} alt="" className="h-32 w-48 rounded-xl object-cover" />
            ) : (
              <p className="text-sm text-muted-foreground">לא נבחרה תמונה.</p>
            )}
            <div className="flex gap-2">
              <GhostButton type="button" onClick={() => setPicker(true)}>
                <ImagePlus className="size-4" /> {featuredId ? "החלפה" : "בחירת תמונה"}
              </GhostButton>
              {featuredId && (
                <GhostButton
                  type="button"
                  className="text-destructive"
                  onClick={() => setFeaturedId("")}
                >
                  הסרה
                </GhostButton>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border bg-card p-4">
            <h3 className="text-base font-bold">הפעילויות המשניות · {subs.length}</h3>
            <div className="space-y-2">
              {subs.map((s, i) => {
                const page = pages.filter((p) => p.category_id === s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border bg-background p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{s.name_he}</div>
                      <div className="text-xs text-muted-foreground">
                        {page.length
                          ? page
                              .map(
                                (p) =>
                                  `${p.title} (${p.status === "published" ? "פורסם" : "טיוטה"})`,
                              )
                              .join(", ")
                          : "אין עמוד פעילות"}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="הזזה למעלה"
                      disabled={i === 0 || reorder.isPending}
                      onClick={() => reorder.mutate({ i, d: -1 })}
                      className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="הזזה למטה"
                      disabled={i === subs.length - 1 || reorder.isPending}
                      onClick={() => reorder.mutate({ i, d: 1 })}
                      className="rounded-lg border p-1.5 hover:bg-accent disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-end gap-2 border-t pt-3">
              <input
                className={`${inputClass} !w-40`}
                placeholder="שם פעילות משנית"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <GhostButton
                type="button"
                disabled={addSub.isPending}
                onClick={() => addSub.mutate()}
              >
                <Plus className="size-4" /> הוספה
              </GhostButton>
            </div>
            <Link
              to="/admin/content/$type"
              params={{ type: "activities" }}
              className="inline-block text-sm font-bold text-primary underline-offset-4 hover:underline"
            >
              לניהול התוכן של הפעילויות המשניות ←
            </Link>
          </section>

          <div className="flex gap-2 pt-2">
            <PrimaryButton type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />} שמירה
            </PrimaryButton>
            <GhostButton type="button" onClick={onClose}>
              ביטול
            </GhostButton>
          </div>
        </form>
        {picker && (
          <MediaPicker
            onClose={() => setPicker(false)}
            onPick={(rows: MediaRow[]) => rows[0] && setFeaturedId(rows[0].id)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
