import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/content";
import { Field, GhostButton, PageTitle, PrimaryButton, inputClass } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/categories")({ component: Categories });

function Categories() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState("");

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order")
        .order("name_he");
      if (error) throw error;
      return data as Category[];
    },
  });
  const add = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !slug.trim()) throw new Error("יש למלא שם וכתובת (slug)");
      const { error } = await supabase
        .from("categories")
        .insert({ name_he: name.trim(), slug: slug.trim(), parent_id: parent || null });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      setSlug("");
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("נוסף");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const all = cats.data ?? [];
  const tops = all.filter((c) => !c.parent_id);

  return (
    <div className="max-w-3xl">
      <PageTitle>קטגוריות</PageTitle>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          add.mutate();
        }}
        className="mb-6 grid items-end gap-3 rounded-2xl bg-card p-5 shadow-sm sm:grid-cols-4"
      >
        <Field label="שם">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="כתובת (slug)">
          <input
            dir="ltr"
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </Field>
        <Field label="קטגוריית אב">
          <select className={inputClass} value={parent} onChange={(e) => setParent(e.target.value)}>
            <option value="">— ראשית —</option>
            {tops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_he}
              </option>
            ))}
          </select>
        </Field>
        <PrimaryButton disabled={add.isPending}>הוספה</PrimaryButton>
      </form>
      <div className="space-y-3">
        {cats.isLoading && <div className="text-muted-foreground">טוען…</div>}
        {!cats.isLoading && all.length === 0 && (
          <div className="rounded-2xl bg-card p-6 text-center text-muted-foreground">
            אין קטגוריות עדיין
          </div>
        )}
        {tops.map((t) => (
          <div key={t.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <Row c={t} onDelete={() => window.confirm("למחוק?") && del.mutate(t.id)} bold />
            {all
              .filter((c) => c.parent_id === t.id)
              .map((c) => (
                <div key={c.id} className="ms-6 border-s ps-4">
                  <Row c={c} onDelete={() => window.confirm("למחוק?") && del.mutate(c.id)} />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ c, onDelete, bold }: { c: Category; onDelete: () => void; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <span className={bold ? "font-extrabold" : "font-medium"}>{c.name_he}</span>
        <span className="ms-3 text-xs text-muted-foreground" dir="ltr">
          {c.slug}
        </span>
      </div>
      <GhostButton className="!px-3 !py-1 text-destructive" onClick={onDelete}>
        מחיקה
      </GhostButton>
    </div>
  );
}
