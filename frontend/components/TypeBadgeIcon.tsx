type TypeBadgeIconProps = {
  type: string;
  showLabel?: boolean;
  compact?: boolean;
  fixedWidth?: boolean;
};

const TYPE_ICON_BASE_URL = "https://play.pokemonshowdown.com/sprites/types";

const formatTypeName = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function TypeBadgeIcon({ type, showLabel = false, compact = false, fixedWidth = false }: TypeBadgeIconProps) {
  const label = formatTypeName(type);
  const containerClass = compact
    ? "retro-chip px-1 py-0.5"
    : "retro-chip gap-1 px-1.5 py-1";
  const widthClass = fixedWidth ? "w-[108px] justify-between" : "";
  return (
    <span className={`${containerClass} ${widthClass}`.trim()}>
      <img
        src={`${TYPE_ICON_BASE_URL}/${label}.png`}
        alt={label}
        width={compact ? 32 : 40}
        height={compact ? 12 : 14}
        loading="lazy"
        className={compact ? "h-3 w-8" : "h-3.5 w-10"}
      />
      {showLabel ? <span className="retro-text text-base">{label}</span> : null}
    </span>
  );
}
