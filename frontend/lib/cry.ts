import { getAudioVolume } from "@/lib/audioSettings";

export function resolvePokemonCryUrl(pokemonId: number | undefined, cry: string | null | undefined): string | null {
  if (cry) {
    return cry;
  }
  if (!pokemonId) {
    return null;
  }
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
}

export function playPokemonCry(url: string | null | undefined): (() => void) | undefined {
  if (!url) {
    return undefined;
  }
  const volume = getAudioVolume();
  if (volume <= 0) {
    return undefined;
  }
  const audio = new Audio(url);
  audio.volume = 0.7 * volume;
  void audio.play().catch(() => {
  });
  return () => {
    audio.pause();
    audio.currentTime = 0;
  };
}
