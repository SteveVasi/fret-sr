<script lang="ts">
  import Fretboard from './lib/Fretboard.svelte';
  import SettingsPanel from './lib/SettingsPanel.svelte';
  import TrainingHUD from './lib/TrainingHUD.svelte';
  import TargetDisplay from './lib/TargetDisplay.svelte';
  import Button from './lib/Button.svelte';
  import { settings } from './lib/settings.svelte';
  import { TrainingSession } from './lib/training.svelte';
  import { GEAR_ICON } from './lib/icons';

  let settingsOpen = $state(false);
  const session = new TrainingSession(settings);

  const onFretboardSelect = $derived(
    settings.clickMode && session.status === 'asking'
      ? (s: number, f: number, n: Parameters<typeof session.answer>[2]) =>
          session.answer(s, f, n)
      : undefined,
  );
</script>

<main>
  <header>
    <h1>FretRecall</h1>
    <div class="controls">
      <label>
        <input type="checkbox" bind:checked={settings.showNotes} />
        Show notes
      </label>
      {#if session.status !== 'idle'}
        <Button variant="danger" size="sm" onclick={() => session.stop()}>Stop</Button>
      {/if}
      <Button variant="secondary" size="sm" onclick={() => (settingsOpen = true)} ariaLabel="Open settings">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d={GEAR_ICON} />
        </svg>
        Settings
      </Button>
    </div>
  </header>

  <Fretboard
    frets={settings.frets}
    tuning={settings.tuning}
    showNotes={settings.showNotes}
    hoverHints={settings.showHoverHints}
    highlightString={session.status !== 'idle' ? (session.target?.stringIdx ?? null) : null}
    reveal={session.reveal}
    feedback={session.feedback}
    onSelect={onFretboardSelect}
  />

  <TrainingHUD {session} />

  <TargetDisplay {session} tuning={settings.tuning} onStart={() => session.start()} />

  <SettingsPanel open={settingsOpen} onClose={() => (settingsOpen = false)} />
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
    gap: 0.75rem;
    align-items: center;
    font-size: 0.9rem;
  }
  .controls label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
