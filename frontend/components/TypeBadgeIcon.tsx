type TypeBadgeIconProps = {
  type: string;
  showLabel?: boolean;
  compact?: boolean;
};

const TYPE_ICON_BASE_URL = "https://play.pokemonshowdown.com/sprites/types";

const formatTypeName = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function TypeBadgeIcon({ type, showLabel = false, compact = false }: TypeBadgeIconProps) {
  const label = formatTypeName(type);
  return (
    <span className={compact ? "inline-flex items-center" : "inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-1"}>
      <img
        src={`${TYPE_ICON_BASE_URL}/${label}.png`}
        alt={label}
        width={compact ? 32 : 40}
        height={compact ? 12 : 14}
        loading="lazy"
        className={compact ? "h-3 w-8" : "h-3.5 w-10"}
      />
      {showLabel ? <span className="text-xs font-medium text-slate-700">{label}</span> : null}
    </span>
  );
}
