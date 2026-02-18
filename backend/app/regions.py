REGION_ORDER = [
    "kanto",
    "johto",
    "hoenn",
    "sinnoh",
    "unova",
    "kalos",
    "alola",
    "galar",
    "paldea",
]

REGION_ID_RANGES: dict[str, tuple[int, int]] = {
    "kanto": (1, 151),
    "johto": (152, 251),
    "hoenn": (252, 386),
    "sinnoh": (387, 493),
    "unova": (494, 649),
    "kalos": (650, 721),
    "alola": (722, 809),
    "galar": (810, 905),
    "paldea": (906, 1025),
}


def normalize_regions(raw_regions: list[str] | None) -> list[str]:
    if not raw_regions:
        return []
    allowed = set(REGION_ORDER)
    normalized: list[str] = []
    for raw in raw_regions:
        value = raw.strip().lower()
        if value in allowed and value not in normalized:
            normalized.append(value)
    return normalized


def pokemon_region_from_id(pokemon_id: int) -> str | None:
    for region in REGION_ORDER:
        start, end = REGION_ID_RANGES[region]
        if start <= pokemon_id <= end:
            return region
    return None


def is_in_regions(pokemon_id: int, regions: list[str]) -> bool:
    if not regions:
        return True
    region = pokemon_region_from_id(pokemon_id)
    return region in set(regions)
