import Image from "next/image";
import TypeBadgeIcon from "@/components/TypeBadgeIcon";
import { formatPokemonName } from "@/lib/format";
import { SuggestionRow } from "@/lib/types";

type TeamSuggestionsProps = {
  focusStat: string;
  suggestions: SuggestionRow[];
};

const formatStatLabel = (value: string) => value.replace("_", " ").replace("_", " ");

export default function TeamSuggestions({ focusStat, suggestions }: TeamSuggestionsProps) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Suggested Adds</h2>
      <p className="mt-1 text-sm text-slate-600">
        Team weakest stat: <span className="font-semibold text-slate-800">{formatStatLabel(focusStat)}</span>
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((item) => (
          <article key={item.pokemon.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
            {item.pokemon.sprite ? (
              <Image src={item.pokemon.sprite} alt={item.pokemon.name} width={56} height={56} className="h-14 w-14" />
            ) : (
              <div className="h-14 w-14 rounded-md bg-slate-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{formatPokemonName(item.pokemon.name)}</p>
              <p className="text-xs text-slate-600">
                {formatStatLabel(item.highlight_stat)}: {item.highlight_value} | Total: {item.total}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.pokemon.types.map((type) => (
                  <TypeBadgeIcon key={`${item.pokemon.id}-${type}`} type={type} compact />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
