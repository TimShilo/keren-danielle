import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import type { ReactNode } from "react";
import { QuoteCarousel } from "./QuoteCarousel";

const COLUMNS = [
  {
    title: "פעילות",
    links: [
      { label: "בריאות ורפואה", href: "/activities/%D7%91%D7%A8%D7%99%D7%90%D7%95%D7%AA-%D7%95%D7%A8%D7%A4%D7%95%D7%90%D7%94" },
      { label: "חינוך ולמידה", href: "/activities/%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%95%D7%9C%D7%9E%D7%99%D7%93%D7%94" },
      { label: "מסורת וחברה", href: "/activities/%D7%9E%D7%A1%D7%95%D7%A8%D7%AA-%D7%95%D7%97%D7%91%D7%A8%D7%94" },
      { label: "רווחה וקהילה", href: "/activities/%D7%A8%D7%95%D7%95%D7%97%D7%94-%D7%95%D7%A7%D7%94%D7%99%D7%9C%D7%94" },
    ],
  },
  {
    title: "מפת האתר",
    links: [
      { label: "בית", href: "/" },
      { label: 'על דניאלי ע"ה', href: "/danielle" },
      { label: "קרן דניאלי", href: "/about/foundation" },
      { label: "פרס דניאלי", href: "/prize" },
      { label: "פעילויות", href: "/activities" },
    ],
  },
  {
    title: "עוד",
    links: [
      { label: "ראו אור", href: "/published" },
      { label: "אירועים", href: "/events" },
      { label: "צור קשר", href: "/contact" },
    ],
  },
];

const SOCIAL = [
  { label: "פייסבוק", href: "https://www.facebook.com/TheDanielleFoundation/", Icon: Facebook },
  { label: "אינסטגרם", href: "https://www.instagram.com/keren_danielleil/", Icon: Instagram },
  { label: "יוטיוב", href: "https://www.youtube.com/@user-np8ys2vx5f", Icon: Youtube },
];

function ContactRow({ href, icon, children, external }: { href: string; icon: ReactNode; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center gap-4 text-[18px] leading-none"
    >
      <span className="grid size-[33px] shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors duration-300 group-hover:bg-brand-yellow group-hover:text-navy">
        {icon}
      </span>
      <span className="underline-offset-4 group-hover:underline" dir="ltr">
        {children}
      </span>
    </a>
  );
}

/** Same footer on every page of the site. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer dir="rtl" className="relative text-white">
      {/* Danielle's sentences over the video: part of the footer, so they appear on every page */}
      <QuoteCarousel />
      <div className="relative bg-[linear-gradient(to_bottom,#082944_26%,#0c448a_95%)] px-[5%] pb-14 lg:pb-0">
        <div className="pt-[54px] lg:pt-[calc(var(--u)*54)]"></div>
        <div className="mx-auto grid grid-cols-2 gap-x-6 gap-y-12 lg:h-[calc(var(--u)*350)] lg:max-w-none lg:grid-cols-[446fr_488fr_424fr_562fr] lg:gap-x-0">
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="text-[18px] font-bold leading-[1.3]">{c.title}</h2>
              <ul className="mt-6 space-y-2 lg:mt-[calc(var(--u)*26)] lg:space-y-[calc(var(--u)*7)]">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="inline-block text-[18px] leading-[1.5] underline-offset-4 hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 flex flex-col gap-5 lg:col-span-1 lg:items-start">
            <a href="/" aria-label="קרן דניאלי – דף הבית" className="block w-[230px] lg:w-[calc(var(--u)*270)]">
              <img src="/images/home/footer-logo.png" alt="קרן דניאלי – לזכר דניאלי זוננפלד" width={268} height={68} loading="lazy" className="block w-full" />
            </a>
            <div className="mt-2 flex flex-col gap-4 lg:mt-[calc(var(--u)*10)] lg:gap-[calc(var(--u)*16)]">
              <ContactRow href="https://www.facebook.com/TheDanielleFoundation/" external icon={<Facebook className="size-4" />}>
                קרן דניאלי בפייסבוק
              </ContactRow>
              <ContactRow href="tel:0505022213" icon={<Phone className="size-4" />}>
                050-502-2213
              </ContactRow>
              <ContactRow href="mailto:office@kerendanielle.org" icon={<Mail className="size-4" />}>
                office@kerendanielle.org
              </ContactRow>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-black px-[5%] pb-5 pt-8 lg:pt-[calc(var(--u)*34)]">
        <ul className="flex items-center justify-center gap-4" aria-label="רשתות חברתיות">
          {SOCIAL.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-9 place-items-center rounded-lg text-white transition-colors duration-300 hover:bg-brand-yellow hover:text-navy"
              >
                <Icon className="size-5" />
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-1 items-center gap-3 text-center text-[18px] leading-[1.3] lg:mt-[calc(var(--u)*30)] lg:grid-cols-3 lg:text-start">
          <p>© {year} כל הזכויות שמורות לקרן דניאלי</p>
          <p className="flex justify-center gap-8 lg:gap-12">
            <a href="/accessibility" className="underline-offset-4 hover:underline">
              הצהרת נגישות
            </a>
            <a href="/privacy" className="underline-offset-4 hover:underline">
              מדיניות פרטיות
            </a>
          </p>
          <p className="lg:text-end">אפיון עיצוב ופיתוח: תמנתי ווב דיזיין</p>
        </div>
      </div>
    </footer>
  );
}
