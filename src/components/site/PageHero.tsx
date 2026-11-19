import { FoldHeading } from "./FoldHeading";

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
      <h1 className="text-[clamp(40px,10vw,64px)] font-bold leading-none lg:text-[calc(var(--u)*64)]">
        <FoldHeading text={title} trigger="mount" />
      </h1>
      <nav aria-label="פירורי לחם" className="mt-4 text-base leading-[1.3] lg:mt-[calc(var(--u)*14)] lg:text-xl">
        <ol className="flex flex-wrap items-center justify-center gap-x-2">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={`${i}-${c.label}`} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>//</span>}
                {c.href && !last ? (
                  <a href={c.href} className="underline-offset-4 hover:underline">
                    {c.label}
                  </a>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-brand-yellow" : ""}>
                    {c.label}
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
