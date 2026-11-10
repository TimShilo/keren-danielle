import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUS_LABEL,
  CONTENT_TYPES,
  MOVABLE_TYPES,
  categoryLabel,
  mainOf,
  subOf,
  typeBySlug,
  type Category,
  type ContentItem,
} from "@/lib/content";
import { GhostButton, PageTitle, PrimaryButton, inputClass } from "@/components/admin/ui";
import { ItemEditor } from "@/components/admin/ItemEditor";

export const Route = createFileRoute("/admin/content/$type")({ component: ContentList });

type SortKey =
  "default" | "date_desc" | "date_asc" | "title" | "main" | "sub" | "status" | "updated";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "סדר ברירת מחדל" },
  { key: "date_desc", label: "תאריך (מהחדש לישן)" },
  { key: "date_asc", label: "תאריך (מהישן לחדש)" },
  { key: "title", label: "כותרת (א-ת)" },
  { key: "main", label: "קטגוריה ראשית" },
  { key: "sub", label: "קטגוריה משנית" },
  { key: "status", label: "סטטוס (טיוטות קודם)" },
  { key: "updated", label: "עודכן לאחרונה" },
];

function ContentList() {
  const { type: slug } = Route.useParams();
  const meta = typeBySlug(slug);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [mainFilter, setMainFilter] = useState("");
  const [subFilter, setSubFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<ContentItem | "new" | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCat, setBulkCat] = useState("");
  const qc = useQueryClient();

  const [bulkType, setBulkType] = useState("");
  const bulk = useMutation({
    mutationFn: async (patch: Partial<Pick<ContentItem, "status" | "category_id" | "type">>) => {
      const ids = selectedIds;
      const { error } = await supabase.from("content_items").update(patch).in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (n) => {
      toast.success(`עודכנו ${n} פריטים`);
      setSelected(new Set());
      setBulkCat("");
      setBulkType("");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["dashboard-counts"] });
      qc.invalidateQueries({ queryKey: ["nav-counts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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

  const categories = useMemo(() => cats.data ?? [], [cats.data]);
  const rows = useMemo(() => {
    let r = [...(items.data ?? [])];
    const q = search.trim();
    if (q) r = r.filter((x) => x.title.includes(q) || (x.excerpt ?? "").includes(q));
    if (mainFilter) r = r.filter((x) => mainOf(categories, x.category_id)?.id === mainFilter);
    if (subFilter) r = r.filter((x) => x.category_id === subFilter);
    if (statusFilter) r = r.filter((x) => x.status === statusFilter);
    const mainName = (x: ContentItem) => mainOf(categories, x.category_id)?.name_he ?? "￿";
    const subName = (x: ContentItem) => subOf(categories, x.category_id)?.name_he ?? "￿";
    const date = (x: ContentItem) => x.item_date ?? "";
    r.sort((a, b) => {
      switch (sort) {
        case "date_desc":
          return date(b).localeCompare(date(a));
        case "date_asc":
          return (date(a) || "9999").localeCompare(date(b) || "9999");
        case "title":
          return a.title.localeCompare(b.title, "he");
        case "main":
          return (
            mainName(a).localeCompare(mainName(b), "he") ||
            subName(a).localeCompare(subName(b), "he") ||
            date(b).localeCompare(date(a))
          );
        case "sub":
          return subName(a).localeCompare(subName(b), "he") || date(b).localeCompare(date(a));
        case "status":
          return a.status.localeCompare(b.status) || date(b).localeCompare(date(a));
        case "updated":
          return b.updated_at.localeCompare(a.updated_at);
        default:
          return a.sort_order - b.sort_order || date(b).localeCompare(date(a));
      }
    });
    return r;
  }, [items.data, search, mainFilter, subFilter, statusFilter, sort, categories]);

  // only act on selected rows that are currently visible (not hidden by filters)
  const selectedIds = useMemo(
    () => rows.filter((r) => selected.has(r.id)).map((r) => r.id),
    [rows, selected],
  );

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
          value={mainFilter}
          onChange={(e) => {
            setMainFilter(e.target.value);
            setSubFilter("");
          }}
          className={`${inputClass} !w-auto`}
        >
          <option value="">כל הקטגוריות הראשיות</option>
          {categories
            .filter((c) => !c.parent_id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_he}
              </option>
            ))}
        </select>
        <select
          value={subFilter}
          onChange={(e) => setSubFilter(e.target.value)}
          className={`${inputClass} !w-auto`}
        >
          <option value="">כל הקטגוריות המשניות</option>
          {categories
            .filter((c) => c.parent_id && (!mainFilter || c.parent_id === mainFilter))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_he}
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

      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-sidebar px-4 py-3 text-sidebar-foreground">
          <span className="font-bold">{selectedIds.length} נבחרו</span>
          <PrimaryButton
            className="!py-1.5"
            disabled={bulk.isPending}
            onClick={() => bulk.mutate({ status: "published" })}
          >
            פרסום
          </PrimaryButton>
          <GhostButton
            className="!py-1.5 !text-foreground"
            disabled={bulk.isPending}
            onClick={() => bulk.mutate({ status: "draft" })}
          >
            החזרה לטיוטה
          </GhostButton>
          <select
            value={bulkCat}
            onChange={(e) => setBulkCat(e.target.value)}
            className={`${inputClass} !w-auto !py-1.5 text-foreground`}
          >
            <option value="">שיוך לקטגוריה…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {categoryLabel(categories, c.id)}
              </option>
            ))}
          </select>
          <GhostButton
            className="!py-1.5 !text-foreground"
            disabled={!bulkCat || bulk.isPending}
            onClick={() => bulk.mutate({ category_id: bulkCat })}
          >
            החל קטגוריה
          </GhostButton>
          {meta && MOVABLE_TYPES.includes(meta.type) && (
            <>
              <select
                value={bulkType}
                onChange={(e) => setBulkType(e.target.value)}
                className={`${inputClass} !w-auto !py-1.5 text-foreground`}
              >
                <option value="">העברה לעמוד…</option>
                {CONTENT_TYPES.filter(
                  (t) => MOVABLE_TYPES.includes(t.type) && t.type !== meta.type,
                ).map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
              <GhostButton
                className="!py-1.5 !text-foreground"
                disabled={!bulkType || bulk.isPending}
                onClick={() =>
                  window.confirm(`להעביר ${selectedIds.length} פריטים לעמוד שנבחר?`) &&
                  bulk.mutate({ type: bulkType as ContentItem["type"] })
                }
              >
                העבר
              </GhostButton>
            </>
          )}
          <button className="ms-auto text-sm underline" onClick={() => setSelected(new Set())}>
            ביטול בחירה
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-start text-xs text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="בחר הכול"
                  checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())
                  }
                />
              </th>
              <th className="px-4 py-3 text-start font-semibold">כותרת</th>
              <th className="px-4 py-3 text-start font-semibold">קטגוריה ראשית</th>
              <th className="px-4 py-3 text-start font-semibold">קטגוריה משנית</th>
              <th className="px-4 py-3 text-start font-semibold">תאריך</th>
              <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  טוען…
                </td>
              </tr>
            )}
            {!items.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  אין פריטים להצגה
                </td>
              </tr>
            )}
            {rows.map((x) => (
              <tr key={x.id} className="border-t hover:bg-accent/40">
                <td className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="בחר פריט"
                    checked={selected.has(x.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(x.id);
                      else next.delete(x.id);
                      setSelected(next);
                    }}
                  />
                </td>
                <td className="max-w-md truncate px-4 py-3 font-semibold">{x.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {mainOf(categories, x.category_id)?.name_he ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {subOf(categories, x.category_id)?.name_he ?? "—"}
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
