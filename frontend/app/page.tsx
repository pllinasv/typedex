"use client";

import { useEffect, useMemo, useState } from "react";
import AnalysisTable from "@/components/AnalysisTable";
import SearchBar from "@/components/SearchBar";
import TeamSlots from "@/components/TeamSlots";
import TeamStatsSummary from "@/components/TeamStatsSummary";
import TeamSuggestions from "@/components/TeamSuggestions";
import { analyzeTeam, searchPokemon, suggestTeam } from "@/lib/api";
import { PokemonBasic, SuggestionRow, TeamAverages, TypeCoverageRow } from "@/lib/types";
import { getPresetRegions, normalizeRegionPreset, normalizeRegions, REGION_OPTIONS, REGION_PRESETS, RegionKey } from "@/lib/regions";

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
  const [isHydratedFromQuery, setIsHydratedFromQuery] = useState(false);
  const selectedCount = useMemo(() => team.filter(Boolean).length, [team]);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const teamParam = params.get("team");
      const regionsParam = params.get("regions");
      const presetParam = normalizeRegionPreset(params.get("preset"));
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
    if (regions.length > 0) {
      params.set("regions", regions.join(","));
    } else {
      params.delete("regions");
    }
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }, [isHydratedFromQuery, team, regions, regionPreset]);

  useEffect(() => {
    const names = team.filter((item): item is PokemonBasic => item !== null).map((item) => item.name);
    const runAnalyze = async () => {
      if (names.length === 0) {
        setCoverage(EMPTY_COVERAGE);
        return;
      }
      try {
        const data = await analyzeTeam(names);
        setCoverage(data.coverage);
      } catch {
        setCoverage(EMPTY_COVERAGE);
      }
    };
    const runSuggestions = async () => {
      if (names.length === 0) {
        setFocusStat("attack");
        setTeamSize(0);
        setTeamAverages(EMPTY_AVERAGES);
        setSuggestions([]);
        return;
      }
      try {
        const data = await suggestTeam(names, regions);
        setFocusStat(data.focus_stat);
        setTeamSize(data.team_size);
        setTeamAverages(data.team_averages);
        setSuggestions(data.suggestions);
      } catch {
        setFocusStat("attack");
        setTeamSize(0);
        setTeamAverages(EMPTY_AVERAGES);
        setSuggestions([]);
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

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 sm:p-6">
      <div className="retro-shell">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="retro-title text-xl sm:text-2xl">Pokemon Team Builder</h1>
          <p className="retro-subtext mt-2 text-xl">{selectedCount}/6 selected</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="retro-button w-full px-4 py-2 text-lg sm:w-auto"
        >
          Share
        </button>
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
                        ? "retro-button translate-y-[1px] bg-[#7ea83e] shadow-[2px_2px_0_#223212] px-3 py-1 text-base"
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
      </div>
    </main>
  );
}
