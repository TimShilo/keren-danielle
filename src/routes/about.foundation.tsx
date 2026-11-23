import { createFileRoute } from "@tanstack/react-router";
import { FoundationView } from "@/components/site/InfoPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about/foundation")({
  head: () => ({ meta: [{ title: "קרן דניאלי – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <FoundationView />
    </SiteShell>
  ),
});
