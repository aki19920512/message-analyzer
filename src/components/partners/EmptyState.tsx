import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

const STEPS = [
  {
    icon: 'content_paste',
    title: '会話を貼る',
    description: 'LINEなどから直近10〜30通をコピペ',
  },
  {
    icon: 'edit_note',
    title: '送る文を入力',
    description: '今送ろうとしているメッセージ',
  },
  {
    icon: 'auto_awesome',
    title: '結果を確認',
    description: '改善案3パターンとスコア',
  },
];

export function EmptyState() {
  return (
    <div className="space-y-8 py-8">
      {/* イラスト風アイコン */}
      <div className="flex flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 mb-4">
          <MaterialIcon name="chat_bubble" size="xl" className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">送る前に、整えましょう</h2>
        <p className="text-sm text-muted-foreground mt-1">
          3ステップで添削できます
        </p>
      </div>

      {/* 3ステップ */}
      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Card key={step.title}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="font-bold text-sm">{index + 1}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <MaterialIcon name={step.icon} size="sm" className="text-muted-foreground" />
                  <p className="font-medium text-sm">{step.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="gap-2">
          <Link href="/submit">
            <MaterialIcon name="edit_note" size="sm" />
            今すぐ添削する
            <MaterialIcon name="arrow_forward" size="sm" />
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg" className="gap-2">
          <Link href="/submit?mode=profile">
            <MaterialIcon name="person_add" size="sm" />
            相手を登録する
          </Link>
        </Button>
      </div>

      {/* 安心メッセージ */}
      <Card className="border-primary/20 bg-primary/5 max-w-md mx-auto">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <MaterialIcon name="lock" size="sm" filled />
            <span className="font-medium text-sm">安心してご利用ください</span>
          </div>
          <p className="text-xs text-muted-foreground">
            会話ログはサーバーに保存されません。相手を登録しなくても添削できます。登録すると次回から直近ログだけでOK。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
