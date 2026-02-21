'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useSettings, type EmojiPolicy } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateEmojiPolicy } = useSettings();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MaterialIcon name="settings" className="text-primary" />
            設定
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            アプリの設定を変更できます
          </p>
        </div>

        {/* テーマ設定 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">外観</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <ThemeOption
                  icon="light_mode"
                  label="ライトモード"
                  description="明るい配色"
                  selected={theme === 'light'}
                  onClick={() => setTheme('light')}
                />
                <ThemeOption
                  icon="dark_mode"
                  label="ダークモード"
                  description="目に優しい暗い配色"
                  selected={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                />
                <ThemeOption
                  icon="contrast"
                  label="システム設定"
                  description="端末の設定に合わせる"
                  selected={theme === 'system'}
                  onClick={() => setTheme('system')}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 絵文字設定 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">絵文字設定</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <EmojiOption
                  icon="block"
                  label="なし"
                  description="改善案に絵文字を使わない"
                  selected={settings.emojiPolicy === 'none'}
                  onClick={() => updateEmojiPolicy('none')}
                />
                <EmojiOption
                  icon="person"
                  label="ユーザーに合わせる"
                  description="あなたの下書きにある絵文字のみ使用"
                  selected={settings.emojiPolicy === 'keep_user_only'}
                  onClick={() => updateEmojiPolicy('keep_user_only')}
                />
                <EmojiOption
                  icon="auto_awesome"
                  label="AI提案OK"
                  description="AIが適切と判断した絵文字も使用"
                  selected={settings.emojiPolicy === 'allow_ai'}
                  onClick={() => updateEmojiPolicy('allow_ai')}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ヘルプ・情報 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">ヘルプ・情報</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <LinkItem
                  href="/guide"
                  icon="help"
                  label="使い方ガイド"
                />
                <LinkItem
                  href="/privacy"
                  icon="security"
                  label="プライバシーポリシー"
                />
                <LinkItem
                  href="/terms"
                  icon="description"
                  label="利用規約"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* バージョン情報 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">アプリ情報</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <MaterialIcon name="chat_bubble" filled />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">MessageCoach</h3>
                  <p className="text-sm text-muted-foreground">バージョン 0.1.0</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                送信前のメッセージをAIがチェック。圧が強すぎないか、温度感があっているかを分析します。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 安心設計 */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialIcon name="lock" filled />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">プライバシー重視の設計</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  会話ログやスクリーンショットはサーバーに保存されません。
                  保存されるのはAI生成のプロファイル要約とスコアのみです。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function ThemeOption({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-lg ${
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <MaterialIcon name={icon} />
        </div>
        <div>
          <div className="font-medium text-foreground">{label}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
      {selected && (
        <MaterialIcon name="check_circle" filled className="text-primary" />
      )}
    </button>
  );
}

function LinkItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <MaterialIcon name={icon} />
        </div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <MaterialIcon name="chevron_right" className="text-muted-foreground" />
    </Link>
  );
}

function EmojiOption({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-lg ${
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          <MaterialIcon name={icon} />
        </div>
        <div>
          <div className="font-medium text-foreground">{label}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
      {selected && (
        <MaterialIcon name="check_circle" filled className="text-primary" />
      )}
    </button>
  );
}
