import { createFileRoute } from "@tanstack/react-router";
import { AboutDanielle } from "@/components/site/AboutDanielle";
import { HomeHero } from "@/components/site/HomeHero";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "קרן דניאלי – לזכר דניאלי זוננפלד ע״ה" },
      {
        name: "description",
        content: "קרן דניאלי – עמותה להנצחת דניאלי זוננפלד ע״ה: מפעלים של עשיה ונתינה, אור, אכפתיות ואהבה.",
      },
      { property: "og:title", content: "קרן דניאלי – לזכר דניאלי זוננפלד ע״ה" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="site-theme min-h-screen">
      <SiteHeader />
      <HomeHero />
      <AboutDanielle />
    </main>
  );
}
