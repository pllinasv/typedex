import Image from "next/image";
import TypeBadgeIcon from "@/components/TypeBadgeIcon";
import { formatPokemonName } from "@/lib/format";
import { PokemonBasic } from "@/lib/types";

type TeamSlotsProps = {
  team: Array<PokemonBasic | null>;
  onRemove: (index: number) => void;
};

export default function TeamSlots({ team, onRemove }: TeamSlotsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((pokemon, index) => (
        <article
          key={index}
          className="flex min-h-36 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-4">
            {pokemon?.sprite ? (
              <Image src={pokemon.sprite} alt={pokemon.name} width={72} height={72} className="h-[72px] w-[72px]" />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-slate-400">
                {index + 1}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-slate-900">{pokemon ? formatPokemonName(pokemon.name) : "Empty slot"}</p>
            </div>
          </div>
          <div className="flex min-h-7 items-end justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {pokemon?.types?.map((type) => (
                <TypeBadgeIcon key={type} type={type} />
              ))}
            </div>
            <button
              type="button"
              disabled={!pokemon}
              onClick={() => onRemove(index)}
              className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
