<script lang="ts">
  import {
    type Note,
    PIANO_LOW_MIDI,
    PIANO_HIGH_MIDI,
    isBlackKey,
    noteForMidi,
  } from './music';

  type Feedback = { mode: 'piano'; kind: 'correct' | 'wrong'; midi: number };
  type RevealCell = { mode: 'piano'; midi: number };

  type Props = {
    showNotes?: boolean;
    hoverHints?: boolean;
    reveal?: RevealCell[] | null;
    feedback?: Feedback | null;
    onSelect?: (midi: number, note: Note) => void;
  };

  let {
    showNotes = false,
    hoverHints = false,
    reveal = null,
    feedback = null,
    onSelect,
  }: Props = $props();

  // Layout constants (SVG units)
  const WHITE_W = 70;
  const WHITE_H = 280;
  const BLACK_W = 44;
  const BLACK_H = 175;
  const PAD = 12;

  const allMidi = Array.from(
    { length: PIANO_HIGH_MIDI - PIANO_LOW_MIDI + 1 },
    (_, i) => PIANO_LOW_MIDI + i,
  );
  const whiteMidi = allMidi.filter((m) => !isBlackKey(m));
  const blackMidi = allMidi.filter((m) => isBlackKey(m));

  const totalWidth = whiteMidi.length * WHITE_W + PAD * 2;
  const viewHeight = WHITE_H + PAD * 2;

  const whiteX = (midi: number) =>
    PAD + whiteMidi.indexOf(midi) * WHITE_W;

  const blackX = (midi: number) => {
    // A black key sits between two whites — anchor it to the right edge of
    // the white key one semitone below (C# rides on C, D# rides on D, …).
    const idx = whiteMidi.indexOf(midi - 1);
    return PAD + (idx + 1) * WHITE_W - BLACK_W / 2;
  };

  const isRevealed = (midi: number) =>
    reveal?.some((c) => c.midi === midi) ?? false;

  const fbKind = (midi: number) =>
    feedback?.midi === midi ? feedback.kind : null;

  let hovered = $state<number | null>(null);
  const clickable = $derived(!!onSelect);

  function activate(midi: number) {
    onSelect?.(midi, noteForMidi(midi));
  }
</script>

<div class="wrap">
  <svg viewBox="0 0 {totalWidth} {viewHeight}" preserveAspectRatio="xMidYMid meet">
    <!-- White keys -->
    {#each whiteMidi as midi}
      {@const x = whiteX(midi)}
      {@const isHover = hovered === midi}
      {@const revealed = isRevealed(midi)}
      {@const fb = fbKind(midi)}
      {@const showLabel = showNotes || (hoverHints && isHover) || revealed || fb !== null}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <g
        class:clickable
        role={clickable ? 'button' : undefined}
        tabindex={clickable ? 0 : undefined}
        aria-label={clickable ? `Piano key ${noteForMidi(midi)}` : undefined}
        aria-hidden={clickable ? undefined : true}
        onmouseenter={() => (hovered = midi)}
        onmouseleave={() => (hovered = null)}
        onclick={clickable ? () => activate(midi) : undefined}
        onkeydown={clickable
          ? (e) => (e.key === 'Enter' || e.key === ' ') && activate(midi)
          : undefined}
      >
        <rect
          x={x}
          y={PAD}
          width={WHITE_W}
          height={WHITE_H}
          rx="4"
          fill={fb === 'correct'
            ? '#5cd97f'
            : fb === 'wrong'
              ? '#ff5c5c'
              : revealed
                ? '#5cd97f'
                : isHover
                  ? '#e4e9f1'
                  : '#f5f1e4'}
          stroke="#1a1a1a"
          stroke-width="1.5"
        />
        {#if showLabel}
          <text
            class="key-label"
            class:dark={!revealed && !fb}
            x={x + WHITE_W / 2}
            y={PAD + WHITE_H - 20}
            text-anchor="middle"
          >
            {noteForMidi(midi)}
          </text>
        {/if}
      </g>
    {/each}

    <!-- Black keys (rendered after whites so they overlap correctly) -->
    {#each blackMidi as midi}
      {@const x = blackX(midi)}
      {@const isHover = hovered === midi}
      {@const revealed = isRevealed(midi)}
      {@const fb = fbKind(midi)}
      {@const showLabel = showNotes || (hoverHints && isHover) || revealed || fb !== null}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <g
        class:clickable
        role={clickable ? 'button' : undefined}
        tabindex={clickable ? 0 : undefined}
        aria-label={clickable ? `Piano key ${noteForMidi(midi)}` : undefined}
        aria-hidden={clickable ? undefined : true}
        onmouseenter={() => (hovered = midi)}
        onmouseleave={() => (hovered = null)}
        onclick={clickable ? () => activate(midi) : undefined}
        onkeydown={clickable
          ? (e) => (e.key === 'Enter' || e.key === ' ') && activate(midi)
          : undefined}
      >
        <rect
          x={x}
          y={PAD}
          width={BLACK_W}
          height={BLACK_H}
          rx="3"
          fill={fb === 'correct'
            ? '#5cd97f'
            : fb === 'wrong'
              ? '#ff5c5c'
              : revealed
                ? '#5cd97f'
                : isHover
                  ? '#3a3a45'
                  : '#1a1a1f'}
          stroke="#0a0a0a"
          stroke-width="1.5"
        />
        {#if showLabel}
          <text
            class="key-label"
            class:dark={revealed || !!fb}
            x={x + BLACK_W / 2}
            y={PAD + BLACK_H - 12}
            text-anchor="middle"
          >
            {noteForMidi(midi)}
          </text>
        {/if}
      </g>
    {/each}
  </svg>
</div>

<style>
  .wrap {
    width: 100%;
    margin: 0 auto;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
    font-family: system-ui, sans-serif;
  }
  .key-label {
    font-size: 18px;
    font-weight: 700;
    fill: #eee;
    pointer-events: none;
  }
  .key-label.dark {
    fill: #1a1a1a;
  }
  g.clickable {
    cursor: pointer;
  }
</style>
