import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes conditionally without style conflicts
 * with tailwind-merge and clsx
 * `e.g`
 * ```tsx
 * <span className={twclsx('text-theme-200')}>Hello</span>
 * ```
 */
export const twclsx = (...args: ClassValue[]) => twMerge(clsx(...args));
