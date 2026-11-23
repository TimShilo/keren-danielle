import { createFileRoute } from "@tanstack/react-router";
import { SongsPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/danielle/songs")({
  head: () => ({ meta: [{ title: "השירים של דניאלי – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <SongsPage />
    </SiteShell>
  ),
});
