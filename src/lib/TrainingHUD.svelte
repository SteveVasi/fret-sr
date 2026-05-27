<script lang="ts">
  import type { TrainingSession } from './training.svelte';
  import { settings } from './settings.svelte';

  type Props = {
    session: TrainingSession;
  };

  let { session }: Props = $props();

  const timeLeft = $derived(Math.max(0, settings.timeLimit - session.elapsed));
  const progress = $derived(
    settings.timeLimit > 0 ? (timeLeft / settings.timeLimit) * 100 : 0,
  );
</script>

{#if session.status !== 'idle'}
  {#if settings.clickMode}
    <div class="stopwatch" aria-live="polite">
      {#if session.lastDuration !== null}
        <span class="elapsed" class:result-correct={session.lastResult === 'correct'} class:result-wrong={session.lastResult === 'wrong'}>
          {session.lastDuration.toFixed(2)}<small>s</small>
        </span>
        {#if session.lastResult === 'correct'}
          <span class="badge correct">✓ Correct</span>
        {:else if session.lastResult === 'wrong'}
          <span class="badge wrong">✗ Wrong</span>
        {/if}
      {:else}
        <span class="elapsed">{session.elapsed.toFixed(2)}<small>s</small></span>
      {/if}
    </div>
  {:else}
    <div class="timer" aria-label={`${timeLeft.toFixed(1)} seconds left`}>
      <div
        class="timer-fill"
        class:warning={timeLeft < 2}
        style="width: {progress}%"
      ></div>
    </div>
  {/if}
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
  .stopwatch {
    margin-top: 1.5rem;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 1rem;
    font-family: system-ui, sans-serif;
  }
  .elapsed {
    font-size: 2.4rem;
    font-weight: 700;
    color: #ddd;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
    line-height: 1;
  }
  .elapsed small {
    font-size: 1.2rem;
    color: #888;
    margin-left: 0.15rem;
    font-weight: 600;
  }
  .elapsed.result-correct {
    color: #5cd97f;
  }
  .elapsed.result-wrong {
    color: #ff7c7c;
  }
  .badge {
    font-weight: 700;
    font-size: 1rem;
  }
  .badge.correct {
    color: #5cd97f;
  }
  .badge.wrong {
    color: #ff7c7c;
  }
</style>
