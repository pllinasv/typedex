"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AnalysisTable from "@/components/AnalysisTable";
import SearchBar from "@/components/SearchBar";
import TeamSlots from "@/components/TeamSlots";
import TeamStatsSummary from "@/components/TeamStatsSummary";
import TeamSuggestions from "@/components/TeamSuggestions";
import { analyzeTeam, searchPokemon, suggestTeam } from "@/lib/api";
import { PokemonBasic, SuggestionRow, TeamAverages, TypeCoverageRow } from "@/lib/types";
import { playCatchEmAllSound } from "@/lib/easterEgg";
import { getPresetRegions, normalizeRegionPreset, normalizeRegions, REGION_OPTIONS, REGION_PRESETS, RegionKey } from "@/lib/regions";
import { normalizeTheme, THEME_OPTIONS, ThemeKey } from "@/lib/themes";

const ATTACKING_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy"
];

const EMPTY_TEAM: Array<PokemonBasic | null> = Array(6).fill(null);
const EMPTY_COVERAGE: TypeCoverageRow[] = ATTACKING_TYPES.map((attacking_type) => ({
  attacking_type,
  weak: 0,
  resist: 0,
  immune: 0,
  neutral: 0
}));
const EMPTY_AVERAGES: TeamAverages = {
  hp: 0,
  attack: 0,
  defense: 0,
  special_attack: 0,
  special_defense: 0,
  speed: 0
};

const toTeamQuery = (team: Array<PokemonBasic | null>) => team.map((pokemon) => pokemon?.name ?? "").join(",");

const fromTeamQuery = (raw: string) => raw.split(",").slice(0, 6).map((value) => value.trim().toLowerCase());
const fromRegionsQuery = (raw: string) => normalizeRegions(raw.split(","));

export default function Home() {
  const [team, setTeam] = useState<Array<PokemonBasic | null>>(EMPTY_TEAM);
  const [coverage, setCoverage] = useState<TypeCoverageRow[]>(EMPTY_COVERAGE);
  const [focusStat, setFocusStat] = useState("attack");
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [teamSize, setTeamSize] = useState(0);
  const [teamAverages, setTeamAverages] = useState<TeamAverages>(EMPTY_AVERAGES);
  const [regions, setRegions] = useState<RegionKey[]>([]);
  const [regionPreset, setRegionPreset] = useState("custom");
  const [theme, setTheme] = useState<ThemeKey>("kanto-green");
  const [showCatchToast, setShowCatchToast] = useState(false);
  const [isHydratedFromQuery, setIsHydratedFromQuery] = useState(false);
  const statsRequestId = useRef(0);
  const catchToastTimeoutRef = useRef<number | null>(null);
  const selectedCount = useMemo(() => team.filter(Boolean).length, [team]);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const teamParam = params.get("team");
      const regionsParam = params.get("regions");
      const themeParam = params.get("theme");
      const presetParam = normalizeRegionPreset(params.get("preset"));
      const storedTheme = typeof window !== "undefined" ? window.localStorage.getItem("typedex-theme") : null;
      const nextTheme = normalizeTheme(themeParam ?? storedTheme);
      setTheme(nextTheme);
      setRegionPreset(presetParam);
      const selectedRegions = presetParam !== "custom" ? getPresetRegions(presetParam) : (regionsParam ? fromRegionsQuery(regionsParam) : []);
      setRegions(selectedRegions);
      if (!teamParam) {
        setIsHydratedFromQuery(true);
        return;
      }
      const names = fromTeamQuery(teamParam);
      const slots: Array<PokemonBasic | null> = Array(6).fill(null);
      for (let i = 0; i < names.length; i += 1) {
        const name = names[i];
        if (!name) {
          continue;
        }
        try {
          const results = await searchPokemon(name, selectedRegions);
          const exact = results.find((pokemon) => pokemon.name === name);
          if (exact) {
            slots[i] = exact;
          }
        } catch {
          slots[i] = null;
        }
      }
      setTeam(slots);
      setIsHydratedFromQuery(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (!isHydratedFromQuery) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("team", toTeamQuery(team));
    params.set("preset", regionPreset);
    params.set("theme", theme);
    if (regions.length > 0) {
      params.set("regions", regions.join(","));
    } else {
      params.delete("regions");
    }
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }, [isHydratedFromQuery, team, regions, regionPreset, theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("typedex-theme", theme);
  }, [theme]);

  useEffect(() => {
    const names = team.filter((item): item is PokemonBasic => item !== null).map((item) => item.name);
    const requestId = statsRequestId.current + 1;
    statsRequestId.current = requestId;
    const runAnalyze = async () => {
      if (names.length === 0) {
        if (statsRequestId.current === requestId) {
          setCoverage(EMPTY_COVERAGE);
        }
        return;
      }
      try {
        const data = await analyzeTeam(names);
        if (statsRequestId.current === requestId) {
          setCoverage(data.coverage);
        }
      } catch {
        if (statsRequestId.current === requestId) {
          setCoverage(EMPTY_COVERAGE);
        }
      }
    };
    const runSuggestions = async () => {
      if (names.length === 0) {
        if (statsRequestId.current === requestId) {
          setFocusStat("attack");
          setTeamSize(0);
          setTeamAverages(EMPTY_AVERAGES);
          setSuggestions([]);
        }
        return;
      }
      try {
        const data = await suggestTeam(names, regions);
        if (statsRequestId.current === requestId) {
          setFocusStat(data.focus_stat);
          setTeamSize(data.team_size);
          setTeamAverages(data.team_averages);
          setSuggestions(data.suggestions);
        }
      } catch {
        if (statsRequestId.current === requestId) {
          setFocusStat("attack");
          setTeamSize(0);
          setTeamAverages(EMPTY_AVERAGES);
          setSuggestions([]);
        }
      }
    };
    runAnalyze();
    runSuggestions();
  }, [team, regions]);

  const handleToggleRegion = (region: RegionKey) => {
    setRegionPreset("custom");
    setRegions((current) => (current.includes(region) ? current.filter((value) => value !== region) : [...current, region]));
  };

  const handlePresetChange = (value: string) => {
    const presetId = normalizeRegionPreset(value);
    setRegionPreset(presetId);
    if (presetId === "custom") {
      return;
    }
    setRegions(getPresetRegions(presetId));
  };

  const handleAdd = (pokemon: PokemonBasic) => {
    setTeam((current) => {
      const slot = current.findIndex((item) => item === null);
      if (slot === -1) {
        return current;
      }
      const next = [...current];
      next[slot] = pokemon;
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setTeam((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
    }
  };

  const handlePokemonTitleClick = () => {
    playCatchEmAllSound();
    setShowCatchToast(true);
    if (catchToastTimeoutRef.current !== null) {
      window.clearTimeout(catchToastTimeoutRef.current);
    }
    catchToastTimeoutRef.current = window.setTimeout(() => setShowCatchToast(false), 2400);
  };

  const handleClearTeam = () => {
    setTeam(EMPTY_TEAM);
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 sm:p-6">
      <div className="retro-shell">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="retro-title text-xl sm:text-2xl">Pokemon Team Builder</h1>
            <button
              type="button"
              onClick={handlePokemonTitleClick}
              className="retro-pokeball-btn"
              aria-label="Pokeball easter egg"
            >
              <img src="/pokeball-8bit.svg" alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <p className="retro-subtext mt-2 text-xl">{selectedCount}/6 selected</p>
        </div>
        <div className="w-full sm:w-72">
          <label className="retro-subtext block text-base" htmlFor="theme-select">
            Theme
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(event) => setTheme(normalizeTheme(event.target.value))}
            className="retro-input mt-1 w-full px-3 py-2 text-base"
          >
            {THEME_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={handleClearTeam}
            className="retro-button w-full px-4 py-2 text-lg sm:w-auto"
          >
            Clear Team
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="retro-button w-full px-4 py-2 text-lg sm:w-auto"
          >
            Share
          </button>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <section className="retro-panel mb-4 p-4">
            <h2 className="retro-title text-base">Regions</h2>
            <p className="retro-subtext mt-2 text-lg">Choose a game preset or build your own multi-region rules.</p>
            <label className="retro-subtext mt-3 block text-base" htmlFor="region-preset">
              Game preset
            </label>
            <select
              id="region-preset"
              value={regionPreset}
              onChange={(event) => handlePresetChange(event.target.value)}
              className="retro-input mt-1 w-full px-3 py-2 text-base"
            >
              {REGION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-2">
              {REGION_OPTIONS.map((region) => {
                const isActive = regions.includes(region.key);
                return (
                  <button
                    key={region.key}
                    type="button"
                    onClick={() => handleToggleRegion(region.key)}
                    className={
                      isActive
                        ? "retro-button retro-button-pressed px-3 py-1 text-base"
                        : "retro-button px-3 py-1 text-base"
                    }
                  >
                    {region.label}
                  </button>
                );
              })}
            </div>
          </section>
          <SearchBar canAdd={selectedCount < 6} regions={regions} onSelect={handleAdd} />
          <TeamStatsSummary focusStat={focusStat} teamSize={teamSize} averages={teamAverages} />
          <TeamSlots team={team} onRemove={handleRemove} />
          <TeamSuggestions focusStat={focusStat} suggestions={suggestions} canAdd={selectedCount < 6} onAdd={handleAdd} />
        </section>
        <AnalysisTable rows={coverage} />
      </div>
      {showCatchToast ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="retro-toast">
            <p className="retro-toast-text text-base sm:text-lg">CATCH EM ALL!</p>
          </div>
        </div>
      ) : null}
      </div>
    </main>
  );
}
