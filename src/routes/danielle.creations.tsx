import { createFileRoute } from "@tanstack/react-router";
import { CreationsPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/danielle/creations")({
  head: () => ({ meta: [{ title: "יצירות של דניאלי – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <CreationsPage />
    </SiteShell>
  ),
});
