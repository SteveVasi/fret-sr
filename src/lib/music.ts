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

/** Pick a random (string, note) target reachable on frets 1..frets. */
export function pickRandomTarget(
  tuning: Note[],
  frets: number,
): { stringIdx: number; note: Note } {
  const stringIdx = Math.floor(Math.random() * tuning.length);
  const fret = 1 + Math.floor(Math.random() * frets);
  return { stringIdx, note: noteAt(tuning[stringIdx], fret) };
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
