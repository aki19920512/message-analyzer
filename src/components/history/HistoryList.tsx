'use client';

import { useState } from 'react';
import { HistoryCard } from './HistoryCard';
import { HistoryDetailModal } from './HistoryDetailModal';
import { Card, CardContent } from '@/components/ui/card';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { HistoryEntry } from '@/types/history';

interface HistoryListProps {
  entries: HistoryEntry[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryList({
  entries,
  onToggleFavorite,
  onDelete,
}: HistoryListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const filteredEntries = filter === 'favorites'
    ? entries.filter(e => e.isFavorite)
    : entries;

  const selectedEntry = selectedId
    ? entries.find(e => e.id === selectedId)
    : null;

  if (entries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
            <MaterialIcon name="history" size="lg" className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">履歴がありません</h3>
          <p className="text-sm text-muted-foreground">
            メッセージを添削すると、ここに履歴が表示されます
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* フィルター */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          すべて ({entries.length})
        </button>
        <button
          onClick={() => setFilter('favorites')}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${
            filter === 'favorites'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <MaterialIcon name="star" size="sm" filled />
          お気に入り ({entries.filter(e => e.isFavorite).length})
        </button>
      </div>

      {/* リスト */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                お気に入りの履歴がありません
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map(entry => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
              onView={setSelectedId}
            />
          ))
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedEntry && (
        <HistoryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedId(null)}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
}
