"use client";

import { useEffect, useMemo, useState } from "react";
import AnalysisTable from "@/components/AnalysisTable";
import SearchBar from "@/components/SearchBar";
import TeamSlots from "@/components/TeamSlots";
import { analyzeTeam } from "@/lib/api";
import { PokemonBasic, TypeCoverageRow } from "@/lib/types";

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

const EMPTY_COVERAGE: TypeCoverageRow[] = ATTACKING_TYPES.map((attacking_type) => ({
  attacking_type,
  weak: 0,
  resist: 0,
  immune: 0,
  neutral: 0
}));

export default function Home() {
  const [team, setTeam] = useState<Array<PokemonBasic | null>>(Array(6).fill(null));
  const [coverage, setCoverage] = useState<TypeCoverageRow[]>(EMPTY_COVERAGE);
  const selectedCount = useMemo(() => team.filter(Boolean).length, [team]);

  useEffect(() => {
    const names = team.filter((item): item is PokemonBasic => item !== null).map((item) => item.name);
    const run = async () => {
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
    run();
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

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Pokemon Team Builder</h1>
        <p className="mt-1 text-sm text-slate-600">{selectedCount}/6 selected</p>
      </header>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <SearchBar canAdd={selectedCount < 6} onSelect={handleAdd} />
          <TeamSlots team={team} onRemove={handleRemove} />
        </section>
        <AnalysisTable rows={coverage} />
      </div>
    </main>
  );
}
