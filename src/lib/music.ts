export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type Note = (typeof NOTES)[number];

export const STANDARD_TUNING: Note[] = ['E', 'B', 'G', 'D', 'A', 'E']; // high → low

/**
 * Standard guitar tuning extended downward in fourths past the 6th string.
 * Used to fill in newly-added strings so the user gets the conventional
 * 7-string low B, 8-string low F#, etc., instead of a duplicated last note.
 */
export const EXTENDED_STANDARD: Note[] = [
  'E', 'B', 'G', 'D', 'A', 'E',
  'B', 'F#', 'C#', 'G#', 'D#', 'A#',
];

/**
 * Approximate octave per string index, matching standard guitar pitches
 * (E4, B3, G3, D3, A2, E2 for strings 1–6). Lower strings extrapolate.
 * Only used to give audio playback a sensible register — exact pitch
 * for non-standard tunings may drift.
 */
const STRING_OCTAVE = [4, 3, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0];

/** MIDI number for a note + octave. C-1 = 0, C4 = 60, A4 = 69. */
export function midiOf(note: Note, octave: number): number {
  return (octave + 1) * 12 + NOTES.indexOf(note);
}

/** MIDI for a note played at a given fret on string `stringIdx`. */
export function midiAtFret(stringIdx: number, openNote: Note, fret: number): number {
  const octave = STRING_OCTAVE[stringIdx] ?? STRING_OCTAVE[STRING_OCTAVE.length - 1];
  return midiOf(openNote, octave) + fret;
}

/* ─── Piano helpers ──────────────────────────────────────────────────── */

/** Piano range used by the trainer keyboard: C3 → C6 (3 octaves). */
export const PIANO_LOW_MIDI = 48;
export const PIANO_HIGH_MIDI = 84;

/** Pitch classes that are black keys (1=C#, 3=D#, 6=F#, 8=G#, 10=A#). */
const BLACK_PCS = new Set([1, 3, 6, 8, 10]);

export const isBlackKey = (midi: number) => BLACK_PCS.has(midi % 12);

/** Note name for a MIDI number. */
export const noteForMidi = (midi: number): Note => NOTES[midi % 12];

/** A random note from the chromatic scale, used as the piano-mode target. */
export function pickRandomNote(): Note {
  return NOTES[Math.floor(Math.random() * 12)];
}

/** Every MIDI key in [low, high] that matches `note`. */
export function pianoKeysForNote(
  note: Note,
  low = PIANO_LOW_MIDI,
  high = PIANO_HIGH_MIDI,
): number[] {
  const pc = NOTES.indexOf(note);
  const result: number[] = [];
  for (let m = low; m <= high; m++) {
    if (m % 12 === pc) result.push(m);
  }
  return result;
}

export const TUNING_PRESETS: { name: string; tuning: Note[] }[] = [
  { name: 'Standard (6)', tuning: ['E', 'B', 'G', 'D', 'A', 'E'] },
  { name: 'Drop D (6)', tuning: ['E', 'B', 'G', 'D', 'A', 'D'] },
  { name: 'Half-step down (6)', tuning: ['D#', 'A#', 'F#', 'C#', 'G#', 'D#'] },
  { name: 'DADGAD (6)', tuning: ['D', 'A', 'G', 'D', 'A', 'D'] },
  { name: 'Open G (6)', tuning: ['D', 'B', 'G', 'D', 'G', 'D'] },
  { name: '7-string Standard', tuning: ['E', 'B', 'G', 'D', 'A', 'E', 'B'] },
  { name: 'Bass Standard (4)', tuning: ['G', 'D', 'A', 'E'] },
  { name: '5-string Bass', tuning: ['G', 'D', 'A', 'E', 'B'] },
];

export function noteAt(openNote: Note, fret: number): Note {
  return NOTES[(NOTES.indexOf(openNote) + fret) % 12];
}

/** Pick a random (string, note, fret) target. `fret` is the specific picked position. */
export function pickRandomTarget(
  tuning: Note[],
  frets: number,
): { stringIdx: number; fret: number; note: Note } {
  const stringIdx = Math.floor(Math.random() * tuning.length);
  const fret = 1 + Math.floor(Math.random() * frets);
  return { stringIdx, fret, note: noteAt(tuning[stringIdx], fret) };
}

/** All frets in 1..maxFret where `target` sounds on a string tuned to `openNote`. */
export function fretsForNoteOnString(
  openNote: Note,
  target: Note,
  maxFret: number,
): number[] {
  const semitones = (NOTES.indexOf(target) - NOTES.indexOf(openNote) + 12) % 12;
  const firstFret = semitones === 0 ? 12 : semitones;
  const result: number[] = [];
  for (let f = firstFret; f <= maxFret; f += 12) result.push(f);
  return result;
}
