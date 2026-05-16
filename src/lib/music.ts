export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type Note = (typeof NOTES)[number];

export const STANDARD_TUNING: Note[] = ['E', 'B', 'G', 'D', 'A', 'E']; // high → low

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
