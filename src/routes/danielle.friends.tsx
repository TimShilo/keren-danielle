import { createFileRoute } from "@tanstack/react-router";
import { FriendsPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/danielle/friends")({
  head: () => ({ meta: [{ title: "חברים כותבים על דניאלי – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <FriendsPage />
    </SiteShell>
  ),
});
