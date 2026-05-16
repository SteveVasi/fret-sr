import { type Note, STANDARD_TUNING } from './music';

export class Settings {
  showNotes = $state(false);
  frets = $state(12);
  tuning = $state<Note[]>([...STANDARD_TUNING]);
  timeLimit = $state(5);
  soundEnabled = $state(true);
}

export const settings = new Settings();
