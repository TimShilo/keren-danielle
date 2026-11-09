import { createClient } from "@supabase/supabase-js";

// Public (publishable) credentials — safe to ship to the browser. Access is enforced by RLS.
const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ?? "https://zlkcomahgjufoazxdmae.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable_aPftYFveY3YmFgwvddyM2A_XK1ORG4z";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
