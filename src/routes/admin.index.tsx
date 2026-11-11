import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CONTENT_TYPES } from "@/lib/content";
import { PageTitle } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("type,status")
        .eq("language", "he");
      if (error) throw error;
      return data as { type: string; status: string }[];
    },
  });
  const { data: media } = useQuery({
    queryKey: ["media-count"],
    queryFn: async () => {
      const { count } = await supabase.from("media").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <div>
      <PageTitle>לוח בקרה</PageTitle>
      <div className="mb-6 rounded-2xl bg-secondary px-5 py-4 text-sm">
        כאן רואים במבט אחד כמה פריטים יש בכל סוג תוכן. פריטים בטיוטה אינם מופיעים באתר עד שמסמנים
        אותם "פורסם".
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {CONTENT_TYPES.map((t) => {
          const rows = (data ?? []).filter((r) => r.type === t.type);
          const published = rows.filter((r) => r.status === "published").length;
          return (
            <Link
              key={t.type}
              to="/admin/content/$type"
              params={{ type: t.slug }}
              className="rounded-2xl bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="text-sm text-muted-foreground">{t.label}</div>
              <div className="my-1 text-4xl font-bold">{isLoading ? "…" : rows.length}</div>
              <div className="text-sm text-muted-foreground">{published} מפורסמים</div>
            </Link>
          );
        })}
        <Link
          to="/admin/media"
          className="rounded-2xl bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="text-sm text-muted-foreground">קבצי מדיה</div>
          <div className="my-1 text-4xl font-bold">{media ?? "…"}</div>
          <div className="text-sm text-muted-foreground">תמונות ומסמכים</div>
        </Link>
      </div>
    </div>
  );
}
