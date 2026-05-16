let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/**
 * Synthesize a short plucked-string-ish tone for a given MIDI note.
 * Triangle carrier + lowpass filter + exponential decay envelope.
 */
export function playMidi(midi: number, duration = 1.4) {
  const ac = getContext();
  const now = ac.currentTime;
  const freq = midiToFreq(midi);

  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(freq * 6, 6000), now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 2, 400), now + duration);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.32, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter).connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + duration);
}
