import { useRouterState } from "@tanstack/react-router";

export interface MenuGroup {
  title: string;
  href: string;
  links: { label: string; href: string }[];
}

/** The "about" pages: shared by the desktop dropdown and the mobile menu. */
export const ABOUT_GROUPS: MenuGroup[] = [
  {
    title: 'על דניאלי ע"ה',
    href: "/danielle",
    links: [
      { label: "חברים כותבים על דניאלי", href: "/danielle/friends" },
      { label: "רגעים מחייה של דניאלי", href: "/danielle/moments" },
      { label: "יצירות של דניאלי", href: "/danielle/creations" },
      { label: "השירים של דניאלי", href: "/danielle/songs" },
      { label: "הספר – דניאלי שלי", href: "/danielle/book" },
    ],
  },
  {
    title: "קרן דניאלי",
    href: "/about/foundation",
    links: [
      { label: "הוקרה לקרן דניאלי", href: "/about/honor" },
      { label: "תעודות העמותה", href: "/about/certificates" },
    ],
  },
];

export const MORE_GROUPS: MenuGroup[] = [
  { title: "עוד באתר", href: "#", links: [{ label: "ראו אור", href: "/published" }, { label: "חדשות ועדכונים", href: "/news" }] },
];

const norm = (x: string) => {
  try {
    return decodeURIComponent(x).replace(/\/+$/, "");
  } catch {
    return x.replace(/\/+$/, "");
  }
};

/** Dropdown panel content: columns of links, same look as the activities mega menu. */
export function PanelMenu({ groups, onNavigate }: { groups: MenuGroup[]; onNavigate?: () => void }) {
  const path = norm(useRouterState({ select: (s) => s.location.pathname }));
  const here = (href: string) => href !== "#" && norm(href) === path;
  return (
    <div dir="rtl" className="grid grid-cols-4 gap-x-[calc(var(--u)*40)] px-[calc(var(--u)*96)] pb-[calc(var(--u)*40)] pt-[calc(var(--u)*130)]">
      {groups.map((g) => (
        <div key={g.title} className="min-w-0">
          {g.href !== "#" ? (
            <a
              href={g.href}
              onClick={onNavigate}
              aria-current={here(g.href) ? "page" : undefined}
              className={`block text-[calc(var(--u)*24)] font-bold leading-[1.15] transition-colors duration-300 hover:text-brand-yellow ${here(g.href) ? "text-brand-yellow" : "text-white"}`}
            >
              {g.title}
            </a>
          ) : (
            <span className="block text-[calc(var(--u)*24)] font-bold leading-[1.15] text-white">{g.title}</span>
          )}
          <ul className="mt-[calc(var(--u)*14)] space-y-[calc(var(--u)*6)]">
            {g.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={onNavigate}
                  aria-current={here(l.href) ? "page" : undefined}
                  className={`block text-[calc(var(--u)*18)] leading-[1.35] transition-colors duration-300 hover:text-brand-yellow ${here(l.href) ? "text-brand-yellow" : "text-white/90"}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
