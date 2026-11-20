import type { CSSProperties } from "react";

/**
 * Soft arch that opens a section (design: 1920 x 92). Used as a mask on the section itself, so its top
 * edge is a curve cut into the previous section – never a straight line between two areas.
 * The section must overlap the previous one by `--u * 92` (see `OVERLAP` / `EDGE_PAD`).
 */
const CURVE_MASK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 92" preserveAspectRatio="none"><path d="M0 89C0 89 1314.32 9.3 1920 89V92H0Z" fill="#000"/></svg>',
  );

export function curveTopStyle(): CSSProperties {
  return {
    WebkitMaskImage: `url("${CURVE_MASK}"), linear-gradient(#000, #000)`,
    maskImage: `url("${CURVE_MASK}"), linear-gradient(#000, #000)`,
    WebkitMaskSize: "100% calc(var(--u) * 92), 100% calc(100% - var(--u) * 92 + 2px)",
    maskSize: "100% calc(var(--u) * 92), 100% calc(100% - var(--u) * 92 + 2px)",
    WebkitMaskPosition: "0 0, 0 calc(var(--u) * 92 - 2px)",
    maskPosition: "0 0, 0 calc(var(--u) * 92 - 2px)",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
}

/** Negative margin that tucks a curved section under the previous one. */
export const OVERLAP = "-mt-[calc(var(--u)*92)]";
/** Spacer height inside a curved section (the part that is cut by the curve). */
export const EDGE_PAD = "h-[calc(var(--u)*92)]";
