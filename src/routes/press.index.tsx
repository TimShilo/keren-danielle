import { createFileRoute } from "@tanstack/react-router";
import { PressPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/press/")({
  head: () => ({ meta: [{ title: "כתבו עלינו – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <PressPage />
    </SiteShell>
  ),
});
