import { createFileRoute } from "@tanstack/react-router";
import { DanielleView } from "@/components/site/InfoPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/danielle/")({
  head: () => ({ meta: [{ title: "על דניאלי ע״ה – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <DanielleView />
    </SiteShell>
  ),
});
