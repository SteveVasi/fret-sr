<script lang="ts">
  import Fretboard from './lib/Fretboard.svelte';
  import Settings from './lib/Settings.svelte';
  import TrainingHUD from './lib/TrainingHUD.svelte';
  import TargetDisplay from './lib/TargetDisplay.svelte';
  import { STANDARD_TUNING, type Note } from './lib/music';
  import { TrainingSession } from './lib/training.svelte';

  let showNotes = $state(false);
  let frets = $state(24);
  let tuning = $state<Note[]>([...STANDARD_TUNING]);
  let settingsOpen = $state(false);

  const session = new TrainingSession(
    () => tuning,
    () => frets,
  );
</script>

<main>
  <header>
    <h1>FretRecall</h1>
    <div class="controls">
      <label>
        <input type="checkbox" bind:checked={showNotes} />
        Show notes
      </label>
      {#if session.status !== 'idle'}
        <button class="stop" onclick={() => session.stop()}>Stop</button>
      {/if}
      <button class="gear" onclick={() => (settingsOpen = true)} aria-label="Open settings">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M19.14 12.94a7.05 7.05 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7 7 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.88 2h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a7 7 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.61.22L2.63 8.48a.5.5 0 0 0 .12.64l2.03 1.58a7.05 7.05 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96a7 7 0 0 0 1.63.94l.36 2.54c.05.25.26.42.5.42h3.84c.24 0 .45-.17.5-.42l.36-2.54a7 7 0 0 0 1.63-.94l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
          />
        </svg>
        Settings
      </button>
    </div>
  </header>

  <Fretboard
    {frets}
    {tuning}
    {showNotes}
    highlightString={session.status !== 'idle' ? (session.target?.stringIdx ?? null) : null}
    reveal={session.reveal}
  />

  <TrainingHUD {session} />

  <TargetDisplay {session} {tuning} onStart={() => session.start()} />

  <Settings
    open={settingsOpen}
    {frets}
    {tuning}
    timeLimit={session.timeLimit}
    onClose={() => (settingsOpen = false)}
    onFretsChange={(n) => (frets = n)}
    onTuningChange={(t) => (tuning = t)}
    onTimeLimitChange={(s) => (session.timeLimit = s)}
  />
</main>

<style>
  main {
    padding: 1.5rem 1rem;
    width: 100%;
    margin: 0 auto;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  h1 {
    margin: 0;
    font-size: 1.6rem;
  }
  .controls {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    font-size: 0.9rem;
  }
  .controls label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .gear {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: #2a2a30;
    color: #ddd;
    border: 1px solid #3a3a42;
    border-radius: 6px;
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: inherit;
  }
  .gear:hover {
    background: #34343c;
    border-color: #4a4a55;
  }
  .stop {
    background: #3a2a2a;
    color: #ffb0b0;
    border: 1px solid #5a3a3a;
    border-radius: 6px;
    padding: 0.4rem 0.9rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .stop:hover {
    background: #4a3434;
    border-color: #7a4848;
  }
</style>
