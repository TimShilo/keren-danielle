import { Facebook, Mail, Phone } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EnterFromCorner } from "./EnterFromCorner";
import { FoldHeading } from "./FoldHeading";
import { FxButton } from "./FxButton";
import { Eyebrow } from "./HomeHero";
import { PageHero, type Crumb } from "./PageHero";
import { PageSections } from "./PageSections";
import { RevealStripes } from "./RevealStripes";
import { RichScrollText } from "./RichScrollText";
import { ScrollText } from "./ScrollText";

const H2 = "mt-4 text-[clamp(36px,8vw,64px)] font-bold leading-none lg:mt-[calc(var(--u)*30)] lg:text-[calc(var(--u)*64)]";
const BODY = "rte-content text-lg leading-[1.5] text-navy lg:text-[calc(var(--u)*24)] lg:leading-[1.45]";
const CARD = "shadow-[4px_4px_9px_rgba(0,0,0,0.25)]";
const BTN =
  "h-[50px] text-xl lg:h-[calc(var(--u)*50)] lg:text-[calc(var(--u)*20)] [&_.fx-label]:leading-none lg:[&_.fx-label]:px-[calc(var(--u)*34)]";

const HOME: Crumb = { label: "בית", href: "/" };
const ABOUT: Crumb = { label: "אודות", href: "/about" };

function Head({ eyebrow, title, center = false }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <Eyebrow className={center ? "justify-center" : ""}>{eyebrow}</Eyebrow>
      <h2 className={H2}>
        <FoldHeading text={title} />
      </h2>
    </div>
  );
}

const paras = (...p: string[]) => p.map((t) => `<p>${t}</p>`).join("");

/* ───────────── אודות ───────────── */
export function AboutOverview() {
  return (
    <>
      <PageHero title="אודות" crumbs={[HOME, { label: "אודות" }]} />
      <PageSections
        sections={[
          {
            key: "intro",
            label: "אודות הקרן",
            tone: "glow",
            children: (
              <div className="max-w-[1100px]">
                <Head eyebrow="אודות" title="קרן דניאלי" />
                <RichScrollText
                  className={`${BODY} mt-8 lg:mt-[calc(var(--u)*40)]`}
                  html={paras(
                    'קרן דניאלי הינה עמותה שהוקמה בשנת תשע"ה (2015) כדי להנציח את זכרה הבלתי נשכח של דניאלי זוננפלד ע"ה.',
                    "מטרת העמותה היא ליזום ולהשתתף במפעלים של עשיה ונתינה, ולהפיץ את האור האכפתיות והאהבה שסמלו את דניאלי.",
                  )}
                />
              </div>
            ),
          },
          {
            key: "two",
            label: "על דניאלי ועל הקרן",
            tone: "white",
            children: (
              <div className="grid gap-16 lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
                <div>
                  <Eyebrow>הסיפור</Eyebrow>
                  <h2 className={H2}>
                    <FoldHeading text={'על דניאלי ע"ה'} />
                  </h2>
                  <ScrollText
                    as="p"
                    text={"דניאלי זוננפלד ע\"ה, נולדה בריו דה ז'ניירו שבברזיל בב' באדר א' תשנ\"ה (02/02/1995). כבר מקטנות ניתן היה להבחין בייחודיות שלה…"}
                    className={`${BODY} mt-6 lg:mt-[calc(var(--u)*32)]`}
                  />
                  <div className="mt-8">
                    <FxButton href="/danielle" variant="yellow" className={BTN}>
                      לסיפור המלא ←
                    </FxButton>
                  </div>
                </div>
                <div>
                  <Eyebrow>העמותה</Eyebrow>
                  <h2 className={H2}>
                    <FoldHeading text="קרן דניאלי" />
                  </h2>
                  <ScrollText
                    as="p"
                    text={'הקרן הוקמה בשנת תשע"ה (2015) כדי להנציח את זכרה הבלתי נשכח של דניאלי זוננפלד ע"ה.'}
                    className={`${BODY} mt-6 lg:mt-[calc(var(--u)*32)]`}
                  />
                  <div className="mt-8">
                    <FxButton href="/about/foundation" variant="yellow" className={BTN}>
                      על הקרן ←
                    </FxButton>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}

/* ───────────── על דניאלי ע"ה ───────────── */
const DANIELLE_LINKS = [
  { label: "חברים כותבים על דניאלי", href: "/danielle/friends" },
  { label: "רגעים מחייה של דניאלי", href: "/danielle/moments" },
  { label: "יצירות של דניאלי", href: "/danielle/creations" },
  { label: "השירים של דניאלי", href: "/danielle/songs" },
  { label: "הספר על דניאלי", href: "/danielle/book" },
];

function LinkCards({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="mx-auto mt-10 grid max-w-[1500px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-[calc(var(--u)*50)] lg:grid-cols-3 lg:gap-[calc(var(--u)*30)]">
      {items.map((l) => (
        <li key={l.href}>
          <a
            href={l.href}
            className={`group flex h-full min-h-[120px] items-center justify-between gap-4 rounded-[25px] bg-white px-8 py-7 text-navy transition-transform duration-300 hover:-translate-y-1 lg:px-[calc(var(--u)*40)] ${CARD}`}
          >
            <span className="text-[22px] font-bold leading-[1.2] lg:text-[calc(var(--u)*26)]">{l.label}</span>
            <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-navy transition-colors duration-300 group-hover:border-brand-yellow group-hover:bg-brand-yellow">
              ←
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

const DANIELLE_CARDS = [
  { label: "חברים כותבים על דניאלי", href: "/danielle/friends", img: "/images/pages/danielle-friends.webp" },
  { label: "רגעים מחייה של דניאלי", href: "/danielle/moments", img: "/images/pages/danielle-moments.webp" },
  { label: "יצירות של דניאלי", href: "/danielle/creations", img: "/images/pages/danielle-creations.webp" },
  { label: "השירים של דניאלי", href: "/danielle/songs", img: "/images/pages/danielle-songs.webp" },
  { label: 'הספר "דניאלי שלי"', href: "/danielle/book", img: "/images/pages/danielle-book.webp" },
];

export function DanielleView() {
  return (
    <>
      <PageHero title="על דניאלי" crumbs={[HOME, { label: "על דניאלי" }]} />
      <PageSections
        sections={[
          {
            key: "story",
            label: "הסיפור של דניאלי",
            tone: "glow",
            children: (
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
                <div>
                  <Eyebrow>הסיפור של דניאלי</Eyebrow>
                  <h2 className={H2}>
                    <FoldHeading text="על דניאלי" />
                  </h2>
                  <RichScrollText
                    className={`${BODY} mt-6 lg:mt-[calc(var(--u)*32)]`}
                    html={paras(
                      "דניאלי זוננפלד ע\"ה, נולדה בריו דה ז'ניירו שבברזיל בב' באדר א' תשנ\"ה (02/02/1995). כבר מקטנות ניתן היה להבחין בייחודיות שלה. בחיוכה, באהבת האדם שבה ובשמחת החיים המיוחדת, שבתה את ליבם של כל רואיה. פשטותה הנפלאה, במיוחד לאור כשרונותיה הנדירים, הקסימה את כל סביבתה.",
                      'בהיותה בת שמונה וחצי, עלתה עם משפחתה ארצה והתגוררה ברעננה. למדה בבתי הספר היסודיים "בילו" ו"נועם", בחטיבת הביניים "חורב" ברעננה ובתיכון לוסטיג ברמת גן. בכל מקום בו למדה הצטיינה בלימודיה והייתה חביבת המורות והחברות. דניאלי היתה לומדת מכל אדם ומאירת פנים, וכך בחרה לעצמה קו של נתינה מושלמת ואהבת אין קץ לכל אדם באשר הוא.',
                    )}
                  />
                </div>
                <RevealStripes src="/images/pages/danielle-ward.webp" alt="דניאלי עם הילדים במחלקה" className="mx-auto w-full max-w-[560px] lg:max-w-none">
                  <img
                    data-deco
                    src="/images/home/svg/bracket-yellow.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -bottom-4 -right-4 hidden w-28 translate-x-3 translate-y-3 lg:block"
                  />
                </RevealStripes>
              </div>
            ),
          },
          {
            key: "story2",
            label: "המשך הסיפור",
            tone: "dark",
            edge: "sag",
            className: "relative lg:min-h-[calc(var(--u)*760)]",
            children: (
              <>
                <div className="relative z-10 max-w-[1200px] lg:mr-auto lg:max-w-[calc(var(--u)*880)]">
                  <RichScrollText
                    className={BODY.replace("text-navy", "text-white")}
                    html={paras(
                      "עם סיום לימודיה, בהצטיינות רבה, בחרה דניאלי לשרת בשירות לאומי במחלקת אונקולוגיה ילדים בבית החולים \"שניידר\" בפתח תקוה, מתוך שאיפה לשרת במקום בו תוכל לתרום ולעזור. בדרכה המיוחדת, זכתה דניאלי להביא חיוך לפניהם המיוסרות של הילדים החולים ולמשפחותיהם. כמו קרן אור זרחה עם בואה למחלקה. היא הייתה שם בשביל הילדים עם אוזן קשבת ויד תומכת. לא חששה להתמודד עם קשיים, והייתה מאושרת כשהצליחה להעניק לילדים אופטימיות ליום המחר. דניאלי חתמה את שנת השירות הראשונה שלה במחלקה האונקולוגית והחליטה להקדיש את שנת השירות השניה לנוער בסיכון בעיר עכו. גם בשנה זו המשיכה להתנדב במקביל במחלקה האונקולוגית ב\"שניידר\", למרות המרחק.",
                      "תושבי עכו והשוהים במחלקת אונקולוגיה ב\"שניידר\" זכו לנתינה יחודית ויוצאת דופן מדניאלי. בשני המקומות ראתה דניאלי שליחות מיוחדת להיות שם בשביל אלו שהמלחמה היומיומית שלהם היא מלחמת השגרה, בעבור נוער בסיכון שנלחם על מיטה חמה ועל מעט אהבה, לצד חולים שהמלחמה שלהם היא מלחמת החיים. בשתי המלחמות האלו דניאלי הייתה שם כדי לעזור להם לנצח.",
                      "היה זה אך טבעי, שלאחר התקופה המשמעותית שלה ב\"שניידר\", החליטה דניאלי ללמוד רפואה (תוצאות הפסיכומטרי: 768 הגיעו במהלך השבעה…), מתוך שאיפה להעניק \"רפואה עם לב\".",
                      "עם לכתה, בתאונת דרכים טראגית, אחרי עוד יום של מסירות טוטאלית לילדים ב\"שניידר\", בלילה מר, ליל תענית אסתר, י\"ג אדר תשע\"ה, כבה האור הגדול שזרח מפניה של דניאלי. אור של צניעות, ענווה, אהבת חסד, כשרונות ברוכים ושמחת חיים. \"קרן דניאלי\" הוקמה על ידי אביה מר מוטי זוננפלד להנצחת זכרה הברוך, וכהמשך טבעי לפועלה בימיה הקצרים.",
                      "<strong>יהא זכרה ברוך!</strong>",
                    )}
                  />
                </div>
                {/* the portrait stands on the bottom edge of the band, on the right */}
                <img
                  src="/images/pages/danielle-about.webp"
                  alt={'דניאלי זוננפלד ע"ה'}
                  loading="lazy"
                  className="pointer-events-none absolute bottom-0 right-0 hidden w-[calc(var(--u)*640)] lg:block lg:right-[5%]"
                />
              </>
            ),
          },
          {
            key: "more",
            label: "עוד על דניאלי",
            tone: "glow",
            children: (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-[calc(var(--u)*26)]">
                {DANIELLE_CARDS.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      className="group relative block aspect-[1/1.05] overflow-hidden rounded-[14px] shadow-[2px_6px_14px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <img src={c.img} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-4 text-center text-[18px] font-bold leading-[1.15] text-white lg:text-[calc(var(--u)*20)]">{c.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </>
  );
}

/* ───────────── קרן דניאלי ───────────── */
const MEMBERS = ["ר' משה זוננפלד", 'פרופ\' יעקב דולינגר ז"ל', 'עו"ד זלי יפה', "הרב אלימלך פירר", "זאב נתן יפה", "דני זוננפלד", "אלברטו אדלמן", "דניאל אשר"];

export function FoundationView() {
  return (
    <>
      <PageHero title="קרן דניאלי" crumbs={[HOME, ABOUT, { label: "קרן דניאלי" }]} />
      <PageSections
        sections={[
          {
            key: "vision",
            label: "חזון ויעדים",
            tone: "glow",
            children: (
              <div className="max-w-[1200px]">
                <Head eyebrow="הקרן" title="חזון ויעדים" />
                <RichScrollText
                  className={`${BODY} mt-8 lg:mt-[calc(var(--u)*40)]`}
                  html={paras(
                    'הקרן הוקמה בשנת תשע"ה (2015) כדי להנציח את זכרה הבלתי נשכח של דניאלי זוננפלד ע"ה.',
                    "מטרות העמותה הינם ליזום וכן לתמוך ולסייע לפרויקטים נבחרים. כר הפעולה של העמותה כולל את תחומי החינוך, הרפואה וסיוע לפרט, עם נתינת דגש על אוכלוסיות מוחלשות.",
                    "הקרן נותנת תשומת לב ממוקדת לעזרה לנזקקים, לעזרה במצוקה יומיומית או מזדמנת, וכן מקרים של עזרה ב'הכנסת כלה' של זוגות ממשפחות חסרות אמצעים.",
                    "במוקד העשיה עומד גם עולם 'רפואה עם לב', ראית החולה והתמיכה בו – באמצעות הענקת פרס דניאלי לצוותי רפואה יוצאים מגדר הרגיל, ובעידוד רפואה מתחשבת ואנושית לחולה ולסביבתו.",
                    "כמו כן מקדישה העמותה תשומת לב להדגשת עולם הנתינה והאמפתיה במערך החינוך האקדמי, זאת על ידי הענקת מלגות לתלמידים ולסטודנטים המשלבים את לימודיהם עם תרומה לקהילה.",
                    '<strong>דרכה של דניאלי ע"ה הייתה להעניק תמיד חום ואהבה לכל אחד, דרך זו היא נר לרגלי העמותה ופעילותה.</strong>',
                  )}
                />
              </div>
            ),
          },
          {
            key: "members",
            label: "חברי העמותה",
            tone: "white",
            children: (
              <>
                <Head eyebrow="הצוות" title="חברי העמותה" center />
                <ul className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-6 lg:mt-[calc(var(--u)*50)] lg:grid-cols-4">
                  {MEMBERS.map((m) => (
                    <li
                      key={m}
                      className={`flex flex-col items-center rounded-[25px] bg-white p-6 text-center text-navy transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-2 hover:shadow-[4px_12px_22px_rgba(0,0,0,0.25)] ${CARD}`}
                    >
                      <span aria-hidden className="grid size-28 place-items-center rounded-full bg-brand-yellow text-5xl font-bold">
                        {m.replace(/^(ר'|פרופ'|עו"ד|הרב)\s+/, "").slice(0, 1)}
                      </span>
                      <h3 className="mt-4 text-[22px] font-bold leading-[1.2]">{m}</h3>
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
          {
            key: "honors",
            label: "הוקרה ותעודות",
            tone: "dark",
            edge: "sag",
            children: (
              <>
                <Head eyebrow="עוד" title="הוקרה ותעודות" center />
                <LinkCards
                  items={[
                    { label: "הוקרה לקרן דניאלי", href: "/about/honor" },
                    { label: "תעודות העמותה", href: "/about/certificates" },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function HonorView() {
  return (
    <>
      <PageHero title="הוקרה לקרן דניאלי" crumbs={[HOME, ABOUT, { label: "קרן דניאלי", href: "/about/foundation" }, { label: "הוקרה לקרן דניאלי" }]} />
      <PageSections
        sections={[
          {
            key: "president",
            label: "אות הנשיא",
            tone: "glow",
            children: (
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
                <div>
                  <Eyebrow>אוניברסיטת בר אילן</Eyebrow>
                  <h2 className={H2}>
                    <FoldHeading text="אות הנשיא" />
                  </h2>
                  <RichScrollText
                    className={`${BODY} mt-6 lg:mt-[calc(var(--u)*32)]`}
                    html={paras(
                      'אות נשיא אוניברסיטת "בר אילן" לשנת 2018 הוענק למר מוטי זוננפלד, נשיא "קרן דניאלי". באוניברסיטת "בר אילן" ציינו כי הם גאים להיות שותפים של "קרן דניאלי", שאת חזונה, השואף להאיר עולמם של מי שגורלם לא שפר עליהם, הם מגשימים יחדיו. זוהי זכות גדולה להרבות את רוח האהבה שהרעיפה דניאלי סביבה בכל אשר הלכה.',
                      'טקס הענקת אות הנשיא התקיים ביום ראשון, כ"א באייר תשע"ח, 6 במאי 2018, במסגרת אירועי חבר הנאמנים והוקדשו לציון 70 שנים למדינת ישראל.',
                      'משפחת זוננפלד ו"קרן דניאלי" שותפים לפעולות רבות באוניברסיטה: "קליניקת דניאלי", הקליניקה לגיל הרך, תמיכה בפרוייקט השו"ת, מלגות ללימודי רפואה ועוד.',
                    )}
                  />
                </div>
                <RevealStripes src="/images/pages/honor-president.webp" alt="אות הנשיא – אוניברסיטת בר אילן" className="mx-auto w-full max-w-[560px] lg:max-w-none" />
              </div>
            ),
          },
          {
            key: "hesed",
            label: "אות החסד",
            tone: "white",
            children: (
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-[calc(var(--u)*120)]">
                <div>
                  <Eyebrow>מרכז רפואי הדסה</Eyebrow>
                  <h2 className={H2}>
                    <FoldHeading text="אות החסד" />
                  </h2>
                  <RichScrollText
                    className={`${BODY} mt-6 lg:mt-[calc(var(--u)*32)]`}
                    html={paras(
                      'בועידת הדסה לרפואה וחסד, שהתקיימה במלון רמדה בירושלים, בהשתתפות מאות אנשי רפואה ועסקנים רפואיים, הוענקה תעודת הוקרה ל"קרן דניאלי" על כל פעילותה למען הרפואה והחברה בישראל, על ידי שר הבריאות הרב יעקב ליצמן ומנכ"ל המרכז הרפואי "הדסה" פרופ\' זאב רוטשטיין.',
                    )}
                  />
                </div>
                <RevealStripes src="/images/pages/honor-hadassah.webp" alt="אות החסד – מרכז רפואי הדסה" className="mx-auto w-full max-w-[560px] lg:max-w-none" />
              </div>
            ),
          },
        ]}
      />
    </>
  );
}

export function CertificatesView() {
  const certs = ["cert-1", "cert-2", "cert-3"];
  return (
    <>
      <PageHero title="תעודות העמותה" crumbs={[HOME, ABOUT, { label: "קרן דניאלי", href: "/about/foundation" }, { label: "תעודות העמותה" }]} />
      <PageSections
        sections={[
          {
            key: "certs",
            label: "תעודות העמותה",
            tone: "glow",
            children: (
              <>
                <Head eyebrow="קרן דניאלי" title="תעודות העמותה" center />
                <ul className="mx-auto mt-10 grid max-w-[1400px] items-start gap-8 sm:grid-cols-3 lg:mt-[calc(var(--u)*50)]">
                  {certs.map((c, i) => (
                    <li key={c}>
                      <a href={`/images/pages/${c}.webp`} target="_blank" rel="noopener noreferrer" className={`block overflow-hidden bg-white transition-transform duration-300 hover:-translate-y-1 ${CARD}`}>
                        <img src={`/images/pages/${c}.webp`} alt={`תעודת עמותה ${i + 1}`} loading="lazy" className="block w-full" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

/* ───────────── צור קשר ───────────── */
function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (String(f.get("website") ?? "")) return; // honeypot
    setState("sending");
    const { error } = await supabase.from("contact_messages").insert({
      name: String(f.get("name") ?? "").trim(),
      email: String(f.get("email") ?? "").trim(),
      message: String(f.get("message") ?? "").trim(),
    });
    if (error) return setState("error");
    e.currentTarget.reset();
    setState("sent");
  };
  const field = "w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-lg text-navy outline-none focus:border-navy focus:ring-2 focus:ring-brand-yellow";
  return (
    <form onSubmit={submit} className={`space-y-4 rounded-[25px] bg-white p-6 lg:p-[calc(var(--u)*40)] ${CARD}`}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="block">
        <span className="sr-only">שם מלא</span>
        <input name="name" placeholder="שם מלא" maxLength={200} className={field} />
      </label>
      <label className="block">
        <span className="sr-only">אימייל</span>
        <input name="email" type="email" dir="ltr" required placeholder="אימייל" maxLength={320} className={`${field} text-start`} />
      </label>
      <label className="block">
        <span className="sr-only">הודעה</span>
        <textarea name="message" required rows={5} placeholder="מה הודעתך" maxLength={5000} className={field} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-[50px] cursor-pointer rounded-full bg-brand-yellow px-10 text-xl font-bold text-navy transition-transform hover:scale-[1.03] disabled:opacity-60 lg:h-[calc(var(--u)*50)] lg:text-[calc(var(--u)*20)]"
        >
          {state === "sending" ? "שולח…" : "שלח"}
        </button>
        <p aria-live="polite" className={`text-lg ${state === "error" ? "text-red-700" : "text-navy"}`}>
          {state === "sent" ? "תודה! ההודעה נשלחה, נחזור אליכם בהקדם." : state === "error" ? "משהו השתבש. אפשר לנסות שוב או לפנות בטלפון." : ""}
        </p>
      </div>
    </form>
  );
}

function ContactRow({ href, icon, children, external }: { href: string; icon: ReactNode; children: ReactNode; external?: boolean }) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center gap-4 text-xl text-navy lg:text-[calc(var(--u)*24)]">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy text-white transition-colors duration-300 group-hover:bg-brand-yellow group-hover:text-navy">{icon}</span>
      <span dir="ltr" className="underline-offset-4 group-hover:underline">
        {children}
      </span>
    </a>
  );
}

export function ContactView() {
  return (
    <>
      <PageHero title="צור קשר" crumbs={[HOME, { label: "צור קשר" }]} />
      <PageSections
        sections={[
          {
            key: "contact",
            label: "צור קשר",
            tone: "glow",
            children: (
              <div className="grid items-start gap-12 lg:grid-cols-[3fr_2fr] lg:gap-[calc(var(--u)*100)]">
                <div>
                  <Eyebrow>דברו איתנו</Eyebrow>
                  <h2 className={H2}>
                    <FoldHeading text="נשמח לשמוע מכם" />
                  </h2>
                  <div className="mt-8 lg:mt-[calc(var(--u)*40)]">
                    <ContactForm />
                  </div>
                </div>
                <div>
                  <h3 className="text-[28px] font-bold leading-[1.2] text-navy lg:mt-[calc(var(--u)*110)] lg:text-[calc(var(--u)*32)]">דרכים נוספות להתקשרות איתנו</h3>
                  <div className="mt-6 flex flex-col gap-5 lg:mt-[calc(var(--u)*30)]">
                    <ContactRow href="https://www.facebook.com/TheDanielleFoundation/" external icon={<Facebook className="size-5" />}>
                      קרן דניאלי בפייסבוק
                    </ContactRow>
                    <ContactRow href="tel:0505022213" icon={<Phone className="size-5" />}>
                      050-502-2213
                    </ContactRow>
                    <ContactRow href="mailto:office@kerendanielle.org" icon={<Mail className="size-5" />}>
                      office@kerendanielle.org
                    </ContactRow>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
