import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/media";
import type { Category } from "@/lib/content";
import { GhostButton, PageTitle } from "@/components/admin/ui";
import { ParentActivityEditor } from "@/components/admin/ParentActivityEditor";

export const Route = createFileRoute("/admin/parent-activities")({ component: ParentActivities });

interface PageRow {
  id: string;
  title: string;
  category_id: string | null;
  status: string;
}

function ParentActivities() {
  const [editing, setEditing] = useState<Category | null>(null);

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });
  const pages = useQuery({
    queryKey: ["activity-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("id,title,category_id,status")
        .eq("type", "activity")
        .eq("language", "he");
      if (error) throw error;
      return data as PageRow[];
    },
  });
  const media = useQuery({
    queryKey: ["media-paths", (cats.data ?? []).map((c) => c.featured_media_id).join(",")],
    enabled: !!cats.data,
    queryFn: async () => {
      const ids = (cats.data ?? []).map((c) => c.featured_media_id).filter(Boolean) as string[];
      if (!ids.length) return {} as Record<string, string>;
      const { data } = await supabase.from("media").select("id,storage_path").in("id", ids);
      return Object.fromEntries((data ?? []).map((m) => [m.id, m.storage_path])) as Record<
        string,
        string
      >;
    },
  });

  const all = cats.data ?? [];
  const parents = all.filter((c) => !c.parent_id);

  return (
    <div>
      <PageTitle>פעילויות אב</PageTitle>
      <div className="mb-6 rounded-2xl bg-secondary px-5 py-4 text-sm">
        פעילות אב מציגה רק את הקטגוריות של תתי-הפעילויות שלה. כאן מנהלים את הטקסט, התמונה והסדר של
        כל אחת. את התוכן של כל תת-פעילות (טקסטים, תמונות, וידאו) מנהלים בלשונית "תתי פעילויות".
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {parents.map((p) => {
          const subs = all.filter((c) => c.parent_id === p.id);
          const pageCount = (pages.data ?? []).filter((x) =>
            subs.some((s) => s.id === x.category_id),
          ).length;
          const path = p.featured_media_id ? media.data?.[p.featured_media_id] : undefined;
          return (
            <div key={p.id} className="flex gap-4 rounded-2xl bg-card p-5 shadow-sm">
              {path ? (
                <img
                  src={mediaUrl(path)}
                  alt=""
                  className="size-24 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="grid size-24 shrink-0 place-items-center rounded-xl bg-muted text-xs text-muted-foreground">
                  אין תמונה
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-extrabold">{p.name_he}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subs.length} תתי פעילויות · {pageCount} עמודים
                </p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {subs.map((s) => s.name_he).join(" · ")}
                </p>
                <GhostButton className="mt-3 !px-3 !py-1.5" onClick={() => setEditing(p)}>
                  ניהול התוכן
                </GhostButton>
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <ParentActivityEditor
          key={editing.id}
          parent={editing}
          subs={all.filter((c) => c.parent_id === editing.id)}
          pages={pages.data ?? []}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
