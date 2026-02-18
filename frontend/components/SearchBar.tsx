import { useEffect, useMemo, useState } from "react";
import { searchPokemon } from "@/lib/api";
import TypeBadgeIcon from "@/components/TypeBadgeIcon";
import { formatPokemonName } from "@/lib/format";
import { PokemonBasic } from "@/lib/types";
import { RegionKey } from "@/lib/regions";

type SearchBarProps = {
  canAdd: boolean;
  regions: RegionKey[];
  onSelect: (pokemon: PokemonBasic) => void;
};

export default function SearchBar({ canAdd, regions, onSelect }: SearchBarProps) {
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
        const data = await searchPokemon(query.trim(), regions);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [query, regions]);

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
        className="retro-input w-full px-4 py-3 text-xl"
      />
      {showResults ? (
        <div className="retro-panel absolute z-20 mt-2 max-h-72 w-full overflow-y-auto">
          {isLoading ? <p className="retro-subtext px-4 py-3 text-lg">Loading...</p> : null}
          {!isLoading && results.length === 0 ? <p className="retro-subtext px-4 py-3 text-lg">No results</p> : null}
          {!isLoading
            ? results.map((pokemon) => (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() => handleSelect(pokemon)}
                  className="retro-search-item flex w-full items-center justify-between gap-3 px-4 py-3 text-left last:border-b-0 disabled:cursor-not-allowed"
                  disabled={!canAdd}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {pokemon.sprite ? (
                      <img src={pokemon.sprite} alt={pokemon.name} width={40} height={40} loading="lazy" className="h-10 w-10 shrink-0" />
                    ) : (
                      <span className="retro-card-strong h-10 w-10 shrink-0 rounded-sm" />
                    )}
                    <span className="retro-text min-w-0 text-lg">{formatPokemonName(pokemon.name)}</span>
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
