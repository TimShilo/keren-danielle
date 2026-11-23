import { createFileRoute } from "@tanstack/react-router";
import { BookPage } from "@/components/site/StoryPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/danielle/book")({
  head: () => ({ meta: [{ title: "הספר – דניאלי שלי – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <BookPage />
    </SiteShell>
  ),
});
