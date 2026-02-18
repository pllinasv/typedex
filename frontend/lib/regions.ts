export const REGION_OPTIONS = [
  { key: "kanto", label: "Kanto" },
  { key: "johto", label: "Johto" },
  { key: "hoenn", label: "Hoenn" },
  { key: "sinnoh", label: "Sinnoh" },
  { key: "unova", label: "Unova" },
  { key: "kalos", label: "Kalos" },
  { key: "alola", label: "Alola" },
  { key: "galar", label: "Galar" },
  { key: "paldea", label: "Paldea" },
] as const;

export type RegionKey = (typeof REGION_OPTIONS)[number]["key"];
export type RegionPreset = {
  id: string;
  label: string;
  regions: RegionKey[];
};

export const REGION_PRESETS: RegionPreset[] = [
  { id: "custom", label: "Custom Selection", regions: [] },
  { id: "kanto", label: "Kanto Games (RBY/FRLG/LGPE)", regions: ["kanto"] },
  { id: "johto-postgame", label: "Johto + Kanto Postgame (GSC/HGSS)", regions: ["johto", "kanto"] },
  { id: "hoenn", label: "Hoenn Games (RSE/ORAS)", regions: ["hoenn"] },
  { id: "sinnoh", label: "Sinnoh Games (DPPt/BDSP)", regions: ["sinnoh"] },
  { id: "unova", label: "Unova Games (BW/B2W2)", regions: ["unova"] },
  { id: "kalos", label: "Kalos Games (XY)", regions: ["kalos"] },
  { id: "alola", label: "Alola Games (SM/USUM)", regions: ["alola"] },
  { id: "galar", label: "Galar Games (SwSh + DLC)", regions: ["galar"] },
  { id: "paldea", label: "Paldea Games (SV + DLC)", regions: ["paldea"] },
] as const;

const PRESET_IDS = new Set<string>(REGION_PRESETS.map((preset) => preset.id));

const REGION_KEYS = new Set<string>(REGION_OPTIONS.map((region) => region.key));

export function normalizeRegions(values: string[]): RegionKey[] {
  const seen = new Set<string>();
  const normalized: RegionKey[] = [];
  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!REGION_KEYS.has(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    normalized.push(key as RegionKey);
  }
  return normalized;
}

export function normalizeRegionPreset(value: string | null): string {
  if (!value) {
    return "custom";
  }
  const normalized = value.trim().toLowerCase();
  return PRESET_IDS.has(normalized) ? normalized : "custom";
}

export function getPresetRegions(presetId: string): RegionKey[] {
  const preset = REGION_PRESETS.find((item) => item.id === presetId);
  return preset ? [...preset.regions] : [];
}
