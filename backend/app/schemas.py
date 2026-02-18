from pydantic import BaseModel, Field


class PokemonStats(BaseModel):
    hp: int
    attack: int
    defense: int
    special_attack: int
    special_defense: int
    speed: int
    total: int


class PokemonBasic(BaseModel):
    id: int
    name: str
    sprite: str | None = None
    cry: str | None = None
    types: list[str] = Field(default_factory=list)
    stats: PokemonStats | None = None


class SearchResponse(BaseModel):
    query: str
    results: list[PokemonBasic]


class AnalyzeRequest(BaseModel):
    team: list[str] = Field(default_factory=list, max_length=6)
    regions: list[str] = Field(default_factory=list, max_length=9)


class TypeCoverageRow(BaseModel):
    attacking_type: str
    weak: int
    resist: int
    immune: int
    neutral: int


class AnalyzeResponse(BaseModel):
    team: list[PokemonBasic]
    coverage: list[TypeCoverageRow]


class SuggestionRow(BaseModel):
    pokemon: PokemonBasic
    highlight_stat: str
    highlight_value: int
    total: int


class TeamAverages(BaseModel):
    hp: float
    attack: float
    defense: float
    special_attack: float
    special_defense: float
    speed: float


class SuggestionsResponse(BaseModel):
    focus_stat: str
    team_size: int
    team_averages: TeamAverages
    suggestions: list[SuggestionRow]
