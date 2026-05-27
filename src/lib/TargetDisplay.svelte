<script lang="ts">
  import type { TrainingSession } from './training.svelte';
  import type { Note } from './music';
  import Button from './Button.svelte';

  type Props = {
    session: TrainingSession;
    tuning: Note[];
    onStart: () => void;
  };

  let { session, tuning, onStart }: Props = $props();

  const openNote = $derived(
    session.target ? tuning[session.target.stringIdx] : null,
  );
</script>

<div class="wrap">
  {#if session.status === 'idle'}
    <Button variant="primary" size="lg" onclick={onStart}>Start training</Button>
  {:else if session.target}
    <div class="target">
      <div class="note">{session.target.note}</div>
      <div class="meta">
        on string <strong>{session.target.stringIdx + 1}</strong>
        <span class="open">({openNote})</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .wrap {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    font-family: system-ui, sans-serif;
    color: #eee;
  }
  .target {
    display: grid;
    grid-template-columns: 14rem 26rem;
    gap: 1.5rem;
    align-items: baseline;
  }
  .note {
    font-size: 9rem;
    font-weight: 800;
    color: #7ec0ff;
    line-height: 1;
    letter-spacing: -0.02em;
    text-align: right;
  }
  .meta {
    font-size: 2.25rem;
    color: #ccc;
    font-weight: 500;
    text-align: left;
    white-space: nowrap;
    line-height: 1;
  }
  .meta strong {
    color: #ffd87a;
    font-weight: 800;
    font-size: 9rem;
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 0 0.25rem;
  }
  .open {
    color: #888;
    font-weight: 800;
    font-size: 9rem;
    line-height: 1;
    letter-spacing: -0.02em;
    margin-left: 0.4rem;
  }
</style>
