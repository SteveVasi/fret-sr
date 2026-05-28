import { type Note, STANDARD_TUNING } from './music';

export type Mode = 'guitar' | 'fret-to-piano';

export class Settings {
  mode = $state<Mode>('guitar');
  showNotes = $state(false);
  showPianoNotes = $state(false);
  showHoverHints = $state(false);
  frets = $state(12);
  tuning = $state<Note[]>([...STANDARD_TUNING]);
  timeLimit = $state(5);
  soundEnabled = $state(true);
  clickMode = $state(true);
}

export const settings = new Settings();
