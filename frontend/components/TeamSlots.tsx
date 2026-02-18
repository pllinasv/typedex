"use client";

import Image from "next/image";
import { useState } from "react";
import TypeBadgeIcon from "@/components/TypeBadgeIcon";
import { formatPokemonName } from "@/lib/format";
import { PokemonBasic } from "@/lib/types";

type TeamSlotsProps = {
  team: Array<PokemonBasic | null>;
  onRemove: (index: number) => void;
};

export default function TeamSlots({ team, onRemove }: TeamSlotsProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonBasic | null>(null);

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((pokemon, index) => (
          <article
            key={index}
            className="retro-panel flex min-h-36 flex-col gap-3 p-4"
          >
            <div className="flex items-start gap-4">
              {pokemon?.sprite ? (
                <Image src={pokemon.sprite} alt={pokemon.name} width={72} height={72} className="h-[72px] w-[72px]" />
              ) : (
                <div className="retro-card-strong flex h-[72px] w-[72px] items-center justify-center text-2xl">
                  {index + 1}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="retro-text text-2xl">{pokemon ? formatPokemonName(pokemon.name) : "Empty slot"}</p>
              </div>
            </div>
            <div className="flex min-h-7 items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {pokemon?.types?.map((type) => (
                  <TypeBadgeIcon key={type} type={type} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pokemon}
                  onClick={() => setSelectedPokemon(pokemon)}
                  className="retro-button shrink-0 px-2 py-1 text-base disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Details
                </button>
                <button
                  type="button"
                  disabled={!pokemon}
                  onClick={() => onRemove(index)}
                  className="retro-button shrink-0 px-2 py-1 text-base disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {selectedPokemon ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPokemon(null)}>
          <div className="retro-panel w-full max-w-md p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="retro-title text-sm">{formatPokemonName(selectedPokemon.name)}</h3>
              <button type="button" onClick={() => setSelectedPokemon(null)} className="retro-button px-2 py-1 text-base">
                Close
              </button>
            </div>
            <div className="mb-3 flex justify-center">
              {selectedPokemon.sprite ? (
                <Image src={selectedPokemon.sprite} alt={selectedPokemon.name} width={208} height={208} className="h-52 w-52" />
              ) : (
                <div className="retro-card-strong h-52 w-52 border-4" />
              )}
            </div>
            <div className="mb-3 flex flex-wrap justify-center gap-2">
              {selectedPokemon.types.map((type) => (
                <TypeBadgeIcon key={`${selectedPokemon.id}-${type}`} type={type} />
              ))}
            </div>
            {selectedPokemon.stats ? (
              <div className="grid grid-cols-3 gap-1.5">
                <div className="retro-card px-1 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">HP</p>
                  <p className="retro-text text-lg leading-none">{selectedPokemon.stats.hp}</p>
                </div>
                <div className="retro-card px-1 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">ATK</p>
                  <p className="retro-text text-lg leading-none">{selectedPokemon.stats.attack}</p>
                </div>
                <div className="retro-card px-1 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">DEF</p>
                  <p className="retro-text text-lg leading-none">{selectedPokemon.stats.defense}</p>
                </div>
                <div className="retro-card px-1 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">SPA</p>
                  <p className="retro-text text-lg leading-none">{selectedPokemon.stats.special_attack}</p>
                </div>
                <div className="retro-card px-1 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">SPD</p>
                  <p className="retro-text text-lg leading-none">{selectedPokemon.stats.special_defense}</p>
                </div>
                <div className="retro-card px-1 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">SPE</p>
                  <p className="retro-text text-lg leading-none">{selectedPokemon.stats.speed}</p>
                </div>
                <div className="retro-card-strong col-span-3 px-2 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">BST</p>
                  <p className="retro-text text-xl leading-none">{selectedPokemon.stats.total}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
