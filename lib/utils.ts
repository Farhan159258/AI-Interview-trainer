import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(score: number, max = 10) {
  const pct = score / max;
  if (pct >= 0.8) return 'text-success';
  if (pct >= 0.6) return 'text-accent';
  if (pct >= 0.4) return 'text-warn';
  return 'text-danger';
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateLevel(xp: number) {
  return Math.floor(xp / 500) + 1;
}
