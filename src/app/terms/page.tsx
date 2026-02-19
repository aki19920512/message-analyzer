import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/layout/AppShell';

export default function TermsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">利用規約</h1>
          <p className="text-muted-foreground text-sm">
            最終更新日: 2025年1月
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">サービスの概要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              MessageCoach（以下「本サービス」）は、メッセージの添削・改善提案を行うWebアプリケーションです。
              OpenAI社のAPIを利用してAIによる分析を提供します。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">免責事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li>
                本サービスが提供する添削結果・改善提案はAIによる参考情報であり、
                その正確性や効果を保証するものではありません。
              </li>
              <li>
                本サービスの利用により生じた損害について、運営者は一切の責任を負いません。
              </li>
              <li>
                メッセージの送信判断はご自身の責任で行ってください。
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">禁止事項</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li>本サービスを不正な目的で利用すること</li>
              <li>第三者のプライバシーを侵害する目的での利用</li>
              <li>本サービスに過度な負荷をかける行為</li>
              <li>本サービスのリバースエンジニアリング</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">データの取り扱い</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              データの取り扱いについては
              <a href="/privacy" className="text-primary hover:underline mx-1">
                プライバシーポリシー
              </a>
              をご確認ください。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">規約の変更</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              本規約は予告なく変更される場合があります。
              変更後も本サービスを利用された場合、変更後の規約に同意したものとみなします。
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
