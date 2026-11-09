import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "editor";
interface AuthState {
  session: Session | null;
  roles: Role[];
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setRoles([]);
        setLoading(false);
        return;
      }
      // defer to avoid deadlocking inside the auth callback
      setTimeout(async () => {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
        setRoles((data ?? []).map((r) => r.role as Role));
        setLoading(false);
      }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    session,
    roles,
    loading,
    isStaff: roles.length > 0,
    isAdmin: roles.includes("admin"),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
