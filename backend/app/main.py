from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import AnalyzeRequest, AnalyzeResponse, SearchResponse, SuggestionsResponse, TypeCoverageRow
from app.services.pokeapi import PokeAPIService
from app.services.typechart import ATTACKING_TYPES, multiplier

app = FastAPI(title="Pokemon Team Builder API")
pokeapi_service = PokeAPIService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/pokemon/search", response_model=SearchResponse)
async def search_pokemon(q: str = Query(default="", min_length=0), limit: int = Query(default=10, ge=1, le=20)) -> SearchResponse:
    results = await pokeapi_service.search(q, limit)
    return SearchResponse(query=q, results=results)


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_team(payload: AnalyzeRequest) -> AnalyzeResponse:
    team = await pokeapi_service.get_team(payload.team)
    coverage: list[TypeCoverageRow] = []
    for attacking_type in ATTACKING_TYPES:
        weak = 0
        resist = 0
        immune = 0
        neutral = 0
        for pokemon in team:
            value = multiplier(attacking_type, pokemon.types)
            if value == 0:
                immune += 1
            elif value > 1:
                weak += 1
            elif value < 1:
                resist += 1
            else:
                neutral += 1
        coverage.append(
            TypeCoverageRow(
                attacking_type=attacking_type,
                weak=weak,
                resist=resist,
                immune=immune,
                neutral=neutral,
            )
        )
    return AnalyzeResponse(team=team, coverage=coverage)


@app.post("/suggestions", response_model=SuggestionsResponse)
async def suggest_team(payload: AnalyzeRequest, limit: int = Query(default=6, ge=1, le=12)) -> SuggestionsResponse:
    return await pokeapi_service.suggest(payload.team, limit)
