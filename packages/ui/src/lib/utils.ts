import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind classes.
 * `clsx` resolves conditionals; `twMerge` ensures the last conflicting utility
 * wins (e.g. `cn('p-2', 'p-4')` => `'p-4'`). Used by every shadcn component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
