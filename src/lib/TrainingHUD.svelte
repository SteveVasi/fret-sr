<script lang="ts">
  import type { TrainingSession } from './training.svelte';

  type Props = {
    session: TrainingSession;
  };

  let { session }: Props = $props();

  const progress = $derived(
    session.timeLimit > 0 ? (session.timeLeft / session.timeLimit) * 100 : 0,
  );
</script>

{#if session.status !== 'idle'}
  <div class="timer" aria-label={`${session.timeLeft.toFixed(1)} seconds left`}>
    <div
      class="timer-fill"
      class:warning={session.timeLeft < 2}
      style="width: {progress}%"
    ></div>
  </div>
{/if}

<style>
  .timer {
    height: 10px;
    background: #2a2a30;
    border-radius: 5px;
    overflow: hidden;
    margin-top: 1.5rem;
  }
  .timer-fill {
    height: 100%;
    background: #7ec0ff;
    transition: background 0.2s;
  }
  .timer-fill.warning {
    background: #ff8a4c;
  }
</style>
