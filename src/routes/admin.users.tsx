import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Field, GhostButton, PageTitle, PrimaryButton, inputClass } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type RoleValue = "none" | "editor" | "admin";
const ROLE_LABEL: Record<RoleValue, string> = { none: "ללא גישה", editor: "עורך", admin: "מנהל" };

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: RoleValue;
}

/** User changes need the service key, so they go through the `admin-users` function (admins only). */
async function callUsers(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  if (error) {
    let msg = error.message;
    try {
      const j = await (error as unknown as { context: Response }).context.json();
      if (j?.error) msg = j.error as string;
    } catch {
      /* keep the generic message */
    }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error as string);
  return data;
}

function RoleSelect({ value, onChange, disabled }: { value: RoleValue; onChange: (v: RoleValue) => void; disabled?: boolean }) {
  return (
    <select className={inputClass} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as RoleValue)}>
      <option value="editor">עורך – עורך תוכן</option>
      <option value="admin">מנהל – כל ההרשאות, כולל משתמשים</option>
      <option value="none">ללא גישה</option>
    </select>
  );
}

function UserSheet({ user, onClose }: { user: UserRow | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const isNew = !user;
  const self = user?.id === session?.user.id;
  const [name, setName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleValue>(user?.role ?? "editor");

  const save = useMutation({
    mutationFn: async () => {
      if (isNew) {
        if (password.length < 8) throw new Error("הסיסמה חייבת להכיל לפחות 8 תווים");
        await callUsers({ action: "create", email, password, full_name: name, role });
      } else {
        await callUsers({ action: "update", id: user.id, email, full_name: name, role });
      }
    },
    onSuccess: () => {
      toast.success(isNew ? "המשתמש נוצר" : "נשמר");
      qc.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="admin-theme w-full overflow-y-auto bg-background sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{isNew ? "משתמש חדש" : "עריכת משתמש"}</SheetTitle>
        </SheetHeader>
        <form
          className="space-y-4 p-4"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="שם מלא">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="אימייל">
            <input type="email" dir="ltr" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {isNew && (
            <Field label="סיסמה" hint="לפחות 8 תווים. אפשר לשנות אותה בהמשך.">
              <input
                type="text"
                dir="ltr"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          )}
          {self ? (
            <Field label="תפקיד" hint="אי אפשר לשנות את התפקיד של עצמך.">
              <RoleSelect value={role} onChange={setRole} disabled />
            </Field>
          ) : (
            <Field label="תפקיד">
              <RoleSelect value={role} onChange={setRole} />
            </Field>
          )}
          <div className="flex gap-2 pt-2">
            <PrimaryButton type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />} {isNew ? "יצירת משתמש" : "שמירה"}
            </PrimaryButton>
            <GhostButton type="button" onClick={onClose}>
              ביטול
            </GhostButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function PasswordSheet({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const save = useMutation({
    mutationFn: async () => {
      if (password.length < 8) throw new Error("הסיסמה חייבת להכיל לפחות 8 תווים");
      await callUsers({ action: "set_password", id: user.id, password });
    },
    onSuccess: () => {
      toast.success("הסיסמה הוחלפה");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="left" className="admin-theme w-full overflow-y-auto bg-background sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">החלפת סיסמה</SheetTitle>
        </SheetHeader>
        <form
          className="space-y-4 p-4"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <p className="text-sm text-muted-foreground" dir="ltr">
            {user.email}
          </p>
          <Field label="סיסמה חדשה" hint="לפחות 8 תווים. המשתמש ייכנס איתה בפעם הבאה.">
            <input
              type="text"
              dir="ltr"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <div className="flex gap-2 pt-2">
            <PrimaryButton type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />} החלפת סיסמה
            </PrimaryButton>
            <GhostButton type="button" onClick={onClose}>
              ביטול
            </GhostButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function UsersPage() {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<UserRow | "new" | null>(null);
  const [pwFor, setPwFor] = useState<UserRow | null>(null);

  const users = useQuery({
    queryKey: ["users"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ data: profiles, error }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id,email,full_name,created_at").order("created_at"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (error) throw error;
      return (profiles ?? []).map((p) => {
        const rs = (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role);
        const role: RoleValue = rs.includes("admin") ? "admin" : rs.includes("editor") ? "editor" : "none";
        return { ...p, role } as UserRow;
      });
    },
  });

  if (!isAdmin) return <PageTitle>אין הרשאה</PageTitle>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <PageTitle>משתמשים</PageTitle>
        <PrimaryButton type="button" onClick={() => setEditing("new")}>
          <UserPlus className="size-4" /> הוספת משתמש
        </PrimaryButton>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        מנהל יכול לערוך את כל התוכן ולנהל משתמשים. עורך יכול לערוך תוכן בלבד.
      </p>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">שם</th>
              <th className="px-4 py-3 text-start font-semibold">אימייל</th>
              <th className="px-4 py-3 text-start font-semibold">תפקיד</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  טוען…
                </td>
              </tr>
            )}
            {(users.data ?? []).map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.full_name && u.full_name !== u.email ? u.full_name : "—"}</td>
                <td className="px-4 py-3" dir="ltr">
                  <span className="block text-start">{u.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      u.role === "admin" ? "bg-primary/15 text-primary" : u.role === "editor" ? "bg-secondary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <GhostButton type="button" className="!px-3 !py-1.5" onClick={() => setEditing(u)}>
                      <Pencil className="size-3.5" /> עריכה
                    </GhostButton>
                    <GhostButton type="button" className="!px-3 !py-1.5" onClick={() => setPwFor(u)}>
                      <KeyRound className="size-3.5" /> סיסמה
                    </GhostButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <UserSheet user={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {pwFor && <PasswordSheet user={pwFor} onClose={() => setPwFor(null)} />}
    </div>
  );
}
