import type { ReactNode } from "react";
import { Band } from "./Band";
import { GlowSection } from "./GlowSection";

export type Tone = "glow" | "white" | "dark";
export const TONES: Tone[] = ["glow", "white", "dark"];

export interface SectionDef {
  key: string;
  /** background of this section; leave empty to take the next one in the default cycle */
  tone?: Tone | undefined;
  label?: string;
  /** "sag": the dark photo wall whose top edge sags in the middle; it may also be the last section */
  edge?: "sag" | undefined;
  className?: string;
  children: ReactNode;
}

const CYCLE: Tone[] = ["glow", "white", "dark"];
const PAD = "px-[5%] pb-[100px] pt-[calc(var(--u)*30)]";

/**
 * Stacks the body sections of an inner page under the page header.
 *
 * Rules (so the areas never clash):
 *  - the first section is the light-blue/yellow one, and always opens with the soft curve of the header;
 *  - the dark navy section is the only one with rounded edges: it opens with a curve and the section
 *    after it opens with a curve too (a curve is cut into the neighbour on both sides);
 *  - two neighbouring sections never share a background (a clash becomes the next tone in the cycle);
 *  - the last section is never dark (the sentences area under it opens straight).
 */
export function PageSections({ sections }: { sections: SectionDef[] }) {
  const tones: Tone[] = [];
  sections.forEach((s, i) => {
    let t: Tone = i === 0 ? "glow" : (s.tone ?? CYCLE[(i + 0) % CYCLE.length] ?? "white");
    if (i === 0 && s.tone === "white") t = "white"; // an explicit choice still wins
    const prev = tones[i - 1];
    if (prev && prev === t) t = (CYCLE[(CYCLE.indexOf(t) + 1) % CYCLE.length] ?? "white") as Tone;
    if (i === sections.length - 1 && t === "dark" && !s.edge) t = prev === "glow" ? "white" : "glow";
    tones.push(t);
  });

  return (
    <>
      {sections.map((s, i) => {
        const tone = tones[i] as Tone;
        const prev = tones[i - 1];
        const curve = i === 0 || tone === "dark" || prev === "dark";
        const common = { key: s.key, "aria-label": s.label ?? s.key, className: `${PAD} ${s.className ?? ""}`.trim() };
        if (tone === "glow") {
          return (
            <GlowSection {...common} curveTop={curve} edge={prev === "dark" ? "mirror" : "arch"}>
              {s.children}
            </GlowSection>
          );
        }
        return (
          <Band {...common} tone={tone} curveTop={curve} edge={s.edge ?? (tone === "dark" ? "sag" : prev === "dark" ? "mirror" : "arch")}>
            {s.children}
          </Band>
        );
      })}
    </>
  );
}
