import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreLevel(score: number, inverted = false): 'good' | 'warning' | 'danger' {
  const effective = inverted ? 100 - score : score;
  if (effective >= 70) return 'good';
  if (effective >= 40) return 'warning';
  return 'danger';
}

export function getScoreLevelLabel(level: 'good' | 'warning' | 'danger'): string {
  const labels = { good: '良い', warning: '注意', danger: '危険' };
  return labels[level];
}

export function getScoreBarColor(level: 'good' | 'warning' | 'danger'): string {
  const colors = {
    good: 'bg-score-good',
    warning: 'bg-score-warning',
    danger: 'bg-score-danger'
  };
  return colors[level];
}

export function getScoreLevelClasses(level: 'good' | 'warning' | 'danger'): string {
  const classes = {
    good: 'bg-score-good-bg text-score-good',
    warning: 'bg-score-warning-bg text-score-warning',
    danger: 'bg-score-danger-bg text-score-danger'
  };
  return classes[level];
}
