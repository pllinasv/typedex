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
  return (
    <section className="retro-panel mt-6 p-4">
      <h2 className="retro-title text-base">Suggested Adds</h2>
      <p className="retro-subtext mt-2 text-xl">
        Team weakest stat: <span className="retro-text">{formatStatLabel(focusStat)}</span>
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((item) => (
          <article key={item.pokemon.id} className="flex items-center gap-3 border-4 border-[#2a3817] bg-[#f1f9d7] px-3 py-2">
            {item.pokemon.sprite ? (
              <Image src={item.pokemon.sprite} alt={item.pokemon.name} width={56} height={56} className="h-14 w-14" />
            ) : (
              <div className="h-14 w-14 border-2 border-[#2a3817] bg-[#dceea9]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="retro-text truncate text-xl">{formatPokemonName(item.pokemon.name)}</p>
              <p className="retro-subtext text-base">
                {formatStatLabel(item.highlight_stat)}: {item.highlight_value} | Total: {item.total}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.pokemon.types.map((type) => (
                  <TypeBadgeIcon key={`${item.pokemon.id}-${type}`} type={type} compact />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAdd(item.pokemon)}
              disabled={!canAdd}
              className="retro-button shrink-0 px-2 py-1 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
