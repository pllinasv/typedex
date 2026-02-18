"use client";

import { useMemo, useState } from "react";
import TeamSlots from "@/components/TeamSlots";
import { PokemonBasic } from "@/lib/types";

export default function Home() {
  const [team, setTeam] = useState<Array<PokemonBasic | null>>(Array(6).fill(null));
  const selectedCount = useMemo(() => team.filter(Boolean).length, [team]);

  const handleRemove = (index: number) => {
    setTeam((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Pokemon Team Builder</h1>
        <p className="mt-1 text-sm text-slate-600">{selectedCount}/6 selected</p>
      </header>
      <TeamSlots team={team} onRemove={handleRemove} />
    </main>
  );
}
