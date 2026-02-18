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
          className="retro-panel flex min-h-36 flex-col gap-3 p-4"
        >
          <div className="flex items-start gap-4">
            {pokemon?.sprite ? (
              <Image src={pokemon.sprite} alt={pokemon.name} width={72} height={72} className="h-[72px] w-[72px]" />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center border-4 border-[#2a3817] bg-[#dceea9] text-2xl text-[#2a3817]">
                {index + 1}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="retro-text text-2xl">{pokemon ? formatPokemonName(pokemon.name) : "Empty slot"}</p>
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
              className="retro-button shrink-0 px-2 py-1 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
