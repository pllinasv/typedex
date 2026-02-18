const AUDIO_KEY = "typedex-audio-volume";

let cachedVolume = 1;

function normalizeVolume(value: number): number {
  if (Number.isNaN(value)) {
    return cachedVolume;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return Number(value.toFixed(2));
}

export function getAudioVolume(): number {
  if (typeof window === "undefined") {
    return cachedVolume;
  }
  const raw = window.localStorage.getItem(AUDIO_KEY);
  if (!raw) {
    return cachedVolume;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    return cachedVolume;
  }
  cachedVolume = normalizeVolume(parsed);
  return cachedVolume;
}

export function setAudioVolume(volume: number): number {
  const normalized = normalizeVolume(volume);
  cachedVolume = normalized;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUDIO_KEY, String(normalized));
  }
  return normalized;
}

export function getAudioPercent(volume: number): number {
  return Math.round(normalizeVolume(volume) * 100);
}
