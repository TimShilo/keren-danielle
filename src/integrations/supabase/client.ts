import { createClient } from "@supabase/supabase-js";

// Public (publishable) credentials — safe to ship to the browser. Access is enforced by RLS.
const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ?? "https://zlkcomahgjufoazxdmae.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable_aPftYFveY3YmFgwvddyM2A_XK1ORG4z";

const REMEMBER_KEY = "kd-remember-me";

/**
 * "Remember me": when on (the default) the login lives in localStorage and survives closing the
 * browser; when off it lives in sessionStorage and is gone when the browser is closed.
 */
export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
  } catch {
    /* storage unavailable */
  }
}

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(REMEMBER_KEY) !== "false";
  } catch {
    return true;
  }
}

const authStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    const [keep, drop] = getRememberMe()
      ? [window.localStorage, window.sessionStorage]
      : [window.sessionStorage, window.localStorage];
    keep.setItem(key, value);
    drop.removeItem(key);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
