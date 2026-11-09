import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "ניהול | קרן דניאלי" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});
