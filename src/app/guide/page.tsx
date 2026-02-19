import Link from 'next/link';
import { UserPlus, MessageSquare, CheckCircle, Lightbulb, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/AppShell';

const STEPS = [
  {
    icon: UserPlus,
    title: 'Step 1. 相手を登録する',
    description: '会話ログを貼り付けるだけで、AIが相手のコミュニケーション特性を分析します。',
    details: [
      '「相手一覧」から「新しい相手を追加」をクリック',
      '相手の名前（ニックネームでOK）を入力',
      'LINEなどの会話ログを貼り付け（最大20,000文字）',
      '「プロファイルを作成して保存」をクリック',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Step 2. 会話を入力する',
    description: '直近のやりとりと送信予定のメッセージを入力します。',
    details: [
      '添削画面で相手を選択',
      '直近の会話を貼り付け（10〜30通程度でOK）',
      'テキストコピーできない場合は「スクショ読取」も使えます',
      '送信しようとしているメッセージを入力',
      '目的とトーンを選択',
    ],
  },
  {
    icon: CheckCircle,
    title: 'Step 3. 結果を確認する',
    description: 'スコアと3パターンの改善提案を確認し、最適なメッセージを送信しましょう。',
    details: [
      '5軸のスコアで送信文の評価を確認',
      '丁寧/カジュアル/ユーモアの3つの改善案から選択',
      '改善案をコピーしてアレンジ',
      '次のステップのアドバイスも参考に',
    ],
  },
];

const TIPS = [
  {
    title: '直近のやりとりが重要',
    description:
      '全文を貼る必要はありません。最後の10〜30通あれば、AIは十分に文脈を理解できます。',
  },
  {
    title: 'プロファイル更新は必要なときだけ',
    description:
      '久しぶりの相談や、相手との関係に変化があった場合にのみプロファイルを更新してください。',
  },
  {
    title: '提案はあくまで参考に',
    description:
      'AIの提案をそのまま送るのではなく、ご自身の言葉でアレンジすることで、より自然なメッセージになります。',
  },
  {
    title: '相手の反応を尊重する',
    description:
      'スコアが低くても気にしすぎないでください。相手との関係性は数値では測れない部分もあります。',
  },
];

export default function GuidePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">使い方ガイド</h1>
          <p className="text-muted-foreground text-sm">
            3ステップで添削を始められます
          </p>
        </div>

        {/* 3ステップ */}
        <div className="space-y-6">
          {STEPS.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="size-5 text-primary" />
                  </div>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm pl-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="text-muted-foreground">
                      {detail}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* コツ */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb className="size-5 text-primary" />
            より良い結果を得るコツ
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TIPS.map((tip) => (
              <Card key={tip.title}>
                <CardContent className="pt-5">
                  <p className="font-medium text-sm mb-1">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="size-5 text-primary" />
            よくある質問
          </h2>
          <Card>
            <CardContent className="pt-5 space-y-4 text-sm">
              <div>
                <p className="font-medium">Q. 会話ログは保存されますか？</p>
                <p className="text-muted-foreground mt-1">
                  いいえ。会話ログは添削処理のためにサーバーに送信されますが、保存されません。
                  詳しくは<a href="/privacy" className="text-primary hover:underline">プライバシーポリシー</a>をご確認ください。
                </p>
              </div>
              <div>
                <p className="font-medium">Q. スクショから読み取った文字が間違っていました</p>
                <p className="text-muted-foreground mt-1">
                  OCR（文字読み取り）は100%正確ではありません。読み取り結果は編集できますので、
                  間違いがあれば手動で修正してからお使いください。
                </p>
              </div>
              <div>
                <p className="font-medium">Q. 毎回全文を貼る必要がありますか？</p>
                <p className="text-muted-foreground mt-1">
                  いいえ。プロファイルが作成済みなら、直近の10〜30通のやりとりだけで十分です。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center py-4">
          <Button asChild size="lg">
            <Link href="/partners">添削を始める</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
