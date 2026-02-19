import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function HomePage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* 歓迎セクション */}
        <section className="text-center py-4">
          <h1 className="text-2xl font-bold text-foreground">
            こんにちは！
          </h1>
          <p className="text-muted-foreground mt-1">
            今日も素敵なメッセージを送りましょう
          </p>
        </section>

        {/* メインCTA: 添削ボタン */}
        <Link href="/submit?mode=analyze" className="block">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20">
                  <MaterialIcon name="edit_note" size="lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">メッセージを添削する</h2>
                  <p className="text-primary-foreground/80 text-sm mt-0.5">
                    AIが温度感・圧力をチェック
                  </p>
                </div>
              </div>
              <MaterialIcon name="arrow_forward" size="lg" />
            </CardContent>
          </Card>
        </Link>

        {/* クイックリンクグリッド */}
        <section className="grid grid-cols-3 gap-3">
          <QuickLinkCard
            href="/partners"
            icon="group"
            label="相手一覧"
            description="登録済みの相手"
          />
          <QuickLinkCard
            href="/history"
            icon="history"
            label="添削履歴"
            description="過去の添削"
          />
          <QuickLinkCard
            href="/guide"
            icon="help"
            label="使い方"
            description="ガイド"
          />
        </section>

        {/* 使い方ヒント */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialIcon name="lightbulb" filled />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">はじめての方へ</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  送信前のメッセージをAIがチェック。圧が強すぎないか、温度感があっているかを分析して、3パターンの改善案を提案します。
                </p>
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                >
                  詳しく見る
                  <MaterialIcon name="arrow_forward" size="sm" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 機能紹介 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">主な機能</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureCard
              icon="psychology"
              title="温度感チェック"
              description="相手との温度差を数値化。ズレを可視化します。"
            />
            <FeatureCard
              icon="speed"
              title="圧力リスク判定"
              description="「重い」「圧が強い」メッセージを事前検知。"
            />
            <FeatureCard
              icon="auto_awesome"
              title="3パターン提案"
              description="丁寧・カジュアル・ユーモアの3案を提示。"
            />
            <FeatureCard
              icon="photo_camera"
              title="スクショ読取"
              description="テキストコピーできないアプリもOCRで対応。"
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function QuickLinkCard({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <MaterialIcon name={icon} size="md" />
          </div>
          <span className="font-medium text-foreground text-sm">{label}</span>
          <span className="text-xs text-muted-foreground mt-0.5">{description}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MaterialIcon name={icon} size="md" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
