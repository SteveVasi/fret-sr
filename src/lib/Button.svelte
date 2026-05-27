<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
  type Size = 'sm' | 'md' | 'lg';

  type Props = {
    variant?: Variant;
    size?: Size;
    onclick?: (e: MouseEvent) => void;
    ariaLabel?: string;
    type?: 'button' | 'submit';
    children: Snippet;
  };

  let {
    variant = 'secondary',
    size = 'md',
    onclick,
    ariaLabel,
    type = 'button',
    children,
  }: Props = $props();
</script>

<button class="btn {variant} {size}" {type} {onclick} aria-label={ariaLabel}>
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
    font-weight: 600;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease,
      transform 0.08s ease, box-shadow 0.15s ease;
    white-space: nowrap;
    user-select: none;
  }
  .btn:focus-visible {
    outline: 2px solid #7ec0ff;
    outline-offset: 2px;
  }
  .btn:active {
    transform: translateY(1px);
  }

  /* Sizes */
  .sm {
    padding: 0.4rem 0.85rem;
    font-size: 0.85rem;
  }
  .md {
    padding: 0.55rem 1.1rem;
    font-size: 0.95rem;
  }
  .lg {
    padding: 1.1rem 2.4rem;
    font-size: 1.5rem;
    font-weight: 800;
    border-radius: 12px;
  }

  /* Variants */
  .primary {
    background: #7ec0ff;
    color: #0a1828;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(126, 192, 255, 0.25);
  }
  .primary:hover {
    background: #a3d3ff;
    box-shadow: 0 6px 18px rgba(126, 192, 255, 0.35);
    transform: translateY(-1px);
  }
  .primary:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(126, 192, 255, 0.25);
  }

  .secondary {
    background: #2a2a30;
    color: #ddd;
    border-color: #3a3a42;
  }
  .secondary:hover {
    background: #34343c;
    border-color: #4a4a55;
  }

  .danger {
    background: #3a2a2a;
    color: #ffb0b0;
    border-color: #5a3a3a;
  }
  .danger:hover {
    background: #4a3434;
    border-color: #7a4848;
    color: #ffc8c8;
  }

  .ghost {
    background: transparent;
    color: #aaa;
    border-color: transparent;
  }
  .ghost:hover {
    background: #2a2a30;
    color: #fff;
  }
</style>
