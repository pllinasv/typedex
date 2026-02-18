import { TeamAverages } from "@/lib/types";

type TeamStatsSummaryProps = {
  focusStat: string;
  teamSize: number;
  averages: TeamAverages;
};

const STAT_ITEMS: Array<{ key: keyof TeamAverages; label: string }> = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "ATK" },
  { key: "defense", label: "DEF" },
  { key: "special_attack", label: "SPA" },
  { key: "special_defense", label: "SPD" },
  { key: "speed", label: "SPE" }
];

const formatStatName = (value: string) => value.replace("_", " ").replace("_", " ");

export default function TeamStatsSummary({ focusStat, teamSize, averages }: TeamStatsSummaryProps) {
  return (
    <section className="retro-panel mb-4 p-4">
      <h2 className="retro-title text-base">Team Stat Summary</h2>
      <p className="retro-subtext mt-2 text-xl">
        Weakest: <span className="retro-text">{formatStatName(focusStat).toUpperCase()}</span> | Team size: {teamSize}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_ITEMS.map((item) => {
          const isWeakest = item.key === focusStat;
          return (
            <div
              key={item.key}
              className={isWeakest ? "retro-highlight px-2 py-2 text-center" : "retro-card px-2 py-2 text-center"}
            >
              <p className="retro-subtext text-sm leading-none">{item.label}</p>
              <p className="retro-text mt-1 text-xl leading-none">{Math.round(averages[item.key])}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
