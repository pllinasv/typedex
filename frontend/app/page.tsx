"use client";

import { useEffect, useMemo, useState } from "react";
import AnalysisTable from "@/components/AnalysisTable";
import SearchBar from "@/components/SearchBar";
import TeamSlots from "@/components/TeamSlots";
import TeamSuggestions from "@/components/TeamSuggestions";
import { analyzeTeam, searchPokemon, suggestTeam } from "@/lib/api";
import { PokemonBasic, SuggestionRow, TypeCoverageRow } from "@/lib/types";

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

const toTeamQuery = (team: Array<PokemonBasic | null>) => team.map((pokemon) => pokemon?.name ?? "").join(",");

const fromTeamQuery = (raw: string) => raw.split(",").slice(0, 6).map((value) => value.trim().toLowerCase());

export default function Home() {
  const [team, setTeam] = useState<Array<PokemonBasic | null>>(EMPTY_TEAM);
  const [coverage, setCoverage] = useState<TypeCoverageRow[]>(EMPTY_COVERAGE);
  const [focusStat, setFocusStat] = useState("attack");
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [isHydratedFromQuery, setIsHydratedFromQuery] = useState(false);
  const selectedCount = useMemo(() => team.filter(Boolean).length, [team]);

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams(window.location.search);
      const teamParam = params.get("team");
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
          const results = await searchPokemon(name);
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
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", nextUrl);
  }, [isHydratedFromQuery, team]);

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
        setSuggestions([]);
        return;
      }
      try {
        const data = await suggestTeam(names);
        setFocusStat(data.focus_stat);
        setSuggestions(data.suggestions);
      } catch {
        setFocusStat("attack");
        setSuggestions([]);
      }
    };
    runAnalyze();
    runSuggestions();
  }, [team]);

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
    <main className="mx-auto min-h-screen max-w-7xl p-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pokemon Team Builder</h1>
          <p className="mt-1 text-sm text-slate-600">{selectedCount}/6 selected</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
        >
          Share
        </button>
      </header>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <SearchBar canAdd={selectedCount < 6} onSelect={handleAdd} />
          <TeamSlots team={team} onRemove={handleRemove} />
          <TeamSuggestions focusStat={focusStat} suggestions={suggestions} />
        </section>
        <AnalysisTable rows={coverage} />
      </div>
    </main>
  );
}
