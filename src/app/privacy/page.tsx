import { Shield, Database, Brain, Heart, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/layout/AppShell';

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">安心してお使いいただくために</h1>
          <p className="text-muted-foreground text-sm">
            MessageCoachのデータ取り扱いとサービスの考え方をご説明します
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="size-5 text-primary" />
              データの取り扱い
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              MessageCoachでは、お客様のプライバシーを最優先に考えています。
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">会話ログは保存しません。</strong>
                添削のためにサーバーに送信されますが、処理後に即座に破棄されます。
              </li>
              <li>
                <strong className="text-foreground">スクリーンショットは保存しません。</strong>
                OCR（文字読み取り）処理のためのみに送信され、保存されません。
              </li>
              <li>
                <strong className="text-foreground">保存されるのはプロファイル（要約テキスト）とスコア（数値）のみ</strong>で、
                ブラウザのlocalStorageに保存されます。サーバー側には一切保存されません。
              </li>
              <li>
                ブラウザのデータを削除すれば、全ての情報が完全に消去されます。
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="size-5 text-primary" />
              AIの限界について
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              添削結果はAIによる提案であり、絶対的な正解ではありません。
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                スコアや改善案は<strong className="text-foreground">あくまで参考</strong>としてお使いください。
              </li>
              <li>
                相手との関係性やその場の文脈は、あなた自身が一番よく理解しています。
              </li>
              <li>
                AIの提案をそのまま送るのではなく、ご自身の言葉でアレンジすることをお勧めします。
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="size-5 text-primary" />
              相手への敬意
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              MessageCoachは、相手を操作するためのツールではありません。
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                相手の<strong className="text-foreground">意思や境界線を尊重</strong>する提案のみを行います。
              </li>
              <li>
                罪悪感を利用したり、相手を支配するような提案は行いません。
              </li>
              <li>
                より良いコミュニケーションを目指すための添削を提供します。
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="size-5 text-primary" />
              OpenAIの利用について
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              MessageCoachはOpenAI社のAPIを利用して添削・分析を行っています。
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                送信されたデータはOpenAIの
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  プライバシーポリシー
                  <ExternalLink className="size-3" />
                </a>
                に基づいて処理されます。
              </li>
              <li>
                API経由のデータはモデルの学習には使用されません（OpenAI APIの方針に準拠）。
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
