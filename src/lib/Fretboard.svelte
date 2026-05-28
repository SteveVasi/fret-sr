<script lang="ts">
  import { type Note, STANDARD_TUNING, noteAt } from './music';

  type RevealCell = { mode: 'guitar'; string: number; fret: number };
  type Feedback = { mode: 'guitar'; kind: 'correct' | 'wrong'; string: number; fret: number };
  type Mark = { string: number; fret: number };

  type Props = {
    frets?: number;
    tuning?: Note[];
    scaleLength?: number;
    showNotes?: boolean;
    hoverHints?: boolean;
    highlightString?: number | null;
    reveal?: RevealCell[] | null;
    feedback?: Feedback | null;
    /** A target position to highlight (used by cross-instrument modes). */
    mark?: Mark | null;
    /** Whether the marked position's note label should be revealed. */
    showMarkLabel?: boolean;
    onSelect?: (stringIdx: number, fret: number, note: Note) => void;
  };

  const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
  const DOUBLE_INLAYS = new Set([12, 24]);

  let {
    frets = 24,
    tuning = STANDARD_TUNING, // top → bottom
    scaleLength = 2000,
    showNotes = true,
    hoverHints = false,
    highlightString = null,
    reveal = null,
    feedback = null,
    mark = null,
    showMarkLabel = false,
    onSelect,
  }: Props = $props();

  const isRevealed = (s: number, f: number) =>
    reveal?.some((c) => c.string === s && c.fret === f) ?? false;

  // Layout constants (SVG units)
  const NUT_WIDTH = 18;
  const PAD = { left: 60, right: 60, top: 48, bottom: 48 };
  const STRING_SPACING = 72;
  const LABEL_STRIP = 32;
  const DOT_RADIUS = 18;
  const REVEAL_RADIUS = 30;
  const HIT_SIZE = 44;

  // Derived geometry
  const stringCount = $derived(tuning.length);
  const boardTop = PAD.top - STRING_SPACING / 2;
  const woodHeight = $derived(stringCount * STRING_SPACING);
  const boardBottom = $derived(boardTop + woodHeight);
  const boardHeight = $derived(PAD.top + PAD.bottom + (stringCount - 1) * STRING_SPACING);
  const viewHeight = $derived(boardHeight + LABEL_STRIP);

  // Fret x-positions using 12-TET: x_n = L * (1 - 2^(-n/12)), then scaled to fit usable width
  const fretX = $derived.by(() => {
    const usable = scaleLength - PAD.left - PAD.right - NUT_WIDTH;
    const raw = Array.from({ length: frets + 1 }, (_, i) => 1 - Math.pow(2, -i / 12));
    return raw.map((r) => PAD.left + NUT_WIDTH + (r / raw[frets]) * usable);
  });

  const midX = (fret: number) =>
    fret === 0 ? PAD.left / 2 + NUT_WIDTH / 2 : (fretX[fret - 1] + fretX[fret]) / 2;

  const stringY = (s: number) => PAD.top + s * STRING_SPACING;
  const stringThickness = (s: number) => 1 + (s / (stringCount - 1)) * 2.5;

  let hovered = $state<{ string: number; fret: number } | null>(null);
</script>

<div class="wrap">
  <svg viewBox="0 0 {scaleLength} {viewHeight}" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#3a2418" />
        <stop offset="50%" stop-color="#4a2e1c" />
        <stop offset="100%" stop-color="#2e1a10" />
      </linearGradient>
    </defs>

    <!-- Fretboard wood -->
    <rect
      x={PAD.left}
      y={boardTop}
      width={scaleLength - PAD.left - PAD.right}
      height={woodHeight}
      fill="url(#wood)"
      rx="4"
    />

    <!-- Inlays -->
    {#each Array(frets) as _, i}
      {@const f = i + 1}
      {#if SINGLE_INLAYS.has(f)}
        <circle cx={midX(f)} cy={boardHeight / 2} r="11" fill="#e8dfc6" opacity="0.75" />
      {:else if DOUBLE_INLAYS.has(f)}
        <circle cx={midX(f)} cy={PAD.top + STRING_SPACING * 0.5} r="11" fill="#e8dfc6" opacity="0.75" />
        <circle cx={midX(f)} cy={PAD.top + STRING_SPACING * (stringCount - 1.5)} r="11" fill="#e8dfc6" opacity="0.75" />
      {/if}
    {/each}

    <!-- Nut -->
    <rect x={PAD.left} y={boardTop} width={NUT_WIDTH} height={woodHeight} fill="#f5ecd6" />

    <!-- Fret wires -->
    {#each fretX as x, i}
      {#if i > 0}
        <line x1={x} x2={x} y1={boardTop} y2={boardBottom} stroke="#c8c8d0" stroke-width="2.5" />
      {/if}
    {/each}

    <!-- Fret numbers -->
    {#each Array(frets) as _, i}
      {@const f = i + 1}
      <text class="fret-num" x={midX(f)} y={boardHeight + 10} text-anchor="middle">{f}</text>
    {/each}

    <!-- Strings + open-string labels -->
    {#each tuning as openNote, s}
      {@const isHl = highlightString === s}
      {#if isHl}
        <line
          x1={PAD.left}
          x2={scaleLength - PAD.right}
          y1={stringY(s)}
          y2={stringY(s)}
          stroke="#ffcf5c"
          stroke-width={stringThickness(s) + 28}
          stroke-opacity="0.18"
        />
        <line
          x1={PAD.left}
          x2={scaleLength - PAD.right}
          y1={stringY(s)}
          y2={stringY(s)}
          stroke="#ffcf5c"
          stroke-width={stringThickness(s) + 14}
          stroke-opacity="0.4"
        />
      {/if}
      <line
        x1={PAD.left}
        x2={scaleLength - PAD.right}
        y1={stringY(s)}
        y2={stringY(s)}
        stroke={isHl ? '#ffd87a' : '#d8d4c4'}
        stroke-width={stringThickness(s) + (isHl ? 7 : 0)}
      />
      <text
        class="open-label"
        class:hl={isHl}
        x={PAD.left - 14}
        y={stringY(s) + (isHl ? 13 : 8)}
        text-anchor="end"
      >
        {openNote}
      </text>
    {/each}

    <!-- Note dots (skip fret 0 — open strings are labeled next to the nut) -->
    {#each tuning as openNote, s}
      {#each Array(frets) as _, i}
        {@const f = i + 1}
        {@const note = noteAt(openNote, f)}
        {@const isHovered = hovered?.string === s && hovered?.fret === f}
        {@const isOpen = note === openNote}
        {@const revealed = isRevealed(s, f)}
        {@const fb = feedback?.string === s && feedback?.fret === f ? feedback.kind : null}
        {@const clickable = !!onSelect}
        {@const visible = showNotes || (hoverHints && isHovered) || revealed || fb !== null}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <g
          class:clickable
          role={clickable ? 'button' : undefined}
          tabindex={clickable ? 0 : undefined}
          aria-label={clickable ? `String ${s + 1}, fret ${f}, note ${note}` : undefined}
          aria-hidden={clickable ? undefined : true}
          onmouseenter={() => (hovered = { string: s, fret: f })}
          onmouseleave={() => (hovered = null)}
          onclick={clickable ? () => onSelect?.(s, f, note) : undefined}
          onkeydown={clickable
            ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(s, f, note)
            : undefined}
        >
          <rect
            x={midX(f) - HIT_SIZE / 2}
            y={stringY(s) - HIT_SIZE / 2}
            width={HIT_SIZE}
            height={HIT_SIZE}
            fill="transparent"
          />
          {#if visible}
            <circle
              cx={midX(f)}
              cy={stringY(s)}
              r={revealed ? REVEAL_RADIUS : DOT_RADIUS}
              fill={fb === 'correct'
                ? '#5cd97f'
                : fb === 'wrong'
                  ? '#ff5c5c'
                  : revealed
                    ? '#5cd97f'
                    : isHovered
                      ? '#ffcf5c'
                      : isOpen
                        ? '#7ec0ff'
                        : '#222'}
              fill-opacity={isHovered || revealed || fb ? 1 : 0.85}
              stroke="#0a0a0a"
              stroke-width={revealed || fb ? 2.5 : 1.5}
            />
            <text
              class="note-label"
              class:reveal={revealed}
              x={midX(f)}
              y={stringY(s) + (revealed ? 10 : 6)}
              text-anchor="middle"
              fill={revealed || fb || isHovered ? '#222' : '#fff'}
            >
              {note}
            </text>
          {/if}
        </g>
      {/each}
    {/each}

    <!-- Target marker (cross-instrument modes) — drawn last so it sits on top -->
    {#if mark}
      {@const mx = midX(mark.fret)}
      {@const my = stringY(mark.string)}
      {@const markNote = noteAt(tuning[mark.string], mark.fret)}
      <circle cx={mx} cy={my} r="36" fill="#ffd87a" fill-opacity="0.22" />
      <circle cx={mx} cy={my} r="26" fill="#ffd87a" fill-opacity="0.45" />
      <circle cx={mx} cy={my} r="18" fill="#ffd87a" stroke="#0a0a0a" stroke-width="2" />
      {#if showMarkLabel}
        <text
          class="mark-label"
          x={mx}
          y={my + 6}
          text-anchor="middle"
        >
          {markNote}
        </text>
      {/if}
    {/if}
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
  .fret-num {
    font-size: 18px;
    fill: #aaa;
  }
  .open-label {
    font-size: 28px;
    font-weight: 700;
    fill: #ddd;
  }
  .open-label.hl {
    font-size: 44px;
    font-weight: 800;
    fill: #ffd87a;
  }
  .note-label {
    font-size: 17px;
    font-weight: 700;
    pointer-events: none;
  }
  .note-label.reveal {
    font-size: 28px;
    font-weight: 800;
  }
  .mark-label {
    font-size: 18px;
    font-weight: 800;
    fill: #1a1a1a;
    pointer-events: none;
  }
  g.clickable {
    cursor: pointer;
  }
</style>
