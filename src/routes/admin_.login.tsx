import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [{ title: "כניסה לניהול | קרן דניאלי" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");

  useEffect(() => {
    if (!loading && session) navigate({ to: "/admin" });
  }, [loading, session, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("אימייל או סיסמה שגויים");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/settings`,
      });
      if (error) toast.error("לא ניתן לשלוח מייל איפוס");
      else toast.success("נשלח מייל לאיפוס סיסמה");
    }
    setBusy(false);
  }

  return (
    <div
      className="admin-theme flex min-h-screen items-center justify-center bg-background p-6"
      dir="rtl"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-8 shadow-sm"
      >
        <div className="mb-2 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-sidebar text-xl font-extrabold text-primary">
            קד
          </div>
          <h1 className="text-xl font-extrabold">קרן דניאלי</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "כניסה למערכת הניהול" : "איפוס סיסמה"}
          </p>
        </div>
        <label className="block text-sm font-medium">
          אימייל
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        {mode === "login" && (
          <label className="block text-sm font-medium">
            סיסמה
            <input
              type="password"
              required
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        )}
        <button
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === "login" ? "כניסה" : "שלח קישור לאיפוס"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "reset" : "login")}
          className="block w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "login" ? "שכחתי סיסמה" : "חזרה לכניסה"}
        </button>
      </form>
      <Toaster position="top-center" dir="rtl" />
    </div>
  );
}
