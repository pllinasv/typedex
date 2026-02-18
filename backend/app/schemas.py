from pydantic import BaseModel, Field


class PokemonBasic(BaseModel):
    id: int
    name: str
    sprite: str | None = None
    types: list[str] = Field(default_factory=list)


class SearchResponse(BaseModel):
    query: str
    results: list[PokemonBasic]


class AnalyzeRequest(BaseModel):
    team: list[str] = Field(default_factory=list, max_length=6)


class TypeCoverageRow(BaseModel):
    attacking_type: str
    weak: int
    resist: int
    immune: int
    neutral: int


class AnalyzeResponse(BaseModel):
    team: list[PokemonBasic]
    coverage: list[TypeCoverageRow]
