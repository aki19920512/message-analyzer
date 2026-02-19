'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnerCard } from './PartnerCard';
import { DeleteDialog } from './DeleteDialog';
import { ActionCard } from './ActionCard';
import { EmptyState } from './EmptyState';
import type { Partner } from '@/types/analysis';

interface PartnerListProps {
  partners: Partner[];
  onDelete: (id: string) => void;
}

export function PartnerList({ partners, onDelete }: PartnerListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);

  const handleDeleteClick = (id: string) => {
    const partner = partners.find((p) => p.id === id);
    if (partner) {
      setDeleteTarget(partner);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">相手一覧</h1>
          <p className="text-muted-foreground text-sm mt-1">
            プロファイルを選んで添削を開始しましょう
          </p>
        </div>
        {partners.length > 0 && (
          <Button asChild size="lg">
            <Link href="/submit?mode=profile">
              <Plus className="size-5" />
              新しい相手を追加
            </Link>
          </Button>
        )}
      </div>

      {/* おすすめアクション */}
      <ActionCard partners={partners} />

      {/* 一覧 */}
      {partners.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <DeleteDialog
        open={!!deleteTarget}
        partnerName={deleteTarget?.partnerName || ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
