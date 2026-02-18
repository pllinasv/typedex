import asyncio

import httpx

from app.schemas import PokemonBasic, PokemonStats, SuggestionRow, SuggestionsResponse, TeamAverages


class PokeAPIService:
    def __init__(self) -> None:
        self.base_url = "https://pokeapi.co/api/v2"
        self._names: list[str] | None = None
        self._details: dict[str, PokemonBasic] = {}
        self._name_lock = asyncio.Lock()
        self._detail_lock = asyncio.Lock()
        self._suggestion_pool = [
            "venusaur",
            "charizard",
            "blastoise",
            "alakazam",
            "machamp",
            "gengar",
            "golem",
            "starmie",
            "snorlax",
            "dragonite",
            "jolteon",
            "vaporeon",
            "flareon",
            "lapras",
            "aerodactyl",
            "tyranitar",
            "scizor",
            "skarmory",
            "blissey",
            "garchomp",
            "lucario",
            "infernape",
            "empoleon",
            "togekiss",
            "rotom-wash",
            "excadrill",
            "volcarona",
            "ferrothorn",
            "hydreigon",
            "conkeldurr",
            "greninja",
            "talonflame",
            "aegislash",
            "goodra",
            "toxapex",
            "mimikyu",
            "corviknight",
            "dragapult",
            "baxcalibur",
            "annihilape",
            "kingambit",
            "garganacl",
            "gholdengo",
            "iron-valiant",
            "great-tusk",
            "meowscarada",
            "skeledirge",
            "quaquaval",
            "ursaluna",
            "ursaluna-bloodmoon",
            "metagross",
            "salamence",
            "milotic",
            "suicune",
            "raikou",
            "entei",
            "zapdos",
            "moltres",
            "articuno",
            "raichu",
            "gyarados",
            "arcanine",
            "ninetales",
            "weavile",
            "mamoswine",
            "gliscor",
            "slowbro",
            "porygon2",
            "porygon-z",
        ]

    async def _get_json(self, url: str) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()

    async def _load_names(self) -> list[str]:
        if self._names is not None:
            return self._names
        async with self._name_lock:
            if self._names is not None:
                return self._names
            data = await self._get_json(f"{self.base_url}/pokemon?limit=2000")
            self._names = [item["name"] for item in data.get("results", [])]
            return self._names

    async def _load_detail(self, name: str) -> PokemonBasic:
        key = name.strip().lower()
        cached = self._details.get(key)
        if cached is not None:
            return cached
        async with self._detail_lock:
            cached = self._details.get(key)
            if cached is not None:
                return cached
            data = await self._get_json(f"{self.base_url}/pokemon/{key}")
            sprite = data.get("sprites", {}).get("front_default")
            types = [t["type"]["name"] for t in sorted(data.get("types", []), key=lambda x: x["slot"])]
            parsed_stats = {entry["stat"]["name"]: entry["base_stat"] for entry in data.get("stats", [])}
            stats = PokemonStats(
                hp=parsed_stats.get("hp", 0),
                attack=parsed_stats.get("attack", 0),
                defense=parsed_stats.get("defense", 0),
                special_attack=parsed_stats.get("special-attack", 0),
                special_defense=parsed_stats.get("special-defense", 0),
                speed=parsed_stats.get("speed", 0),
                total=(
                    parsed_stats.get("hp", 0)
                    + parsed_stats.get("attack", 0)
                    + parsed_stats.get("defense", 0)
                    + parsed_stats.get("special-attack", 0)
                    + parsed_stats.get("special-defense", 0)
                    + parsed_stats.get("speed", 0)
                ),
            )
            parsed = PokemonBasic(id=data["id"], name=data["name"], sprite=sprite, types=types, stats=stats)
            self._details[key] = parsed
            return parsed

    async def search(self, query: str, limit: int = 10) -> list[PokemonBasic]:
        clean_query = query.strip().lower()
        if not clean_query:
            return []
        names = await self._load_names()
        matched = [name for name in names if clean_query in name][: max(1, min(limit, 20))]
        if not matched:
            return []
        return await asyncio.gather(*(self._load_detail(name) for name in matched))

    async def get_team(self, names: list[str]) -> list[PokemonBasic]:
        team: list[PokemonBasic] = []
        for raw_name in names[:6]:
            name = raw_name.strip().lower()
            if not name:
                continue
            try:
                pokemon = await self._load_detail(name)
                team.append(pokemon)
            except httpx.HTTPError:
                continue
        return team

    async def suggest(self, names: list[str], limit: int = 6) -> SuggestionsResponse:
        team = await self.get_team(names)
        team_size = len(team)
        if team_size == 0:
            return SuggestionsResponse(
                focus_stat="attack",
                team_size=0,
                team_averages=TeamAverages(
                    hp=0,
                    attack=0,
                    defense=0,
                    special_attack=0,
                    special_defense=0,
                    speed=0,
                ),
                suggestions=[],
            )

        averages = TeamAverages(
            hp=sum((pokemon.stats.hp if pokemon.stats else 0) for pokemon in team) / team_size,
            attack=sum((pokemon.stats.attack if pokemon.stats else 0) for pokemon in team) / team_size,
            defense=sum((pokemon.stats.defense if pokemon.stats else 0) for pokemon in team) / team_size,
            special_attack=sum((pokemon.stats.special_attack if pokemon.stats else 0) for pokemon in team) / team_size,
            special_defense=sum((pokemon.stats.special_defense if pokemon.stats else 0) for pokemon in team) / team_size,
            speed=sum((pokemon.stats.speed if pokemon.stats else 0) for pokemon in team) / team_size,
        )

        focus_stat = min(
            {
                "hp": averages.hp,
                "attack": averages.attack,
                "defense": averages.defense,
                "special_attack": averages.special_attack,
                "special_defense": averages.special_defense,
                "speed": averages.speed,
            },
            key=lambda key: {
                "hp": averages.hp,
                "attack": averages.attack,
                "defense": averages.defense,
                "special_attack": averages.special_attack,
                "special_defense": averages.special_defense,
                "speed": averages.speed,
            }[key],
        )

        team_names = {pokemon.name for pokemon in team}
        candidates: list[PokemonBasic] = []
        for candidate_name in self._suggestion_pool:
            if candidate_name in team_names:
                continue
            try:
                candidate = await self._load_detail(candidate_name)
                if candidate.name in team_names:
                    continue
                candidates.append(candidate)
            except httpx.HTTPError:
                continue

        ranked: list[SuggestionRow] = []
        for candidate in candidates:
            if not candidate.stats:
                continue
            value = {
                "hp": candidate.stats.hp,
                "attack": candidate.stats.attack,
                "defense": candidate.stats.defense,
                "special_attack": candidate.stats.special_attack,
                "special_defense": candidate.stats.special_defense,
                "speed": candidate.stats.speed,
            }[focus_stat]
            ranked.append(
                SuggestionRow(
                    pokemon=candidate,
                    highlight_stat=focus_stat,
                    highlight_value=value,
                    total=candidate.stats.total,
                )
            )

        ranked.sort(key=lambda row: (row.highlight_value, row.total), reverse=True)

        return SuggestionsResponse(
            focus_stat=focus_stat,
            team_size=team_size,
            team_averages=averages,
            suggestions=ranked[: max(1, min(limit, 12))],
        )
