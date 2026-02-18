export const THEME_OPTIONS = [
  { key: "kanto-green", label: "Kanto Green" },
  { key: "johto-gold", label: "Johto Gold" },
  { key: "hoenn-ocean", label: "Hoenn Ocean" },
  { key: "rocket-night", label: "Rocket Night" },
] as const;

export type ThemeKey = (typeof THEME_OPTIONS)[number]["key"];

const THEME_KEYS = new Set<string>(THEME_OPTIONS.map((theme) => theme.key));

export function normalizeTheme(value: string | null): ThemeKey {
  if (!value) {
    return "kanto-green";
  }
  const normalized = value.trim().toLowerCase();
  return THEME_KEYS.has(normalized) ? (normalized as ThemeKey) : "kanto-green";
}
