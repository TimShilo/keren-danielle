import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "אירועים – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <EventsPage />
    </SiteShell>
  ),
});
