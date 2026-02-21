'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { getScoreLevel } from '@/lib/utils';
import type { HistoryEntry } from '@/types/history';

interface HistoryDetailModalProps {
  entry: HistoryEntry;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export function HistoryDetailModal({
  entry,
  onClose,
  onToggleFavorite,
}: HistoryDetailModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColorClasses = (level: 'good' | 'warning' | 'danger') => {
    switch (level) {
      case 'good':
        return 'bg-score-good-bg text-score-good';
      case 'warning':
        return 'bg-score-warning-bg text-score-warning';
      case 'danger':
        return 'bg-score-danger-bg text-score-danger';
    }
  };

  const scores = [
    { label: '温度感', value: entry.scores.warmthMatch, inverted: false },
    { label: '圧力リスク', value: entry.scores.pressureRisk, inverted: true },
    { label: '誠実さ', value: entry.scores.sincerity, inverted: false },
    { label: '明確さ', value: entry.scores.clarity, inverted: false },
    { label: 'スタイル', value: entry.scores.styleMatch, inverted: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto bg-background rounded-t-2xl sm:rounded-2xl m-0 sm:m-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background">
          <div>
            <h2 className="font-semibold text-foreground">{entry.partnerName}</h2>
            <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(entry.id)}
            >
              <MaterialIcon
                name="star"
                filled={entry.isFavorite}
                className={entry.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}
              />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <MaterialIcon name="close" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 元のメッセージ */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MaterialIcon name="edit" size="sm" className="text-muted-foreground" />
                送信予定だったメッセージ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{entry.draft}</p>
            </CardContent>
          </Card>

          {/* 改善理由 */}
          {entry.reasons && entry.reasons.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm text-foreground">{entry.reasons[0]}</p>
              </CardContent>
            </Card>
          )}

          {/* スコア */}
          <div className="grid grid-cols-5 gap-2">
            {scores.map(score => {
              const level = getScoreLevel(score.value, { inverted: score.inverted });
              return (
                <div
                  key={score.label}
                  className={`rounded-lg p-2 text-center ${getScoreColorClasses(level)}`}
                >
                  <div className="text-lg font-bold">{score.value}</div>
                  <div className="text-[10px]">{score.label}</div>
                </div>
              );
            })}
          </div>

          {/* 改善案 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MaterialIcon name="auto_awesome" size="sm" className="text-primary" />
                改善案
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.suggestions.map((suggestion, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-muted text-muted-foreground mb-2">
                    {suggestion.label}
                  </span>
                  <p className="text-sm text-foreground">{suggestion.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 次のアクション */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MaterialIcon name="lightbulb" size="sm" className="text-yellow-500" />
                おすすめの次の一手
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{entry.nextStep}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
