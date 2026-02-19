'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { Partner } from '@/types/analysis';

interface ActionCardProps {
  partners: Partner[];
}

export function ActionCard({ partners }: ActionCardProps) {
  // パートナーがいない場合: ゲスト添削を促す
  if (partners.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="py-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MaterialIcon name="chat_bubble" className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">まずは添削を試してみましょう</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                相手を登録しなくても、すぐに添削できます
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href="/submit">
                <MaterialIcon name="edit_note" size="sm" className="mr-1" />
                今すぐ添削する
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 圧リスクが高い相手を検出
  const highRiskPartner = partners.find(
    (p) => p.lastScores && p.lastScores.pressureRisk > 60
  );

  // 最も古いupdatedAtのパートナーを提案
  const oldest = [...partners].sort(
    (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  )[0];

  // 圧リスク警告がある場合
  if (highRiskPartner) {
    return (
      <Card className="border-yellow-300/50 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
        <CardContent className="py-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
              <MaterialIcon name="warning" className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {highRiskPartner.partnerName}さんは圧リスク高めです
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                送る前に一度確認してみませんか？
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/submit?partnerId=${highRiskPartner.id}&mode=analyze`}>
                この相手を添削する
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link href="/submit">他の相手で添削</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 通常時: おすすめアクション
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="py-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MaterialIcon name="auto_awesome" className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {oldest.partnerName}さんとの会話を確認しませんか？
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              最終確認から少し時間が経っています
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/submit?partnerId=${oldest.id}&mode=analyze`}>
              この相手を添削する
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/submit">他の相手で添削</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
