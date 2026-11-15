import { useEffect, useState } from "react";
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
    >
      <div
        className={`flex items-center justify-between rounded-full border border-white/70 bg-gradient-to-b from-white/55 to-white/25 shadow-[0_8px_32px_rgba(7,40,69,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-150 pe-3 ps-5 transition-[height] duration-300 lg:pe-[calc(var(--u)*31)] lg:ps-[calc(var(--u)*109)] ${
          scrolled ? "h-14 lg:h-[calc(var(--u)*68)]" : "h-16 lg:h-[calc(var(--u)*98)]"
        }`}
      >
        {/* Logo (heart + wordmark) */}
        <a
          href="/"
          aria-label="קרן דניאלי – דף הבית"
          className={`relative order-1 block shrink-0 transition-[width,height] duration-300 ${
            scrolled
              ? "h-8 w-[120px] lg:h-[calc(var(--u)*45)] lg:w-[calc(var(--u)*174)]"
              : "h-9 w-[140px] lg:h-[calc(var(--u)*64.28)] lg:w-[calc(var(--u)*249)]"
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
            <a key={n.label} href={n.href} className="whitespace-nowrap transition-opacity hover:opacity-60">
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
            <a key={n.label} href={n.href} className="border-b border-navy/10 py-3 last:border-0">
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
