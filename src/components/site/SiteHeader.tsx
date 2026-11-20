import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMegaMenu } from "@/lib/activities";
import { MegaMenu } from "./MegaMenu";
import { FxIconButton } from "./FxButton";

const NAV = [
  { label: "אודות", href: "/about" },
  { label: "פעילויות", href: "/activities" },
  { label: "עוד", href: "#" },
  { label: "פרס דניאלי", href: "/prize" },
  { label: "כתבו עלינו", href: "/press" },
  { label: "צור קשר", href: "/contact" },
  { label: "אירועים", href: "/events" },
  { label: "EN", href: "/en" },
];

/** Floating white pill: logo on the right, menu in the middle, yellow search button on the left. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useMegaMenu(); // warm the menu data

  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 180);
  };
  useEffect(() => setMega(false), [path]);
  const isActive = (href: string) => href !== "#" && (path === href || path.startsWith(`${href}/`));

  // Stays pinned to the top while scrolling and shrinks a little to take less room.
  useEffect(() => {
    const onScroll = () => setScrolled((was) => (was ? window.scrollY > 12 : window.scrollY > 60));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-4 z-50 transition-[top] duration-300 lg:inset-x-[5%] ${
        scrolled ? "top-2 lg:top-[calc(var(--u)*14)]" : "top-4 lg:top-[calc(var(--u)*48)]"
      }`}
      onPointerLeave={closeMega}
    >
      {/* mega menu panel: opens under the pill and slides behind it */}
      <div
        inert={!mega}
        onPointerEnter={openMega}
        className={`absolute inset-x-0 top-0 hidden overflow-hidden rounded-[calc(var(--u)*48)] bg-[linear-gradient(to_bottom,#072845_30%,#0c448a_100%)] shadow-[0_24px_60px_rgba(7,40,69,0.35)] transition-[opacity,transform] duration-300 lg:block ${
          mega ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <MegaMenu onNavigate={() => setMega(false)} />
      </div>

      <div
        className={`relative z-10 flex items-center justify-between rounded-full border border-white/70 bg-gradient-to-b from-white/55 to-white/25 shadow-[0_8px_32px_rgba(7,40,69,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-150 pe-3 ps-5 transition-[height] duration-300 lg:pe-[calc(var(--u)*31)] lg:ps-[calc(var(--u)*109)] ${
          scrolled ? "h-14 lg:h-[calc(var(--u)*68)]" : "h-16 lg:h-[calc(var(--u)*98)]"
        }`}
      >
        {/* Logo (heart + wordmark) */}
        <a
          href="/"
          aria-label="קרן דניאלי – דף הבית"
          className={`relative order-1 block shrink-0 transition-[width,height] duration-300 ${
            scrolled
              ? "h-8 w-[120px] lg:h-[calc(var(--u)*41)] lg:w-[calc(var(--u)*158)]"
              : "h-9 w-[140px] lg:h-[calc(var(--u)*57)] lg:w-[calc(var(--u)*221)]"
          }`}
        >
          <img
            src="/images/home/svg/logo-text.svg"
            alt=""
            className="absolute block h-full"
            style={{ insetInlineStart: 0, width: "42.31%", top: 0 }}
          />
          <img
            src="/images/home/svg/logo-heart.svg"
            alt=""
            className="absolute block"
            style={{ insetInlineEnd: 0, width: "51.49%", top: "15%", height: "67.54%" }}
          />
        </a>

        <nav
          aria-label="תפריט ראשי"
          className="order-2 hidden flex-1 items-center justify-start gap-[calc(var(--u)*50)] ps-[calc(var(--u)*189)] text-[calc(var(--u)*24)] leading-[1.3] lg:flex"
        >
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              onPointerEnter={n.href === "/activities" ? openMega : closeMega}
              onFocus={n.href === "/activities" ? openMega : undefined}
              aria-haspopup={n.href === "/activities" ? "true" : undefined}
              aria-expanded={n.href === "/activities" ? mega : undefined}
              className={`whitespace-nowrap transition-colors duration-300 hover:text-brand-yellow focus-visible:text-brand-yellow ${
                isActive(n.href) || (n.href === "/activities" && mega) ? "text-brand-yellow" : ""
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="order-3 flex items-center gap-2 ms-auto lg:ms-0">
          <FxIconButton
            variant="yellow"
            aria-label="חיפוש"
            className={`shrink-0 transition-[width,height] duration-300 ${
              scrolled ? "size-10 lg:size-[calc(var(--u)*48)]" : "size-12 lg:size-[calc(var(--u)*69)]"
            }`}
          >
            <img src="/images/home/svg/search-icon.svg" alt="" className="size-full" />
          </FxIconButton>
          <FxIconButton
            variant="ghost"
            aria-label="תפריט"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="size-12 lg:hidden"
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-navy" />
              <span className="block h-0.5 w-6 bg-navy" />
              <span className="block h-0.5 w-6 bg-navy" />
            </span>
          </FxIconButton>
        </div>
      </div>

      {open && (
        <nav
          aria-label="תפריט נייד"
          className="mt-2 flex flex-col rounded-3xl border border-white/70 bg-white/60 px-6 py-3 text-xl shadow-lg backdrop-blur-xl lg:hidden"
        >
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className={`border-b border-navy/10 py-3 last:border-0 ${isActive(n.href) ? "text-[#b89400]" : ""}`}
            >
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
