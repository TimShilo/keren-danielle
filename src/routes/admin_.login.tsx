import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { getRememberMe, setRememberMe, supabase } from "@/integrations/supabase/client";
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
  const [remember, setRemember] = useState(true);
  const [mode, setMode] = useState<"login" | "reset">("login");

  useEffect(() => {
    setRemember(getRememberMe());
  }, []);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/admin" });
  }, [loading, session, navigate]);

  async function signInWithGoogle() {
    setBusy(true);
    setRememberMe(remember);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin/login` },
    });
    if (error) {
      setBusy(false);
      toast.error("ההתחברות עם Google עדיין לא הוגדרה במערכת");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      setRememberMe(remember);
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
        method="post"
        autoComplete="on"
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
            name="email"
            autoComplete="username"
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
              name="password"
              autoComplete="current-password"
              required
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        )}
        {mode === "login" && (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            זכור אותי
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
        {mode === "login" && (
          <>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              או
              <span className="h-px flex-1 bg-border" />
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-xl border bg-card px-4 py-2.5 font-semibold transition-colors hover:bg-accent disabled:opacity-60"
            >
              <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
                />
              </svg>
              התחברות עם Google
            </button>
          </>
        )}
      </form>
      <Toaster position="top-center" dir="rtl" />
    </div>
  );
}
