import { createFileRoute } from "@tanstack/react-router";
import { AboutOverview } from "@/components/site/InfoPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about/")({
  head: () => ({ meta: [{ title: "אודות – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <AboutOverview />
    </SiteShell>
  ),
});
