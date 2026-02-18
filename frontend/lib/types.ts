export type PokemonStats = {
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
  total: number;
};

export type PokemonBasic = {
  id: number;
  name: string;
  sprite: string | null;
  cry?: string | null;
  types: string[];
  stats?: PokemonStats | null;
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

export type SuggestionRow = {
  pokemon: PokemonBasic;
  highlight_stat: string;
  highlight_value: number;
  total: number;
};

export type TeamAverages = {
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
};

export type SuggestionsResponse = {
  focus_stat: string;
  team_size: number;
  team_averages: TeamAverages;
  suggestions: SuggestionRow[];
};
