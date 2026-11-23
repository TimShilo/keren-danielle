import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/components/site/InfoPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "צור קשר – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <ContactView />
    </SiteShell>
  ),
});
