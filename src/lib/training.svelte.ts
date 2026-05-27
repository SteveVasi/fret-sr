import { type Note, pickRandomTarget, fretsForNoteOnString, midiAtFret } from './music';
import { playMidi } from './audio';
import type { Settings } from './settings.svelte';

export type Target = { stringIdx: number; note: Note };
export type Status = 'idle' | 'asking' | 'reveal';
export type Result = 'correct' | 'wrong' | 'timeout';
export type Feedback = { string: number; fret: number; kind: 'correct' | 'wrong' };
export type RevealCell = { string: number; fret: number };

const REVEAL_MS = 1500;
const CORRECT_MS = 500;
const WRONG_MS = 850;

export class TrainingSession {
  status = $state<Status>('idle');
  target = $state<Target | null>(null);
  /** Seconds since the current question started. */
  elapsed = $state(0);
  reveal = $state<RevealCell[] | null>(null);
  feedback = $state<Feedback | null>(null);
  lastResult = $state<Result | null>(null);
  /** Time it took to answer the most recent question (set on correct/wrong, cleared on next). */
  lastDuration = $state<number | null>(null);

  #rafId = 0;
  #advanceTimer = 0;
  #questionStart = 0;
  #settings: Settings;

  constructor(settings: Settings) {
    this.#settings = settings;
  }

  start() {
    this.lastResult = null;
    this.#next();
  }

  stop() {
    this.status = 'idle';
    this.target = null;
    this.reveal = null;
    this.feedback = null;
    cancelAnimationFrame(this.#rafId);
    clearTimeout(this.#advanceTimer);
  }

  answer(stringIdx: number, fret: number, note: Note) {
    if (this.status !== 'asking' || !this.target) return;
    const correct = stringIdx === this.target.stringIdx && note === this.target.note;
    this.feedback = { string: stringIdx, fret, kind: correct ? 'correct' : 'wrong' };
    this.lastResult = correct ? 'correct' : 'wrong';
    this.lastDuration = this.elapsed;
    this.status = 'reveal';
    cancelAnimationFrame(this.#rafId);
    if (correct && this.#settings.soundEnabled) {
      const openNote = this.#settings.tuning[stringIdx];
      playMidi(midiAtFret(stringIdx, openNote, fret));
    }
    this.#scheduleNext(correct ? CORRECT_MS : WRONG_MS);
  }

  #next() {
    this.target = pickRandomTarget(this.#settings.tuning, this.#settings.frets);
    this.status = 'asking';
    this.reveal = null;
    this.feedback = null;
    this.lastDuration = null;
    this.#questionStart = performance.now();
    this.elapsed = 0;
    this.#rafId = requestAnimationFrame(this.#tick);
  }

  #tick = () => {
    if (this.status !== 'asking') return;
    this.elapsed = (performance.now() - this.#questionStart) / 1000;
    // Auto-timeout only in hands-free mode. Click mode runs as a stopwatch.
    if (!this.#settings.clickMode && this.elapsed >= this.#settings.timeLimit) {
      this.#showReveal();
      return;
    }
    this.#rafId = requestAnimationFrame(this.#tick);
  };

  #showReveal() {
    if (!this.target) return;
    const openNote = this.#settings.tuning[this.target.stringIdx];
    const frets = fretsForNoteOnString(openNote, this.target.note, this.#settings.frets);
    this.reveal = frets.map((f) => ({ string: this.target!.stringIdx, fret: f }));
    this.status = 'reveal';
    this.lastResult = 'timeout';
    if (this.#settings.soundEnabled && frets.length > 0) {
      playMidi(midiAtFret(this.target.stringIdx, openNote, frets[0]));
    }
    this.#scheduleNext(REVEAL_MS);
  }

  #scheduleNext(ms: number) {
    clearTimeout(this.#advanceTimer);
    this.#advanceTimer = setTimeout(() => {
      if (this.status === 'reveal') this.#next();
    }, ms) as unknown as number;
  }
}
