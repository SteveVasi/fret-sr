<script lang="ts">
  import { NOTES, type Note, TUNING_PRESETS, EXTENDED_STANDARD } from './music';

  type Props = {
    open: boolean;
    frets: number;
    tuning: Note[];
    timeLimit: number;
    soundEnabled: boolean;
    onClose: () => void;
    onFretsChange: (n: number) => void;
    onTuningChange: (t: Note[]) => void;
    onTimeLimitChange: (s: number) => void;
    onSoundToggle: (enabled: boolean) => void;
  };

  let {
    open,
    frets,
    tuning,
    timeLimit,
    soundEnabled,
    onClose,
    onFretsChange,
    onTuningChange,
    onTimeLimitChange,
    onSoundToggle,
  }: Props = $props();

  const MIN_STRINGS = 1;
  const MAX_STRINGS = 12;
  const MIN_FRETS = 5;
  const MAX_FRETS = 24;
  const MIN_TIME = 2;
  const MAX_TIME = 15;

  function setStringCount(count: number) {
    if (count === tuning.length) return;
    if (count > tuning.length) {
      // Fill new low strings from the extended standard template, so going
      // 6 → 4 → 6 restores E B G D A E (not the current last string repeated).
      const added: Note[] = [];
      for (let i = tuning.length; i < count; i++) {
        added.push(EXTENDED_STANDARD[i] ?? EXTENDED_STANDARD[EXTENDED_STANDARD.length - 1]);
      }
      onTuningChange([...tuning, ...added]);
    } else {
      onTuningChange(tuning.slice(0, count));
    }
  }

  function setStringNote(stringIdx: number, note: Note) {
    const next = [...tuning];
    next[stringIdx] = note;
    onTuningChange(next);
  }

  function applyPreset(preset: Note[]) {
    onTuningChange([...preset]);
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
      <button class="close" onclick={onClose} aria-label="Close">×</button>
    </header>

    <section>
      <div class="row">
        <span>Frets</span>
        <span class="value">{frets}</span>
      </div>
      <input
        type="range"
        aria-label="Frets"
        min={MIN_FRETS}
        max={MAX_FRETS}
        value={frets}
        oninput={(e) => onFretsChange(+e.currentTarget.value)}
      />
    </section>

    <section>
      <div class="row">
        <span>Strings</span>
        <span class="value">{tuning.length}</span>
      </div>
      <input
        type="range"
        aria-label="String count"
        min={MIN_STRINGS}
        max={MAX_STRINGS}
        value={tuning.length}
        oninput={(e) => setStringCount(+e.currentTarget.value)}
      />
    </section>

    <section>
      <h3>Tuning <span class="hint">high → low</span></h3>
      <div class="tuning-grid">
        {#each tuning as note, i}
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

    <section>
      <div class="row">
        <span>Time limit</span>
        <span class="value">{timeLimit}s</span>
      </div>
      <input
        type="range"
        aria-label="Time limit per question (seconds)"
        min={MIN_TIME}
        max={MAX_TIME}
        value={timeLimit}
        oninput={(e) => onTimeLimitChange(+e.currentTarget.value)}
      />
    </section>

    <section>
      <label class="toggle">
        <input
          type="checkbox"
          checked={soundEnabled}
          onchange={(e) => onSoundToggle(e.currentTarget.checked)}
        />
        <span>Play sound on reveal</span>
      </label>
    </section>

    <section>
      <h3>Presets</h3>
      <div class="presets">
        {#each TUNING_PRESETS as preset}
          <button class="preset" onclick={() => applyPreset(preset.tuning)}>
            {preset.name}
          </button>
        {/each}
      </div>
    </section>
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
  .close {
    background: transparent;
    color: #aaa;
    border: none;
    font-size: 1.6rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25rem;
  }
  .close:hover {
    color: #fff;
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
    gap: 0.35rem;
  }
  .preset {
    text-align: left;
    background: #2a2a30;
    color: #ddd;
    border: 1px solid #3a3a42;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .preset:hover {
    background: #34343c;
    border-color: #4a4a55;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.95rem;
    cursor: pointer;
  }
</style>
