export type PokemonBasic = {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
};

export type TypeCoverageRow = {
  attacking_type: string;
  weak: number;
  resist: number;
  immune: number;
  neutral: number;
};

export type AnalyzeResponse = {
  team: PokemonBasic[];
  coverage: TypeCoverageRow[];
};
