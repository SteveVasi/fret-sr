<script lang="ts">
  import { type Note, STANDARD_TUNING, noteAt } from './music';

  type Props = {
    frets?: number;
    tuning?: Note[];
    scaleLength?: number;
    showNotes?: boolean;
  };

  const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
  const DOUBLE_INLAYS = new Set([12, 24]);

  let {
    frets = 24,
    tuning = STANDARD_TUNING, // top → bottom
    scaleLength = 2000,
    showNotes = true,
  }: Props = $props();

  // Layout constants (SVG units)
  const NUT_WIDTH = 18;
  const PAD = { left: 60, right: 60, top: 48, bottom: 48 };
  const STRING_SPACING = 72;
  const LABEL_STRIP = 32;
  const DOT_RADIUS = 18;
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
      <line
        x1={PAD.left}
        x2={scaleLength - PAD.right}
        y1={stringY(s)}
        y2={stringY(s)}
        stroke="#d8d4c4"
        stroke-width={stringThickness(s)}
      />
      <text class="open-label" x={PAD.left - 12} y={stringY(s) + 6} text-anchor="end">
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
        {@const visible = showNotes || isHovered}
        <g
          role="button"
          tabindex="0"
          aria-label={`String ${s + 1}, fret ${f}, note ${note}`}
          onmouseenter={() => (hovered = { string: s, fret: f })}
          onmouseleave={() => (hovered = null)}
        >
          {#if visible}
            <circle
              cx={midX(f)}
              cy={stringY(s)}
              r={DOT_RADIUS}
              fill={isHovered ? '#ffcf5c' : isOpen ? '#7ec0ff' : '#222'}
              fill-opacity={isHovered ? 1 : 0.85}
              stroke={isHovered ? '#7a5200' : '#0a0a0a'}
              stroke-width="1.5"
            />
            <text
              class="note-label"
              x={midX(f)}
              y={stringY(s) + 6}
              text-anchor="middle"
              fill={isHovered ? '#222' : '#fff'}
            >
              {note}
            </text>
          {/if}
        </g>
      {/each}
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
  .fret-num {
    font-size: 18px;
    fill: #aaa;
  }
  .open-label {
    font-size: 20px;
    font-weight: 600;
    fill: #ddd;
  }
  .note-label {
    font-size: 17px;
    font-weight: 700;
    pointer-events: none;
  }
  g[role='button'] {
    cursor: pointer;
  }
</style>
