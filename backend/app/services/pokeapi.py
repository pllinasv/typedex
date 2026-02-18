import asyncio

import httpx

from app.schemas import PokemonBasic


class PokeAPIService:
    def __init__(self) -> None:
        self.base_url = "https://pokeapi.co/api/v2"
        self._names: list[str] | None = None
        self._details: dict[str, PokemonBasic] = {}
        self._name_lock = asyncio.Lock()
        self._detail_lock = asyncio.Lock()

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
        cached = self._details.get(name)
        if cached is not None:
            return cached
        async with self._detail_lock:
            cached = self._details.get(name)
            if cached is not None:
                return cached
            data = await self._get_json(f"{self.base_url}/pokemon/{name}")
            sprite = data.get("sprites", {}).get("front_default")
            types = [t["type"]["name"] for t in sorted(data.get("types", []), key=lambda x: x["slot"])]
            parsed = PokemonBasic(id=data["id"], name=data["name"], sprite=sprite, types=types)
            self._details[name] = parsed
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
