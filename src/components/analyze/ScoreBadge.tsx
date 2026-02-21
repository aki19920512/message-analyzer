'use client';

import { cn, getScoreLevel } from '@/lib/utils';

interface ScoreBadgeProps {
  label: string;
  description: string;
  score: number;
  inverted?: boolean;
}

const SCORE_COLOR_MAP = {
  good: 'text-score-good bg-score-good-bg',
  warning: 'text-score-warning bg-score-warning-bg',
  danger: 'text-score-danger bg-score-danger-bg',
} as const;

export function ScoreBadge({ label, description, score, inverted = false }: ScoreBadgeProps) {
  const level = getScoreLevel(score, { inverted });

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg px-3 py-3',
        SCORE_COLOR_MAP[level]
      )}
    >
      <span className="text-2xl font-bold tabular-nums">{score}</span>
      <span className="text-xs font-medium mt-1">{label}</span>
      <span className="text-[10px] opacity-70 mt-0.5 text-center leading-tight">
        {description}
      </span>
    </div>
  );
}
