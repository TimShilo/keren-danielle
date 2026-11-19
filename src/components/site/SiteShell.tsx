import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header + footer shared by every public page. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-theme min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
