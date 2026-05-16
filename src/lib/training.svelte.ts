import { type Note, pickRandomTarget, fretsForNoteOnString, midiAtFret } from './music';
import { playMidi } from './audio';

export type Target = { stringIdx: number; note: Note };
export type Status = 'idle' | 'asking' | 'reveal';
export type RevealCell = { string: number; fret: number };

const REVEAL_MS = 1500;

export class TrainingSession {
  status = $state<Status>('idle');
  target = $state<Target | null>(null);
  timeLeft = $state(0);
  reveal = $state<RevealCell[] | null>(null);
  timeLimit = $state(5);
  soundEnabled = $state(true);

  #rafId = 0;
  #advanceTimer = 0;
  #questionStart = 0;
  #getTuning: () => Note[];
  #getFrets: () => number;

  constructor(getTuning: () => Note[], getFrets: () => number) {
    this.#getTuning = getTuning;
    this.#getFrets = getFrets;
  }

  start() {
    this.#next();
  }

  stop() {
    this.status = 'idle';
    this.target = null;
    this.reveal = null;
    cancelAnimationFrame(this.#rafId);
    clearTimeout(this.#advanceTimer);
  }

  #next() {
    this.target = pickRandomTarget(this.#getTuning(), this.#getFrets());
    this.status = 'asking';
    this.reveal = null;
    this.#questionStart = performance.now();
    this.timeLeft = this.timeLimit;
    this.#rafId = requestAnimationFrame(this.#tick);
  }

  #tick = () => {
    if (this.status !== 'asking') return;
    const elapsed = (performance.now() - this.#questionStart) / 1000;
    this.timeLeft = Math.max(0, this.timeLimit - elapsed);
    if (this.timeLeft <= 0) {
      this.#showReveal();
      return;
    }
    this.#rafId = requestAnimationFrame(this.#tick);
  };

  #showReveal() {
    if (!this.target) return;
    const openNote = this.#getTuning()[this.target.stringIdx];
    const frets = fretsForNoteOnString(openNote, this.target.note, this.#getFrets());
    this.reveal = frets.map((f) => ({ string: this.target!.stringIdx, fret: f }));
    this.status = 'reveal';
    if (this.soundEnabled && frets.length > 0) {
      playMidi(midiAtFret(this.target.stringIdx, openNote, frets[0]));
    }
    clearTimeout(this.#advanceTimer);
    this.#advanceTimer = setTimeout(() => {
      if (this.status === 'reveal') this.#next();
    }, REVEAL_MS) as unknown as number;
  }
}
