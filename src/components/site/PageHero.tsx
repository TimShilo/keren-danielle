import { FoldHeading } from "./FoldHeading";

/** At most five words, then "…" so people know there is more */
export const shortTitle = (t: string) => {
  const w = t.trim().split(/\s+/);
  return w.length > 5 ? `${w.slice(0, 5).join(" ")}…` : t;
};

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Inner-page header area: navy gradient, centred H1 (64px bold) and breadcrumbs ("בית // ... // עמוד").
 * Flat on top (the floating header sits on it); the next section opens with a curve that cuts into it.
 */
export function PageHero({ title, crumbs }: { title: string; crumbs: Crumb[] }) {
  return (
    <section
      aria-label={title}
      className="relative isolate overflow-hidden bg-[linear-gradient(to_bottom,#082944_26%,#0c448a_95%)] px-[5%] pb-24 pt-[150px] text-center text-white lg:h-[calc(var(--u)*409)] lg:pb-0 lg:pt-[calc(var(--u)*192)]"
    >
      <h1 title={title} className="text-[clamp(32px,9vw,50px)] font-bold leading-none lg:text-[50px]">
        <FoldHeading text={shortTitle(title)} trigger="mount" />
      </h1>
      <nav aria-label="פירורי לחם" className="mt-4 text-sm leading-[1.3] lg:mt-[calc(var(--u)*14)] lg:text-[16px]">
        <ol className="flex flex-wrap items-center justify-center gap-x-2">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={`${i}-${c.label}`} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>//</span>}
                {c.href && !last ? (
                  <a href={c.href} className="cursor-pointer underline-offset-4 hover:text-brand-yellow hover:underline">
                    {c.label}
                  </a>
                ) : (
                  <span aria-current={last ? "page" : undefined} title={c.label} className={last ? "text-brand-yellow" : ""}>
                    {last ? shortTitle(c.label) : c.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}
