import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PointerEvent, ReactNode } from "react";

export type FxVariant = "yellow" | "outline" | "outline-light" | "white" | "ghost";

/** Moves the hover circle's origin to the pointer so it grows from where the mouse entered. */
export function trackPointer(e: PointerEvent<HTMLElement>) {
  if (e.pointerType === "touch") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

type Common = { variant?: FxVariant; className?: string; children: ReactNode };

/** Pill button / link with the circle-grows-from-the-pointer hover. */
export function FxButton(props: Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href">): ReactNode;
export function FxButton(props: Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">): ReactNode;
export function FxButton({ variant = "yellow", className = "", children, ...rest }: Common & Record<string, unknown>) {
  const cls = `fx-btn fx-${variant} ${className}`.trim();
  const label = <span className="fx-label">{children}</span>;
  if (typeof rest["href"] === "string") {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={cls} onPointerEnter={trackPointer} onPointerMove={trackPointer}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={cls} onPointerEnter={trackPointer} onPointerMove={trackPointer}>
      {label}
    </button>
  );
}

/** Round icon-only button (icon stays in its own colour; the circle grows underneath). */
export function FxIconButton({
  variant = "yellow",
  className = "",
  children,
  ...rest
}: Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">) {
  return (
    <button
      type="button"
      {...rest}
      className={`fx-btn fx-${variant} items-center justify-center ${className}`.trim()}
      onPointerEnter={trackPointer}
      onPointerMove={trackPointer}
    >
      {children}
    </button>
  );
}
