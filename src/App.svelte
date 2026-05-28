<script lang="ts">
  import Fretboard from './lib/Fretboard.svelte';
  import Piano from './lib/Piano.svelte';
  import SettingsPanel from './lib/SettingsPanel.svelte';
  import TrainingHUD from './lib/TrainingHUD.svelte';
  import TargetDisplay from './lib/TargetDisplay.svelte';
  import Button from './lib/Button.svelte';
  import { settings } from './lib/settings.svelte';
  import { TrainingSession } from './lib/training.svelte';
  import { GEAR_ICON } from './lib/icons';
  import type { Note } from './lib/music';

  let settingsOpen = $state(false);
  const session = new TrainingSession(settings);

  // Slice the union-typed session state into per-instrument variants so each
  // child component only sees what's relevant to it.
  const guitarFeedback = $derived(
    session.feedback?.mode === 'guitar' ? session.feedback : null,
  );
  const pianoFeedback = $derived(
    session.feedback?.mode === 'piano' ? session.feedback : null,
  );
  const guitarReveal = $derived(
    session.reveal?.filter((r) => r.mode === 'guitar') ?? null,
  );
  const pianoReveal = $derived(
    session.reveal?.filter((r) => r.mode === 'piano') ?? null,
  );

  const isCrossMode = $derived(settings.mode === 'fret-to-piano');
  const acceptingAnswer = $derived(
    settings.clickMode && session.status === 'asking',
  );

  // In guitar mode the fretboard is the input. In fret-to-piano the piano is.
  const onFretSelect = $derived(
    !isCrossMode && acceptingAnswer
      ? (s: number, f: number, n: Note) =>
          session.answer({ mode: 'guitar', string: s, fret: f, note: n })
      : undefined,
  );
  const onPianoSelect = $derived(
    isCrossMode && acceptingAnswer
      ? (midi: number, note: Note) =>
          session.answer({ mode: 'piano', midi, note })
      : undefined,
  );

  // Marker on the fretboard for cross-instrument mode.
  const fretMark = $derived(
    isCrossMode && session.target
      ? { string: session.target.stringIdx, fret: session.target.fret }
      : null,
  );
</script>

<main>
  <header>
    <h1>FretRecall</h1>
    <div class="controls">
      <label>
        <input type="checkbox" bind:checked={settings.showNotes} />
        {isCrossMode ? 'Fretboard notes' : 'Show notes'}
      </label>
      {#if isCrossMode}
        <label>
          <input type="checkbox" bind:checked={settings.showPianoNotes} />
          Piano notes
        </label>
      {/if}
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
    highlightString={!isCrossMode && session.status !== 'idle'
      ? (session.target?.stringIdx ?? null)
      : null}
    reveal={guitarReveal}
    feedback={guitarFeedback}
    mark={fretMark}
    showMarkLabel={session.status === 'reveal'}
    onSelect={onFretSelect}
  />

  {#if isCrossMode}
    <Piano
      showNotes={settings.showPianoNotes}
      hoverHints={settings.showHoverHints}
      reveal={pianoReveal}
      feedback={pianoFeedback}
      onSelect={onPianoSelect}
    />
  {/if}

  <TrainingHUD {session} />

  <TargetDisplay {session} onStart={() => session.start()} />

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
