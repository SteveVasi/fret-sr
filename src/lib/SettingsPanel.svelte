<script lang="ts">
  import { NOTES, type Note, TUNING_PRESETS, EXTENDED_STANDARD } from './music';
  import { settings } from './settings.svelte';
  import Button from './Button.svelte';

  type Props = {
    open: boolean;
    onClose: () => void;
  };

  let { open, onClose }: Props = $props();

  const MIN_STRINGS = 1;
  const MAX_STRINGS = 12;
  const MIN_FRETS = 5;
  const MAX_FRETS = 24;
  const MIN_TIME = 2;
  const MAX_TIME = 15;

  function setStringCount(count: number) {
    const current = settings.tuning;
    if (count === current.length) return;
    if (count > current.length) {
      const added: Note[] = [];
      for (let i = current.length; i < count; i++) {
        added.push(EXTENDED_STANDARD[i] ?? EXTENDED_STANDARD[EXTENDED_STANDARD.length - 1]);
      }
      settings.tuning = [...current, ...added];
    } else {
      settings.tuning = current.slice(0, count);
    }
  }

  function setStringNote(stringIdx: number, note: Note) {
    const next = [...settings.tuning];
    next[stringIdx] = note;
    settings.tuning = next;
  }

  function applyPreset(preset: Note[]) {
    settings.tuning = [...preset];
  }
</script>

{#if open}
  <div
    class="backdrop"
    role="button"
    tabindex="-1"
    aria-label="Close settings"
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
  ></div>

  <div class="panel" role="dialog" aria-modal="true" aria-label="Fretboard settings">
    <header>
      <h2>Settings</h2>
      <Button variant="ghost" size="sm" onclick={onClose} ariaLabel="Close">×</Button>
    </header>

    <section>
      <h3>Training mode</h3>
      <div class="mode-switch">
        <button
          class="mode"
          class:active={settings.mode === 'guitar'}
          onclick={() => (settings.mode = 'guitar')}
        >Guitar</button>
        <button
          class="mode"
          class:active={settings.mode === 'fret-to-piano'}
          onclick={() => (settings.mode = 'fret-to-piano')}
        >Fret → Piano</button>
      </div>
      <p class="hint-text">
        {#if settings.mode === 'fret-to-piano'}
          A position lights up on the fretboard. Find the matching note on the piano.
        {:else}
          A note + string is shown. Find it on the fretboard.
        {/if}
      </p>
    </section>

    {#if settings.mode === 'guitar'}
      <section>
        <div class="row">
          <span>Frets</span>
          <span class="value">{settings.frets}</span>
        </div>
        <input
          type="range"
          aria-label="Frets"
          min={MIN_FRETS}
          max={MAX_FRETS}
          value={settings.frets}
          oninput={(e) => (settings.frets = +e.currentTarget.value)}
        />
      </section>
    {/if}

    {#if settings.mode === 'guitar'}
      <section>
        <div class="row">
          <span>Strings</span>
          <span class="value">{settings.tuning.length}</span>
        </div>
        <input
          type="range"
          aria-label="String count"
          min={MIN_STRINGS}
          max={MAX_STRINGS}
          value={settings.tuning.length}
          oninput={(e) => setStringCount(+e.currentTarget.value)}
        />
      </section>

      <section>
        <h3>Tuning <span class="hint">high → low</span></h3>
        <div class="tuning-grid">
          {#each settings.tuning as note, i}
            <label class="string-row">
              <span class="string-idx">{i + 1}</span>
              <select
                value={note}
                onchange={(e) => setStringNote(i, e.currentTarget.value as Note)}
              >
                {#each NOTES as n}
                  <option value={n}>{n}</option>
                {/each}
              </select>
            </label>
          {/each}
        </div>
      </section>
    {/if}

    <section>
      <div class="row">
        <span>Time limit</span>
        <span class="value">{settings.timeLimit}s</span>
      </div>
      <input
        type="range"
        aria-label="Time limit per question (seconds)"
        min={MIN_TIME}
        max={MAX_TIME}
        value={settings.timeLimit}
        oninput={(e) => (settings.timeLimit = +e.currentTarget.value)}
      />
    </section>

    <section>
      <label class="toggle">
        <input
          type="checkbox"
          checked={settings.clickMode}
          onchange={(e) => (settings.clickMode = e.currentTarget.checked)}
        />
        <span>Click on fretboard to answer</span>
      </label>
      <p class="hint-text">
        When off, just play the note on your real guitar and wait for the reveal.
      </p>
    </section>

    <section>
      <label class="toggle">
        <input
          type="checkbox"
          checked={settings.showHoverHints}
          onchange={(e) => (settings.showHoverHints = e.currentTarget.checked)}
        />
        <span>Reveal note on hover</span>
      </label>
    </section>

    <section>
      <label class="toggle">
        <input
          type="checkbox"
          checked={settings.soundEnabled}
          onchange={(e) => (settings.soundEnabled = e.currentTarget.checked)}
        />
        <span>Play sound on reveal</span>
      </label>
    </section>

    {#if settings.mode === 'guitar'}
      <section>
        <h3>Presets</h3>
        <div class="presets">
          {#each TUNING_PRESETS as preset}
            <Button variant="secondary" size="sm" onclick={() => applyPreset(preset.tuning)}>
              <span class="preset-name">{preset.name}</span>
            </Button>
          {/each}
        </div>
      </section>
    {/if}
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 10;
    border: none;
    cursor: default;
  }
  .panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(360px, 90vw);
    background: #1d1d22;
    color: #eee;
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.4);
    z-index: 11;
    padding: 1.25rem 1.5rem;
    overflow-y: auto;
    font-family: system-ui, sans-serif;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #aaa;
  }
  .hint {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    color: #777;
    font-size: 0.8rem;
  }
  section {
    margin-bottom: 1.5rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
  }
  .value {
    color: #7ec0ff;
    font-variant-numeric: tabular-nums;
  }
  input[type='range'] {
    width: 100%;
  }
  .tuning-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem 0.75rem;
  }
  .string-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .string-idx {
    width: 1.25rem;
    text-align: right;
    color: #888;
    font-size: 0.85rem;
  }
  select {
    flex: 1;
    background: #2a2a30;
    color: #eee;
    border: 1px solid #3a3a42;
    border-radius: 4px;
    padding: 0.3rem 0.4rem;
    font-size: 0.9rem;
  }
  .presets {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .presets :global(.btn) {
    justify-content: flex-start;
  }
  .preset-name {
    text-align: left;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.95rem;
    cursor: pointer;
  }
  .hint-text {
    margin: 0.4rem 0 0 0;
    font-size: 0.8rem;
    color: #888;
    line-height: 1.3;
  }
  .mode-switch {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .mode {
    background: #2a2a30;
    color: #aaa;
    border: 1px solid #3a3a42;
    border-radius: 8px;
    padding: 0.55rem 0;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .mode:hover {
    background: #34343c;
    color: #ddd;
  }
  .mode.active {
    background: #7ec0ff;
    border-color: #7ec0ff;
    color: #0a1828;
  }
</style>
