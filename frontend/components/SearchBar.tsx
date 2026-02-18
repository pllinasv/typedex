import { useEffect, useMemo, useState } from "react";
import { searchPokemon } from "@/lib/api";
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
                  className="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 disabled:cursor-not-allowed"
                  disabled={!canAdd}
                >
                  <span className="min-w-0 truncate text-sm font-medium capitalize text-slate-900">{pokemon.name}</span>
                  <span className="shrink-0 text-xs uppercase text-slate-500">{pokemon.types.join(" / ")}</span>
                </button>
              ))
            : null}
        </div>
      ) : null}
    </section>
  );
}
