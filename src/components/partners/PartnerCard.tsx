'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn, getScoreLevel } from '@/lib/utils';
import type { Partner } from '@/types/analysis';

interface PartnerCardProps {
  partner: Partner;
  onDelete: (id: string) => void;
}

const SCORE_BADGE_MAP = {
  good: 'bg-score-good-bg text-score-good border-score-good/30',
  warning: 'bg-score-warning-bg text-score-warning border-score-warning/30',
  danger: 'bg-score-danger-bg text-score-danger border-score-danger/30',
} as const;

export function PartnerCard({ partner, onDelete }: PartnerCardProps) {
  const formattedDate = new Date(partner.updatedAt).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  });

  // イニシャルを取得
  const initial = partner.partnerName.charAt(0).toUpperCase();

  // プロファイルテキストからスタイル特性を抽出（あれば）
  const styleTag = partner.profileText?.includes('カジュアル')
    ? 'カジュアル'
    : partner.profileText?.includes('丁寧')
    ? '丁寧'
    : null;

  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* アバター（イニシャル） */}
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
            {initial}
          </div>

          {/* メイン情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">
                  {partner.partnerName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <MaterialIcon name="schedule" size="sm" className="text-[14px]" />
                  <span>{formattedDate}</span>
                  {styleTag && (
                    <span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                      {styleTag}
                    </span>
                  )}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href={`/submit?partnerId=${partner.id}&mode=profile`}>
                    <MaterialIcon name="edit" size="sm" />
                    <span className="sr-only">編集</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(partner.id)}
                >
                  <MaterialIcon name="delete" size="sm" />
                  <span className="sr-only">削除</span>
                </Button>
              </div>
            </div>

            {/* スコア */}
            {partner.lastScores ? (
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1 px-2 py-0.5',
                    SCORE_BADGE_MAP[getScoreLevel(partner.lastScores.warmthMatch, false)]
                  )}
                >
                  <span className="text-xs opacity-70">温度感</span>
                  <span className="font-bold tabular-nums">
                    {partner.lastScores.warmthMatch}
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1 px-2 py-0.5',
                    SCORE_BADGE_MAP[getScoreLevel(partner.lastScores.pressureRisk, true)]
                  )}
                >
                  <span className="text-xs opacity-70">圧リスク</span>
                  <span className="font-bold tabular-nums">
                    {partner.lastScores.pressureRisk}
                  </span>
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">まだ添削していません</p>
            )}

            {/* 添削ボタン */}
            <Button asChild className="w-full mt-3">
              <Link href={`/submit?partnerId=${partner.id}&mode=analyze`}>
                <MaterialIcon name="edit_note" size="sm" className="mr-1" />
                添削する
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
