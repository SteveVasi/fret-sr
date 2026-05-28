import {
  type Note,
  pickRandomTarget,
  fretsForNoteOnString,
  midiAtFret,
  pianoKeysForNote,
} from './music';
import { playMidi } from './audio';
import type { Settings } from './settings.svelte';

export type Target = { note: Note; stringIdx: number; fret: number };
export type Status = 'idle' | 'asking' | 'reveal';
export type Result = 'correct' | 'wrong' | 'timeout';

export type Answer =
  | { mode: 'guitar'; string: number; fret: number; note: Note }
  | { mode: 'piano'; midi: number; note: Note };

export type Feedback =
  | { mode: 'guitar'; kind: 'correct' | 'wrong'; string: number; fret: number }
  | { mode: 'piano'; kind: 'correct' | 'wrong'; midi: number };

export type RevealCell =
  | { mode: 'guitar'; string: number; fret: number }
  | { mode: 'piano'; midi: number };

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
  /** Time it took to answer the most recent question. */
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

  answer(a: Answer) {
    if (this.status !== 'asking' || !this.target) return;
    const correct = this.#isCorrect(a);
    this.feedback =
      a.mode === 'guitar'
        ? { mode: 'guitar', kind: correct ? 'correct' : 'wrong', string: a.string, fret: a.fret }
        : { mode: 'piano', kind: correct ? 'correct' : 'wrong', midi: a.midi };
    this.lastResult = correct ? 'correct' : 'wrong';
    this.lastDuration = this.elapsed;
    this.status = 'reveal';
    cancelAnimationFrame(this.#rafId);
    if (correct && this.#settings.soundEnabled) {
      if (a.mode === 'guitar') {
        const openNote = this.#settings.tuning[a.string];
        playMidi(midiAtFret(a.string, openNote, a.fret));
      } else {
        playMidi(a.midi);
      }
    }
    this.#scheduleNext(correct ? CORRECT_MS : WRONG_MS);
  }

  #isCorrect(a: Answer): boolean {
    if (!this.target) return false;
    if (a.mode === 'guitar') {
      return a.string === this.target.stringIdx && a.note === this.target.note;
    }
    // Piano: any key with the right note name. Used for fret-to-piano mode.
    return a.note === this.target.note;
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
    if (this.#settings.mode === 'fret-to-piano') {
      const midis = pianoKeysForNote(this.target.note);
      this.reveal = midis.map((m) => ({ mode: 'piano' as const, midi: m }));
      if (this.#settings.soundEnabled) {
        // Play the actual fretboard pitch so the user hears what they were
        // looking for at its real octave.
        const openNote = this.#settings.tuning[this.target.stringIdx];
        playMidi(midiAtFret(this.target.stringIdx, openNote, this.target.fret));
      }
    } else {
      const openNote = this.#settings.tuning[this.target.stringIdx];
      const frets = fretsForNoteOnString(openNote, this.target.note, this.#settings.frets);
      this.reveal = frets.map((f) => ({
        mode: 'guitar' as const,
        string: this.target!.stringIdx,
        fret: f,
      }));
      if (this.#settings.soundEnabled && frets.length > 0) {
        playMidi(midiAtFret(this.target.stringIdx, openNote, frets[0]));
      }
    }
    this.status = 'reveal';
    this.lastResult = 'timeout';
    this.#scheduleNext(REVEAL_MS);
  }

  #scheduleNext(ms: number) {
    clearTimeout(this.#advanceTimer);
    this.#advanceTimer = setTimeout(() => {
      if (this.status === 'reveal') this.#next();
    }, ms) as unknown as number;
  }
}
