import { AnalyzeResponse, PokemonBasic, SuggestionsResponse } from "@/lib/types";
import { RegionKey } from "@/lib/regions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type SearchResponse = {
  query: string;
  results: PokemonBasic[];
};

export async function searchPokemon(query: string, regions: RegionKey[] = []): Promise<PokemonBasic[]> {
  const params = new URLSearchParams({ q: query, limit: "10" });
  if (regions.length > 0) {
    params.set("regions", regions.join(","));
  }
  const response = await fetch(`${API_BASE_URL}/pokemon/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Search request failed");
  }
  const data = (await response.json()) as SearchResponse;
  return data.results;
}

export async function analyzeTeam(team: string[]): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ team })
  });
  if (!response.ok) {
    throw new Error("Analyze request failed");
  }
  return (await response.json()) as AnalyzeResponse;
}

export async function suggestTeam(team: string[], regions: RegionKey[] = []): Promise<SuggestionsResponse> {
  const params = new URLSearchParams({ limit: "6" });
  const response = await fetch(`${API_BASE_URL}/suggestions?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ team, regions })
  });
  if (!response.ok) {
    throw new Error("Suggestions request failed");
  }
  return (await response.json()) as SuggestionsResponse;
}
