'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Scores } from '@/types/analysis';

interface ScoreProgressProps {
  scores: Scores;
}

const SCORE_LABELS: Record<keyof Scores, { label: string; description: string; inverted?: boolean }> = {
  warmthMatch: {
    label: '温度感の一致',
    description: '相手の温度感とどれだけ合っているか',
  },
  pressureRisk: {
    label: '圧力リスク',
    description: '押しが強すぎないか（低いほど良い）',
    inverted: true,
  },
  sincerity: {
    label: '誠実さ',
    description: '真摯な気持ちが伝わるか',
  },
  clarity: {
    label: '明確さ',
    description: '意図が明確に伝わるか',
  },
  styleMatch: {
    label: 'スタイル適合',
    description: '相手のスタイルに合っているか',
  },
};

function getScoreColor(score: number, inverted: boolean = false): string {
  const effectiveScore = inverted ? 100 - score : score;
  if (effectiveScore >= 70) return 'bg-green-500';
  if (effectiveScore >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function ScoreProgress({ scores }: ScoreProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">スコア評価</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {(Object.keys(SCORE_LABELS) as Array<keyof Scores>).map((key) => {
          const { label, description, inverted } = SCORE_LABELS[key];
          const score = scores[key];
          const colorClass = getScoreColor(score, inverted);

          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{label}</span>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <span className="font-bold tabular-nums">{score}</span>
              </div>
              <div className="relative">
                <Progress value={score} className="h-2" />
                <div
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${colorClass}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
