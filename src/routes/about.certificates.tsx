import { createFileRoute } from "@tanstack/react-router";
import { CertificatesView } from "@/components/site/InfoPages";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about/certificates")({
  head: () => ({ meta: [{ title: "תעודות העמותה – קרן דניאלי" }] }),
  component: () => (
    <SiteShell>
      <CertificatesView />
    </SiteShell>
  ),
});
