from fastapi import FastAPI, Query

from app.schemas import SearchResponse
from app.services.pokeapi import PokeAPIService

app = FastAPI(title="Pokemon Team Builder API")
pokeapi_service = PokeAPIService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/pokemon/search", response_model=SearchResponse)
async def search_pokemon(q: str = Query(default="", min_length=0), limit: int = Query(default=10, ge=1, le=20)) -> SearchResponse:
    results = await pokeapi_service.search(q, limit)
    return SearchResponse(query=q, results=results)
