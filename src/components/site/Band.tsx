import type { ElementType, ReactNode } from "react";
import { curveTopStyle, EDGE_PAD, OVERLAP, type Edge } from "./section-edges";

/**
 * Plain full-width band for the areas that are not light-blue/yellow:
 *  - "white": stays white
 *  - "dark":  the navy gradient used for "חדשות ועדכונים"
 * `curveTop` opens the band with the soft arch (no straight cut against the previous area).
 */
export function Band({
  tone,
  curveTop = false,
  edge = "arch",
  as: Tag = "section",
  className = "",
  children,
  ...rest
}: {
  tone: "white" | "dark";
  curveTop?: boolean;
  edge?: Edge;
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const bg = tone === "dark" ? "bg-[linear-gradient(to_bottom,#082944_26%,#0c448a_95%)] text-white [--card-ink:#fff] [--muted-ink:rgba(255,255,255,0.85)]" : "bg-white";
  return (
    <Tag
      className={`relative isolate overflow-hidden ${bg} ${curveTop ? OVERLAP : ""} ${className}`}
      style={curveTop ? curveTopStyle(edge) : undefined}
      {...rest}
    >
      {curveTop && <div aria-hidden className={EDGE_PAD} />}
      {children}
    </Tag>
  );
}
