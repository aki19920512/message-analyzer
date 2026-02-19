'use client';

import { AppShell } from '@/components/layout/AppShell';
import { HistoryList } from '@/components/history/HistoryList';
import { useHistory } from '@/hooks/useHistory';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function HistoryPage() {
  const { entries, isLoaded, toggleFavorite, deleteEntry } = useHistory();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MaterialIcon name="history" className="text-primary" />
              添削履歴
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              過去の添削結果を確認できます
            </p>
          </div>
        </div>

        {/* 履歴リスト */}
        {isLoaded ? (
          <HistoryList
            entries={entries}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteEntry}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <MaterialIcon
              name="progress_activity"
              className="animate-spin text-primary"
              size="lg"
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
