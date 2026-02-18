export function playCatchEmAllSound(): void {
  if (typeof window === "undefined") {
    return;
  }
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    return;
  }
  const ctx = new AudioCtx();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.08, now);
  master.connect(ctx.destination);

  const notes: Array<{ hz: number; start: number; duration: number }> = [
    { hz: 392.0, start: 0.0, duration: 0.08 },
    { hz: 523.25, start: 0.09, duration: 0.08 },
    { hz: 659.25, start: 0.18, duration: 0.11 },
  ];

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(note.hz, now + note.start);
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(0.3, now + note.start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + note.start);
    osc.stop(now + note.start + note.duration + 0.02);
  }

  window.setTimeout(() => {
    void ctx.close();
  }, 600);
}
