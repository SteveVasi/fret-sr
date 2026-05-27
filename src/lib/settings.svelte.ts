import { type Note, STANDARD_TUNING } from './music';

export class Settings {
  showNotes = $state(false);
  showHoverHints = $state(false);
  frets = $state(12);
  tuning = $state<Note[]>([...STANDARD_TUNING]);
  timeLimit = $state(5);
  soundEnabled = $state(true);
  clickMode = $state(false);
}

export const settings = new Settings();
