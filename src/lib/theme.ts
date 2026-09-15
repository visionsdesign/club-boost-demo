// Club pages default to a dark theme, but a club can opt into a white page
// instead. Rather than re-styling every element, this overrides the same CSS
// custom properties the theme is built from — every existing `bg-ink`,
// `text-cream-dim`, `border-[var(--line)]` etc. picks up the swap
// automatically wherever this is applied as inline style.
//
// The "dark" variant is neutral grey rather than Club Boost's own green-black
// brand tokens (those live in globals.css and stay put for the admin/club
// dashboard chrome) — a club's own page shouldn't inherit Club Boost's tint.
const DARK_PAGE_VARS: Record<string, string> = {
  "--ink": "#0a0a0b",
  "--ink-2": "#19191c",
  "--surface": "#1c1c20",
  "--line": "rgba(255, 255, 255, 0.1)",
};

const LIGHT_PAGE_VARS: Record<string, string> = {
  "--ink": "#ffffff",
  "--ink-2": "#f0f0ef",
  "--surface": "#f7f6f4",
  "--cream": "#12130f",
  "--cream-dim": "#5c5f58",
  "--line": "rgba(0, 0, 0, 0.12)",
};

export function pageThemeVars(pageBackground: "dark" | "light"): Record<string, string> {
  return pageBackground === "light" ? LIGHT_PAGE_VARS : DARK_PAGE_VARS;
}
