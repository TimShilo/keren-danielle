import { createFileRoute } from "@tanstack/react-router";
import { HonorView } from "@/components/site/InfoPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about/honor")({
  head: () => ({ meta: [{ title: "הוקרה לקרן דניאלי – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <HonorView />
    </SiteShell>
  ),
});
