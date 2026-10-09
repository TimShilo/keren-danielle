import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "timnati-web-design-new" },
      { name: "description", content: "timnati-web-design-new" },
      { property: "og:title", content: "timnati-web-design-new" },
      { property: "og:description", content: "timnati-web-design-new" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <div className="min-h-screen bg-background" />;
}
