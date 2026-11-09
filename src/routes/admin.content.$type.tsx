import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUS_LABEL,
  categoryLabel,
  typeBySlug,
  type Category,
  type ContentItem,
} from "@/lib/content";
import { GhostButton, PageTitle, PrimaryButton, inputClass } from "@/components/admin/ui";
import { ItemEditor } from "@/components/admin/ItemEditor";

export const Route = createFileRoute("/admin/content/$type")({ component: ContentList });

type SortKey = "default" | "date_desc" | "date_asc" | "title" | "category" | "status" | "updated";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "סדר ברירת מחדל" },
  { key: "date_desc", label: "תאריך (מהחדש לישן)" },
  { key: "date_asc", label: "תאריך (מהישן לחדש)" },
  { key: "title", label: "כותרת (א-ת)" },
  { key: "category", label: "קטגוריה" },
  { key: "status", label: "סטטוס (טיוטות קודם)" },
  { key: "updated", label: "עודכן לאחרונה" },
];

function ContentList() {
  const { type: slug } = Route.useParams();
  const meta = typeBySlug(slug);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<ContentItem | "new" | null>(null);

  const items = useQuery({
    queryKey: ["items", meta?.type],
    enabled: !!meta,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("type", meta!.type)
        .eq("language", "he");
      if (error) throw error;
      return data as ContentItem[];
    },
  });
  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const categories = cats.data ?? [];
  const rows = useMemo(() => {
    let r = [...(items.data ?? [])];
    const q = search.trim();
    if (q) r = r.filter((x) => x.title.includes(q) || (x.excerpt ?? "").includes(q));
    if (catFilter) r = r.filter((x) => x.category_id === catFilter);
    if (statusFilter) r = r.filter((x) => x.status === statusFilter);
    const catName = (x: ContentItem) => categoryLabel(categories, x.category_id);
    const date = (x: ContentItem) => x.item_date ?? "";
    r.sort((a, b) => {
      switch (sort) {
        case "date_desc":
          return date(b).localeCompare(date(a));
        case "date_asc":
          return (date(a) || "9999").localeCompare(date(b) || "9999");
        case "title":
          return a.title.localeCompare(b.title, "he");
        case "category":
          return catName(a).localeCompare(catName(b), "he") || date(b).localeCompare(date(a));
        case "status":
          return a.status.localeCompare(b.status) || date(b).localeCompare(date(a));
        case "updated":
          return b.updated_at.localeCompare(a.updated_at);
        default:
          return a.sort_order - b.sort_order || date(b).localeCompare(date(a));
      }
    });
    return r;
  }, [items.data, search, catFilter, statusFilter, sort, categories]);

  if (!meta) return <PageTitle>סוג תוכן לא נמצא</PageTitle>;

  return (
    <div>
      <PageTitle
        actions={
          <PrimaryButton onClick={() => setEditing("new")}>
            <Plus className="size-4" /> הוספת {meta.single}
          </PrimaryButton>
        }
      >
        {meta.label}
      </PageTitle>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי כותרת או תקציר"
            className={`${inputClass} ps-9`}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          מיון
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className={`${inputClass} !w-auto`}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className={`${inputClass} !w-auto`}
        >
          <option value="">כל הקטגוריות</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(categories, c.id)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} !w-auto`}
        >
          <option value="">כל הסטטוסים</option>
          <option value="published">פורסם</option>
          <option value="draft">טיוטה</option>
        </select>
        <span className="text-sm text-muted-foreground">{rows.length} פריטים</span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-start text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">כותרת</th>
              <th className="px-4 py-3 text-start font-semibold">קטגוריה</th>
              <th className="px-4 py-3 text-start font-semibold">תאריך</th>
              <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  טוען…
                </td>
              </tr>
            )}
            {!items.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  אין פריטים להצגה
                </td>
              </tr>
            )}
            {rows.map((x) => (
              <tr key={x.id} className="border-t hover:bg-accent/40">
                <td className="max-w-md truncate px-4 py-3 font-semibold">{x.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {categoryLabel(categories, x.category_id) || "—"}
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {x.item_date ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      x.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {STATUS_LABEL[x.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-end">
                  <GhostButton className="!px-3 !py-1.5" onClick={() => setEditing(x)}>
                    עריכה
                  </GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ItemEditor
          key={editing === "new" ? "new" : editing.id}
          typeMeta={meta}
          item={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
