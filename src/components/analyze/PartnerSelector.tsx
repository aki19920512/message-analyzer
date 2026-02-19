'use client';

import { cn } from '@/lib/utils';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { Partner } from '@/types/analysis';

interface PartnerSelectorProps {
  partners: Partner[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddNew: () => void;
}

export function PartnerSelector({
  partners,
  selectedId,
  onSelect,
  onAddNew,
}: PartnerSelectorProps) {
  // パートナーのイニシャルを取得
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // パートナーの色を生成（名前からハッシュ）
  const getColor = (name: string) => {
    const colors = [
      'bg-pink-100 text-pink-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-orange-100 text-orange-600',
      'bg-cyan-100 text-cyan-600',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar snap-x">
      {/* ゲストモード（相手を選ばない） */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'flex flex-col items-center gap-2 snap-start transition-opacity',
          selectedId === null ? 'opacity-100' : 'opacity-60 hover:opacity-100'
        )}
      >
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-all',
            selectedId === null
              ? 'border-2 border-primary bg-primary/10'
              : 'border-2 border-transparent bg-muted'
          )}
        >
          <MaterialIcon name="person_off" className="text-muted-foreground" />
        </div>
        <span
          className={cn(
            'text-xs',
            selectedId === null ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
          )}
        >
          選ばない
        </span>
      </button>

      {/* 登録済みパートナー */}
      {partners.map((partner) => {
        const isSelected = selectedId === partner.id;
        return (
          <button
            key={partner.id}
            type="button"
            onClick={() => onSelect(partner.id)}
            className={cn(
              'flex flex-col items-center gap-2 snap-start transition-opacity',
              isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            )}
          >
            <div className="relative">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all',
                  getColor(partner.partnerName),
                  isSelected ? 'border-2 border-primary p-0.5' : 'border-2 border-transparent'
                )}
              >
                {getInitial(partner.partnerName)}
              </div>
              {isSelected && (
                <div className="absolute bottom-0 right-0 bg-primary w-4 h-4 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>
            <span
              className={cn(
                'text-xs truncate max-w-16',
                isSelected ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
              )}
            >
              {partner.partnerName}
            </span>
          </button>
        );
      })}

      {/* 新規追加 */}
      <button
        type="button"
        onClick={onAddNew}
        className="flex flex-col items-center gap-2 snap-start"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <MaterialIcon name="add" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">新規追加</span>
      </button>
    </div>
  );
}
