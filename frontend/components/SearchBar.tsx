import { useEffect, useMemo, useState } from "react";
import { searchPokemon } from "@/lib/api";
import TypeBadgeIcon from "@/components/TypeBadgeIcon";
import { formatPokemonName } from "@/lib/format";
import { PokemonBasic } from "@/lib/types";

type SearchBarProps = {
  canAdd: boolean;
  onSelect: (pokemon: PokemonBasic) => void;
};

export default function SearchBar({ canAdd, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonBasic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchPokemon(query.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const showResults = useMemo(() => query.trim().length >= 2, [query]);

  const handleSelect = (pokemon: PokemonBasic) => {
    if (!canAdd) {
      return;
    }
    onSelect(pokemon);
    setQuery("");
    setResults([]);
  };

  return (
    <section className="relative mb-6">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Pokemon"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-blue-500 transition focus:ring-2"
      />
      {showResults ? (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {isLoading ? <p className="px-4 py-3 text-sm text-slate-600">Loading...</p> : null}
          {!isLoading && results.length === 0 ? <p className="px-4 py-3 text-sm text-slate-600">No results</p> : null}
          {!isLoading
            ? results.map((pokemon) => (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() => handleSelect(pokemon)}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 disabled:cursor-not-allowed"
                  disabled={!canAdd}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {pokemon.sprite ? (
                      <img src={pokemon.sprite} alt={pokemon.name} width={40} height={40} loading="lazy" className="h-10 w-10 shrink-0" />
                    ) : (
                      <span className="h-10 w-10 shrink-0 rounded-md bg-slate-100" />
                    )}
                    <span className="min-w-0 text-sm font-medium text-slate-900">{formatPokemonName(pokemon.name)}</span>
                  </span>
                  <span className="flex shrink-0 flex-wrap justify-end gap-1">
                    {pokemon.types.map((type) => (
                      <TypeBadgeIcon key={`${pokemon.id}-${type}`} type={type} compact />
                    ))}
                  </span>
                </button>
              ))
            : null}
        </div>
      ) : null}
    </section>
  );
}
