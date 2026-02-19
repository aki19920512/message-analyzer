# MessageCoach - 技術ドキュメント

別のAIが開発を引き継ぐための技術ドキュメントです。

---

## 1. サービス概要

**MessageCoach**は、LINEやマッチングアプリで送信前のメッセージを添削するWebアプリ。

### ターゲットユーザー

- マッチングアプリ利用者（Pairs, Tinder, with等）
- 恋愛相談をしたい学生
- ホスト/ホステス（顧客対応）
- ITリテラシーが低めの層（スマホメイン）

### コア価値

> 「送信前に第三者目線で添削」
> → 圧が強すぎないか、温度感があってるかをAIがチェック

### 解決する課題

1. **「送ってから後悔」を防ぐ** - 圧が強い、重い、空気読めてないメッセージを事前検知
2. **コミュニケーションの言語化** - なぜダメなのかを具体的に説明
3. **改善案の提示** - 3パターン（丁寧/カジュアル/ユーモア）から選べる

---

## 2. 機能一覧と設計意図

### 2.1 ゲスト添削（Guest Mode）

**ファイル:**
- `src/lib/validation.ts`
- `src/lib/prompts.ts`

**意図:**
- 初回ハードルを下げる（登録不要で試せる）
- 「何を貼るの？」で離脱させない

**実装:**
```typescript
// validation.ts - partnerProfileText を任意に
partnerProfileText: z.string().max(2000).default('')

// prompts.ts - 空プロファイル時の分岐
const profileSection = profileText.trim()
  ? `## 相手のプロファイル\n${profileText}`
  : `## 相手のプロファイル\n※プロファイル情報なし。直近の会話ログのみから推測してください。`;
```

### 2.2 相手プロファイル

**ファイル:**
- `src/app/api/profile/route.ts`
- `src/components/analyze/ProfileForm.tsx`

**意図:**
- 毎回全文ログを貼らせない（摩擦削減）
- AIが相手の特性を事前分析

**実装:**
- 会話ログ全文（最大20,000文字）→ GPT-4oで構造化プロファイル生成
- プロファイル構造: `pace`, `style`, `boundaries`, `progress`, `notes[]`
- localStorage保存（サーバー保存なし＝プライバシー重視）

### 2.3 直近ログ添削

**ファイル:**
- `src/components/analyze/AnalyzeFormV2.tsx`
- `src/app/api/analyze/route.ts`

**意図:**
- 10〜30通だけで添削可能
- 全文不要 → 入力摩擦を最小化

**実装:**
- プロファイル（保存済み）+ 直近ログ（都度入力）+ 送信予定文
- V2形式を優先、V1（全文ログ）にフォールバック

### 2.4 OCR（スクショ読取）

**ファイル:**
- `src/app/api/ocr/route.ts`
- `src/components/analyze/OcrUploader.tsx`

**意図:**
- テキストコピーできないアプリ対応（Tinder, Bumble等）
- スクショをドロップ → テキスト抽出

**実装:**
- GPT-4o-mini Vision API
- Base64エンコードで送信
- 最大3枚、1枚5MB
- 画像は保存しない（プライバシー）

### 2.5 KB統合（ナレッジベース）

**ファイル:**
- `src/lib/kb/load.server.ts` - JSONL読み込み（server-only）
- `src/lib/kb/search.ts` - タグベース検索
- `data/rule_cards.jsonl` - ルールカード定義

**意図:**
- ドメイン知識（コミュニケーションルール）を外部ファイル化
- プロンプト肥大化を避ける
- 将来的な拡張性

**実装:**
```jsonl
{"id":"rc-001","anti_pattern":"連続質問","goal_tags":["invite"],"why_risky":"圧を感じる","rewrite_policy":"質問は1つに絞る","good_examples":[{"label":"丁寧","text":"..."}]}
```

- タグベース検索（goal, scene, risk）
- スコアリングして上位N件をプロンプトに注入
- server-onlyで読み込み（クライアントに漏らさない）

### 2.6 スコア評価

**意図:**
- 数値で「圧が強すぎ」「温度感ズレ」を可視化
- 視覚的フィードバック（進捗バー、色分け）

**スコア定義:**

| スコア | 意味 | 評価方向 |
|--------|------|----------|
| warmthMatch | 温度感の一致 | 高いほど良い (0-100) |
| pressureRisk | 圧力リスク | **低いほど良い（反転）** (0-100) |
| sincerity | 誠実さ | 高いほど良い (0-100) |
| clarity | 明確さ | 高いほど良い (0-100) |
| styleMatch | スタイル適合 | 高いほど良い (0-100) |

**注意:** `pressureRisk` のみ反転評価（低いほど良い）

### 2.7 改善提案3パターン

**意図:**
- 「丁寧/カジュアル/ユーモア」の3案
- ユーザーが自分のスタイルで選べる

---

## 3. アーキテクチャ

### ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   # メイン添削API
│   │   ├── profile/route.ts   # プロファイル生成API
│   │   ├── ocr/route.ts       # OCR API
│   │   └── kb/search/route.ts # KB検索API（デバッグ用）
│   ├── partners/page.tsx      # 相手一覧ページ
│   ├── submit/page.tsx        # 添削フォームページ
│   ├── guide/page.tsx         # 使い方ガイド
│   ├── privacy/page.tsx       # プライバシーポリシー
│   ├── terms/page.tsx         # 利用規約
│   └── layout.tsx             # ルートレイアウト
├── components/
│   ├── analyze/               # 添削関連コンポーネント
│   │   ├── AnalyzeFormV2.tsx  # メイン添削フォーム
│   │   ├── ProfileForm.tsx    # プロファイル作成フォーム
│   │   ├── ResultsDisplay.tsx # 結果表示
│   │   ├── OcrUploader.tsx    # OCRアップローダー
│   │   ├── ScoreGrid.tsx      # スコア表示グリッド
│   │   ├── SuggestionItem.tsx # 改善提案アイテム
│   │   └── RuleCardItem.tsx   # KB参照ルール表示
│   ├── partners/              # パートナー管理コンポーネント
│   │   ├── PartnerCard.tsx    # 相手カード
│   │   ├── PartnerList.tsx    # 相手一覧
│   │   ├── ActionCard.tsx     # アクションカード（CTA）
│   │   └── EmptyState.tsx     # 空状態
│   ├── layout/                # レイアウトコンポーネント
│   │   ├── AppShell.tsx       # アプリシェル
│   │   ├── Header.tsx         # ヘッダー
│   │   └── Footer.tsx         # フッター
│   └── ui/                    # shadcn/uiコンポーネント
├── lib/
│   ├── kb/                    # ナレッジベース
│   │   ├── load.server.ts     # JSONL読み込み（server-only）
│   │   └── search.ts          # タグベース検索
│   ├── prompts.ts             # システムプロンプト定義
│   ├── validation.ts          # Zodスキーマ
│   ├── storage.ts             # localStorage操作
│   ├── openai.ts              # OpenAIクライアント
│   └── utils.ts               # ユーティリティ
├── hooks/
│   └── usePartners.ts         # パートナー管理hook
├── types/
│   └── analysis.ts            # 型定義
└── data/
    └── rule_cards.jsonl       # KBルールカード
```

### データフロー

```
[ユーザー入力]
    ↓
[Zodバリデーション] (validation.ts)
    ↓
[KB検索] (kb/search.ts) → ルールカード取得
    ↓
[プロンプト構築] (prompts.ts) + KBコンテキスト注入
    ↓
[OpenAI API] (gpt-4o, JSON Schema強制)
    ↓
[レスポンス検証] (Zod)
    ↓
[フロントエンド表示] + スコア保存(localStorage)
```

### API エンドポイント

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/api/analyze` | POST | メッセージ添削 |
| `/api/profile` | POST | プロファイル生成 |
| `/api/ocr` | POST | スクショ読取 |
| `/api/kb/search` | POST | KB検索（デバッグ用） |

---

## 4. 技術スタック

| カテゴリ | 技術 | 選定理由 |
|----------|------|----------|
| フレームワーク | Next.js 16 (App Router) | サーバーコンポーネント、API Routes統合 |
| 言語 | TypeScript | 型安全性、IDE補完 |
| スタイル | Tailwind CSS 4 | 高速開発、モバイルファースト |
| UIライブラリ | shadcn/ui | アクセシビリティ、カスタマイズ性 |
| フォーム | React Hook Form + Zod | バリデーション統合、型安全 |
| AI | OpenAI gpt-4o | JSON Schema出力、高品質 |
| OCR | OpenAI gpt-4o-mini | Vision API、コスト効率 |
| ストレージ | localStorage | サーバーレス、プライバシー重視 |

---

## 5. 重要な設計判断

### A. localStorage採用の理由

**決定:** サーバーDBではなくlocalStorageを使用

**理由:**
- **プライバシー**: 会話ログをサーバーに送らない
- **コスト**: DB不要でインフラ費ゼロ
- **シンプル**: 認証・セッション管理不要

**制約:**
- ブラウザ変更で消える（許容範囲）
- 容量制限あり（5MB程度）

### B. ゲスト添削の追加

**背景:** 初期版は「まず相手登録」が必須だった

**課題:**
- 「何を貼るの？」で離脱
- 登録がハードル

**解決:**
- `partnerProfileText` を任意に
- 未登録でも添削可能
- 結果後に「この相手を保存する」導線

### C. KB外部化

**背景:** プロンプトにルール詰め込むと肥大化

**課題:**
- トークン消費増加
- プロンプト編集が困難

**解決:**
- JSONL外部ファイル + タグ検索
- 関連ルールのみ動的注入

**利点:**
- ルール追加・編集が容易
- トークン効率向上

---

## 6. 今後の拡張ポイント

| 優先度 | 機能 | 概要 |
|--------|------|------|
| P1 | 認証追加 | Clerk/NextAuth でマルチデバイス同期 |
| P1 | DB移行 | Supabase/PlanetScale でデータ永続化 |
| P2 | KB拡充 | より多くのシナリオルール追加 |
| P2 | 分析ダッシュボード | 時系列スコア推移 |
| P3 | 多言語対応 | 英語/中国語サポート |
| P3 | PWA化 | オフライン対応、ホーム追加 |

---

## 7. 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番起動
npm start

# 型チェック
npx tsc --noEmit

# Lint
npm run lint
```

---

## 8. 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `OPENAI_API_KEY` | ✅ | OpenAI APIキー |

`.env.local` に設定：
```
OPENAI_API_KEY=sk-xxxxx
```

---

## 9. トラブルシューティング

| 問題 | 原因 | 対処 |
|------|------|------|
| `insufficient_quota` | API残高不足 | OpenAI請求設定確認 |
| `401 Unauthorized` | APIキー無効 | `.env.local`確認 |
| `rate_limit_exceeded` | リクエスト過多 | 待機して再試行 |
| KB読み込みエラー | JSONL構文エラー | 壊れた行を修正 |
| ビルド失敗 | 型エラー | `npx tsc --noEmit`で確認 |

---

## 10. コード規約

### ファイル命名

- コンポーネント: `PascalCase.tsx`
- ユーティリティ: `camelCase.ts`
- API: `route.ts`（Next.js規約）

### コンポーネント構造

```typescript
'use client'; // クライアントコンポーネントの場合

import { ... } from 'react';
import { ... } from '@/components/ui/...';
import type { ... } from '@/types/analysis';

interface Props {
  // ...
}

export function ComponentName({ ... }: Props) {
  // ...
}
```

### 型定義

- `src/types/analysis.ts` に集約
- Zodスキーマから型推論（`z.infer<typeof schema>`）

---

## 11. セキュリティ考慮

### 実装済み

- **server-only**: KBファイル読み込みをサーバー限定
- **入力検証**: Zodで全入力をバリデーション
- **プライバシー**: 会話ログ・画像を保存しない
- **エラーメッセージ**: 詳細をクライアントに漏らさない

### 未実装（今後検討）

- レート制限（IP/セッションベース）
- CSRFトークン
- 認証・認可
