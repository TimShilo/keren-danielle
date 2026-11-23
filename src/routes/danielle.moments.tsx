import { createFileRoute } from "@tanstack/react-router";
import { MomentsPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/danielle/moments")({
  head: () => ({ meta: [{ title: "רגעים מחייה של דניאלי – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <MomentsPage />
    </SiteShell>
  ),
});
