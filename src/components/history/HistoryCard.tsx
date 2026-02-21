'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { getScoreLevel } from '@/lib/utils';
import type { HistoryEntry } from '@/types/history';

interface HistoryCardProps {
  entry: HistoryEntry;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function HistoryCard({
  entry,
  onToggleFavorite,
  onDelete,
  onView,
}: HistoryCardProps) {
  const warmthLevel = getScoreLevel(entry.scores.warmthMatch);
  const pressureLevel = getScoreLevel(entry.scores.pressureRisk, { inverted: true });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今日';
    } else if (days === 1) {
      return '昨日';
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getScoreColor = (level: 'good' | 'warning' | 'danger') => {
    switch (level) {
      case 'good':
        return 'text-score-good';
      case 'warning':
        return 'text-score-warning';
      case 'danger':
        return 'text-score-danger';
    }
  };

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* 左側: メイン情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-foreground truncate">
                {entry.partnerName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(entry.createdAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {entry.draft}
            </p>
            {/* スコアバッジ */}
            <div className="flex items-center gap-3 text-xs">
              <span className={getScoreColor(warmthLevel)}>
                温度感 {entry.scores.warmthMatch}
              </span>
              <span className={getScoreColor(pressureLevel)}>
                圧力 {entry.scores.pressureRisk}
              </span>
            </div>
          </div>

          {/* 右側: アクション */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onToggleFavorite(entry.id)}
            >
              <MaterialIcon
                name="star"
                filled={entry.isFavorite}
                size="sm"
                className={entry.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onView(entry.id)}
            >
              <MaterialIcon name="visibility" size="sm" className="text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onDelete(entry.id)}
            >
              <MaterialIcon name="delete" size="sm" className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
