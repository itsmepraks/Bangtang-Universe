import type { KeyboardEvent } from 'react';

/** Move focus and selection together inside a horizontal tab list. */
export function handleTabKeyDown<T extends string>(
  event: KeyboardEvent<HTMLDivElement>,
  ids: readonly T[],
  active: T,
  onChange: (id: T) => void,
) {
  if (!(event.target instanceof HTMLElement) || event.target.getAttribute('role') !== 'tab') return;
  const current = ids.indexOf(active);
  const next = event.key === 'ArrowRight' ? (current + 1) % ids.length
    : event.key === 'ArrowLeft' ? (current - 1 + ids.length) % ids.length
    : event.key === 'Home' ? 0 : event.key === 'End' ? ids.length - 1 : -1;
  if (next < 0) return;
  event.preventDefault();
  onChange(ids[next]);
  event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
}
