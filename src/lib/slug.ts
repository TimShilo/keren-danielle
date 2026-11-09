/** Builds a URL-safe slug from a Hebrew or English name (the client never sees or types it). */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/["'׳״]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
