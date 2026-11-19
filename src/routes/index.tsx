import { createFileRoute } from "@tanstack/react-router";
import { AboutDanielle } from "@/components/site/AboutDanielle";
import { HomeHero } from "@/components/site/HomeHero";
import { NumbersAndActivities } from "@/components/site/NumbersAndActivities";
import { SiteShell } from "@/components/site/SiteShell";

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
    <SiteShell>
      <HomeHero />
      <AboutDanielle />
      <NumbersAndActivities />
    </SiteShell>
  );
}
