import { useState } from "react";
import Image from "next/image";
import TypeBadgeIcon from "@/components/TypeBadgeIcon";
import { formatPokemonName } from "@/lib/format";
import { SuggestionRow } from "@/lib/types";

type TeamSuggestionsProps = {
  focusStat: string;
  suggestions: SuggestionRow[];
  canAdd: boolean;
  onAdd: (pokemon: SuggestionRow["pokemon"]) => void;
};

const formatStatLabel = (value: string) => value.replace("_", " ").replace("_", " ");

export default function TeamSuggestions({ focusStat, suggestions, canAdd, onAdd }: TeamSuggestionsProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<SuggestionRow["pokemon"] | null>(null);

  return (
    <section className="retro-panel mt-6 p-4">
      <h2 className="retro-title text-base">Suggested Adds</h2>
      <p className="retro-subtext mt-2 text-xl">
        Team weakest stat: <span className="retro-text">{formatStatLabel(focusStat).toUpperCase()}</span>
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((item) => (
          <article key={item.pokemon.id} className="retro-card flex items-center gap-3 border-4 px-3 py-2">
            {item.pokemon.sprite ? (
              <Image src={item.pokemon.sprite} alt={item.pokemon.name} width={56} height={56} className="h-14 w-14" />
            ) : (
              <div className="retro-card-strong h-14 w-14" />
            )}
            <div className="min-w-0 flex-1">
              <p className="retro-text truncate text-xl">{formatPokemonName(item.pokemon.name)}</p>
              <p className="retro-subtext text-base">
                {formatStatLabel(item.highlight_stat).toUpperCase()}: {item.highlight_value} | Total: {item.total}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.pokemon.types.map((type) => (
                  <TypeBadgeIcon key={`${item.pokemon.id}-${type}`} type={type} compact />
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => setSelectedPokemon(item.pokemon)}
                className="retro-button px-2 py-1 text-base"
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => onAdd(item.pokemon)}
                disabled={!canAdd}
                className="retro-button px-2 py-1 text-base disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </article>
        ))}
      </div>
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
                <div className="retro-highlight col-span-3 px-1 py-1 text-center">
                  <p className="retro-subtext text-sm leading-none">TOTAL</p>
                  <p className="retro-text text-xl leading-none">{selectedPokemon.stats.total}</p>
                </div>
              </div>
            ) : (
              <p className="retro-subtext text-base">Stats unavailable for this Pokemon.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
