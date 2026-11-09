import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LayoutGrid,
  Layers,
  Newspaper,
  CalendarDays,
  BookOpen,
  FileText,
  Quote,
  Type,
  Video,
  Image as ImageIcon,
  FolderTree,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { CONTENT_TYPES } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const CONTENT_NAV = [
  { slug: "activities", label: "תתי פעילויות", icon: Layers },
  { slug: "news", label: "חדשות ועדכונים", icon: Newspaper },
  { slug: "events", label: "אירועים", icon: CalendarDays },
  { slug: "books", label: "ראו אור", icon: BookOpen },
  { slug: "press", label: "כתבות מהעיתונות", icon: FileText },
  { slug: "friends", label: "חברים מספרים", icon: Quote },
  { slug: "sentences", label: "משפטים", icon: Type },
  { slug: "videos", label: "סרטונים", icon: Video },
] as const;

function Count({ n }: { n: number | undefined }) {
  return (
    <span className="ms-auto min-w-7 rounded-full bg-white/15 px-2 py-0.5 text-center text-xs font-bold tabular-nums">
      {n ?? "…"}
    </span>
  );
}

const linkClass =
  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] font-semibold text-sidebar-foreground/80 transition-colors hover:bg-white/10 hover:text-sidebar-foreground";
const activeClass = "!bg-primary !text-primary-foreground shadow-sm";

export function AdminLayout() {
  const { session, loading, isStaff, isAdmin, roles, signOut } = useAuth();
  const navigate = useNavigate();

  // counts shown next to each section in the sidebar
  const counts = useQuery({
    queryKey: ["nav-counts"],
    enabled: !!session && isStaff,
    queryFn: async () => {
      const [items, media, cats, users, parents] = await Promise.all([
        supabase.from("content_items").select("type").eq("language", "he"),
        supabase.from("media").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("categories")
          .select("id", { count: "exact", head: true })
          .is("parent_id", null),
      ]);
      const byType: Record<string, number> = {};
      for (const r of items.data ?? []) byType[r.type] = (byType[r.type] ?? 0) + 1;
      return {
        byType,
        media: media.count ?? 0,
        categories: cats.count ?? 0,
        users: users.count ?? 0,
        parents: parents.count ?? 0,
      };
    },
  });
  const typeOfSlug = (slug: string) => CONTENT_TYPES.find((t) => t.slug === slug)?.type;

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/admin/login" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-foreground">אין הרשאת ניהול</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            החשבון {session.user.email} מחובר, אך עדיין לא הוגדר לו תפקיד ניהול. פנה למנהל המערכת.
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            התנתקות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme flex min-h-screen bg-background text-foreground" dir="rtl">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto bg-sidebar p-4 text-sidebar-foreground">
        <div className="mb-5 flex items-center gap-3 px-1 pt-1">
          <div className="grid size-12 place-items-center rounded-xl bg-white/10 text-lg font-extrabold text-primary">
            קד
          </div>
          <div className="leading-tight">
            <div className="text-lg font-extrabold">קרן דניאלי</div>
            <div className="text-xs text-sidebar-foreground/60">ניהול האתר</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            className={linkClass}
            activeProps={{ className: cn(linkClass, activeClass) }}
          >
            <LayoutDashboard className="size-5" /> לוח בקרה
          </Link>
          <div className="mb-1 mt-3 px-4 text-xs font-bold text-sidebar-foreground/45">תוכן</div>
          <Link
            to="/admin/parent-activities"
            className={linkClass}
            activeProps={{ className: cn(linkClass, activeClass) }}
          >
            <LayoutGrid className="size-5" /> פעילויות אב
            <Count n={counts.data?.parents} />
          </Link>
          {CONTENT_NAV.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              to="/admin/content/$type"
              params={{ type: slug }}
              className={linkClass}
              activeProps={{ className: cn(linkClass, activeClass) }}
            >
              <Icon className="size-5" /> {label}
              <Count
                n={counts.data?.byType[typeOfSlug(slug) ?? ""] ?? (counts.data ? 0 : undefined)}
              />
            </Link>
          ))}
          <div className="mb-1 mt-3 px-4 text-xs font-bold text-sidebar-foreground/45">ניהול</div>
          <Link
            to="/admin/media"
            className={linkClass}
            activeProps={{ className: cn(linkClass, activeClass) }}
          >
            <ImageIcon className="size-5" /> מדיה <Count n={counts.data?.media} />
          </Link>
          <Link
            to="/admin/categories"
            className={linkClass}
            activeProps={{ className: cn(linkClass, activeClass) }}
          >
            <FolderTree className="size-5" /> קטגוריות <Count n={counts.data?.categories} />
          </Link>
          {isAdmin && (
            <Link
              to="/admin/users"
              className={linkClass}
              activeProps={{ className: cn(linkClass, activeClass) }}
            >
              <Users className="size-5" /> משתמשים <Count n={counts.data?.users} />
            </Link>
          )}
          <Link
            to="/admin/settings"
            className={linkClass}
            activeProps={{ className: cn(linkClass, activeClass) }}
          >
            <Settings className="size-5" /> הגדרות
          </Link>
        </nav>

        <div className="mt-4 space-y-2 border-t border-sidebar-border pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm font-semibold hover:bg-white/10"
          >
            מעבר לאתר <ExternalLink className="size-4" />
          </a>
          <div className="px-1 pt-1 text-sm text-sidebar-foreground/80 break-all" dir="ltr">
            {session.user.email}
          </div>
          <div className="px-1 text-xs text-sidebar-foreground/50">
            {isAdmin ? "מנהל" : roles.includes("editor") ? "עורך" : ""}
          </div>
          <Link
            to="/admin/settings"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm hover:bg-white/10"
          >
            <KeyRound className="size-4" /> החלפת סיסמה
          </Link>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-3 py-2 text-sm hover:bg-white/10"
          >
            <LogOut className="size-4" /> התנתקות
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
      <Toaster position="top-center" dir="rtl" />
    </div>
  );
}
