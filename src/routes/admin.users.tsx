import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageTitle, inputClass } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type RoleValue = "none" | "editor" | "admin";

function UsersPage() {
  const { isAdmin, session } = useAuth();
  const qc = useQueryClient();

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
        const role: RoleValue = rs.includes("admin")
          ? "admin"
          : rs.includes("editor")
            ? "editor"
            : "none";
        return { ...p, role };
      });
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: RoleValue }) => {
      const { error: e1 } = await supabase.from("user_roles").delete().eq("user_id", id);
      if (e1) throw e1;
      if (role !== "none") {
        const { error } = await supabase.from("user_roles").insert({ user_id: id, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("עודכן");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return <PageTitle>אין הרשאה</PageTitle>;

  return (
    <div className="max-w-3xl">
      <PageTitle>משתמשים</PageTitle>
      <p className="mb-4 text-sm text-muted-foreground">
        משתמש חדש נרשם דרך ממשק האימות של Supabase או מוזמן משם, ואז מקבלים כאן תפקיד.
      </p>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">אימייל</th>
              <th className="px-4 py-3 text-start font-semibold">תפקיד</th>
            </tr>
          </thead>
          <tbody>
            {(users.data ?? []).map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3" dir="ltr">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <select
                    className={`${inputClass} !w-auto`}
                    value={u.role}
                    disabled={u.id === session?.user.id}
                    onChange={(e) =>
                      setRole.mutate({ id: u.id, role: e.target.value as RoleValue })
                    }
                  >
                    <option value="none">ללא גישה</option>
                    <option value="editor">עורך</option>
                    <option value="admin">מנהל</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
