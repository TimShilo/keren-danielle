import { createFileRoute } from "@tanstack/react-router";
import { BooksPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/published")({
  head: () => ({ meta: [{ title: "ראו אור – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <BooksPage />
    </SiteShell>
  ),
});
