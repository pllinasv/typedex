from pydantic import BaseModel, Field


class PokemonBasic(BaseModel):
    id: int
    name: str
    sprite: str | None = None
    types: list[str] = Field(default_factory=list)


class SearchResponse(BaseModel):
    query: str
    results: list[PokemonBasic]
