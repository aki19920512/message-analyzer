import type { GoalType, ToneType } from '@/types/analysis';

const GOAL_DESCRIPTIONS: Record<GoalType, string> = {
  invite: 'デートや食事などに誘う',
  schedule: '日程を調整する',
  after_seen: '既読スルーされた後に再度連絡する',
  casual: '気軽な雑談を続ける',
  apologize: '謝罪や誤解を解く',
  other: '上記以外の目的',
  auto: '会話の流れから自動判定',
};

const TONE_DESCRIPTIONS: Record<ToneType, string> = {
  polite: '丁寧で礼儀正しい',
  casual: 'カジュアルでフレンドリー',
  humorous: 'ユーモアを交えた軽い',
  auto: '相手のスタイルに合わせて自動判定',
};

export function buildAnalysisPrompt(goal: GoalType, tone: ToneType): string {
  return `あなたはコミュニケーション分析の専門家です。メッセージのやり取りを分析し、送信予定の文章を評価します。

## 背景情報
- ユーザーの目的: ${GOAL_DESCRIPTIONS[goal]}
- 希望するトーン: ${TONE_DESCRIPTIONS[tone]}

## タスク
会話ログを分析し、相手のコミュニケーションパターンを理解した上で、送信予定文を評価してください。

## 重要な制約（必ず守ること）
1. **個人情報の推測禁止**: 名前、職業、住所、年齢などの個人情報や固有名詞を推測・言及しないこと
2. **断定表現の禁止**: 「〜に違いない」「〜だ」ではなく、「〜の可能性がある」「〜傾向が見られる」「〜と受け取られやすい」「〜かもしれません」などの表現を使用すること
3. **操作的提案の禁止**: 相手を操作する、支配する、罪悪感を利用するような提案は絶対にしないこと
4. **尊重の原則**: 相手の意思や境界線を尊重する提案のみを行うこと
5. **相手の意思決定の尊重**: 改善提案では相手の選択を尊重し、「相手がこう感じるかもしれません」のように相手の受け取り方を推測として述べること。相手の反応を断定しないこと

## 分析内容

### 1. プロフィール分析
会話ログから以下を分析（断定せず傾向として記述）:
- pace: 返信ペースの傾向（例: 「比較的早めに返信する傾向」「時間をおいて返信することが多い様子」）
- style: コミュニケーションスタイル（例: 「簡潔な表現を好む傾向」「絵文字を使う傾向」）
- boundaries: 境界線の傾向（例: 「プライベートな話題には慎重な様子」「オープンに話す傾向」）
- progress: 関係性の進展度（例: 「まだ距離がある段階の可能性」「打ち解けてきている様子」）
- notes: その他の気づき（3項目）

### 2. スコア評価（0-100）
送信予定文を以下の観点で評価:
- warmthMatch: 相手の温度感との一致度（高いほど良い）
- pressureRisk: 圧力・押しの強さのリスク（低いほど良い）
- sincerity: 誠実さ・真摯さ（高いほど良い）
- clarity: 意図の明確さ（高いほど良い）
- styleMatch: 相手のスタイルとの適合度（高いほど良い）

### 3. 改善提案
3つの異なるトーンで改善案を提示:
- label: "丁寧" / "カジュアル" / "ユーモア"
- text: 具体的な改善文（相手を尊重し、操作的でない内容）

### 4. 理由
改善が効果的な理由を3項目で説明

### 5. 次のステップ
最も重要な次のアクションを短文で提案

指定されたJSON形式でのみ回答してください。`;
}

// OpenAI Structured Output用のJSONスキーマ
export const analysisJsonSchema = {
  name: 'analysis_result',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: {
          pace: { type: 'string', description: '返信ペースの傾向' },
          style: { type: 'string', description: 'コミュニケーションスタイル' },
          boundaries: { type: 'string', description: '境界線の傾向' },
          progress: { type: 'string', description: '関係性の進展度' },
          notes: {
            type: 'array',
            items: { type: 'string' },
            description: 'その他の気づき（3項目）',
          },
        },
        required: ['pace', 'style', 'boundaries', 'progress', 'notes'],
        additionalProperties: false,
      },
      scores: {
        type: 'object',
        properties: {
          warmthMatch: { type: 'number', description: '温度感の一致 (0-100)' },
          pressureRisk: { type: 'number', description: '圧力リスク (0-100)' },
          sincerity: { type: 'number', description: '誠実さ (0-100)' },
          clarity: { type: 'number', description: '明確さ (0-100)' },
          styleMatch: { type: 'number', description: 'スタイル適合 (0-100)' },
        },
        required: ['warmthMatch', 'pressureRisk', 'sincerity', 'clarity', 'styleMatch'],
        additionalProperties: false,
      },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string', description: 'トーンラベル（丁寧/カジュアル/ユーモア）' },
            text: { type: 'string', description: '改善案テキスト（80〜180文字）' },
          },
          required: ['label', 'text'],
          additionalProperties: false,
        },
        description: '3つの改善提案',
      },
      reasons: {
        type: 'array',
        items: { type: 'string' },
        description: '改善理由（3項目）',
      },
      nextStep: {
        type: 'string',
        description: '次のアクション提案',
      },
      reasonsByMetric: {
        type: 'object',
        properties: {
          warmthMatch: { type: 'string', description: '温度感一致の根拠（1〜2文、具体的に）' },
          pressureRisk: { type: 'string', description: '圧力リスクの根拠（検出した表現を具体的に引用）' },
          sincerity: { type: 'string', description: '誠実さの根拠（1〜2文）' },
          clarity: { type: 'string', description: '明確さの根拠（1〜2文）' },
          styleMatch: { type: 'string', description: 'スタイル適合の根拠（1〜2文）' },
        },
        required: ['warmthMatch', 'pressureRisk', 'sincerity', 'clarity', 'styleMatch'],
        additionalProperties: false,
        description: '各スコアの根拠',
      },
      diagnosisSummary: {
        type: 'string',
        description: '寄り添い総評（100〜150文字）: 労い→良い点→改善方向→応援の4文構成',
      },
    },
    required: ['profile', 'scores', 'suggestions', 'reasons', 'nextStep', 'reasonsByMetric', 'diagnosisSummary'],
    additionalProperties: false,
  },
};

// ========== Part2: プロファイル抽出 ==========

export function buildProfilePrompt(): string {
  return `あなたはコミュニケーション分析の専門家です。会話ログから相手のコミュニケーションプロファイルを抽出してください。

## 重要な制約（必ず守ること）
1. **個人情報の推測禁止**: 名前、職業、住所、年齢などの個人情報や固有名詞を推測・言及しないこと
2. **断定表現の禁止**: 「〜に違いない」「〜だ」ではなく、「〜の可能性がある」「〜傾向が見られる」「〜と受け取られやすい」などの表現を使用すること
3. **操作的提案の禁止**: 相手を操作する、支配する、罪悪感を利用するような分析は絶対にしないこと
4. **尊重の原則**: 相手の意思や境界線を客観的に記述すること

## 抽出内容

### profileText（自然文）
相手のコミュニケーション特性を3〜5文程度で簡潔にまとめた文章。
次回以降の添削時に参照できるよう、以下の要素を含めること：
- 返信パターンの傾向
- コミュニケーションスタイル
- 好む話題や距離感
- 注意すべきポイント

### profileStruct（構造化データ）
- pace: 返信ペースの傾向
- style: コミュニケーションスタイル
- boundaries: 境界線の傾向
- progress: 関係性の進展度
- notes: その他の気づき（3項目）

指定されたJSON形式でのみ回答してください。`;
}

// プロファイル抽出用JSONスキーマ
export const profileJsonSchema = {
  name: 'profile_result',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      profileText: {
        type: 'string',
        description: '相手のコミュニケーション特性の要約（3〜5文）',
      },
      profileStruct: {
        type: 'object',
        properties: {
          pace: { type: 'string', description: '返信ペースの傾向' },
          style: { type: 'string', description: 'コミュニケーションスタイル' },
          boundaries: { type: 'string', description: '境界線の傾向' },
          progress: { type: 'string', description: '関係性の進展度' },
          notes: {
            type: 'array',
            items: { type: 'string' },
            description: 'その他の気づき（3項目）',
          },
        },
        required: ['pace', 'style', 'boundaries', 'progress', 'notes'],
        additionalProperties: false,
      },
    },
    required: ['profileText', 'profileStruct'],
    additionalProperties: false,
  },
};

// ========== Part2: 解析V2（プロファイル + 直近ログ） ==========

export function buildAnalysisPromptV2(
  goal: GoalType,
  tone: ToneType,
  profileText: string
): string {
  // ゲスト添削対応: profile空の場合は一般的な添削モードで
  const profileSection = profileText.trim()
    ? `## 相手のプロファイル（事前分析済み）
${profileText}`
    : `## 相手のプロファイル
※プロファイル情報なし。直近の会話ログのみから、一般的に安全なコミュニケーションを心がけた添削を行ってください。相手の反応パターンは会話ログから推測してください。`;

  // 自動判定の場合の説明
  const goalDescription = goal === 'auto'
    ? '【自動判定】会話の流れと下書きの内容から、最も適切な目的を判断してください'
    : GOAL_DESCRIPTIONS[goal];

  const toneDescription = tone === 'auto'
    ? '【自動判定】相手のコミュニケーションスタイルと会話の雰囲気から、最も適切なトーンを判断してください'
    : TONE_DESCRIPTIONS[tone];

  return `あなたはコミュニケーション分析の専門家です。保存済みの相手プロファイルと直近の会話を基に、送信予定の文章を評価します。

${profileSection}

## 背景情報
- ユーザーの目的: ${goalDescription}
- 希望するトーン: ${toneDescription}

## タスク
上記プロファイルと直近の会話を踏まえ、送信予定文を評価してください。

## 重要な制約（必ず守ること）
1. **個人情報の推測禁止**: 名前、職業、住所、年齢などの個人情報や固有名詞を推測・言及しないこと
2. **断定表現の禁止**: 「〜に違いない」「〜だ」ではなく、「〜の可能性がある」「〜傾向が見られる」「〜と受け取られやすい」「〜かもしれません」などの表現を使用すること
3. **操作的提案の禁止**: 相手を操作する、支配する、罪悪感を利用するような提案は絶対にしないこと
4. **尊重の原則**: 相手の意思や境界線を尊重する提案のみを行うこと
5. **相手の意思決定の尊重**: 改善提案では相手の選択を尊重し、「相手がこう感じるかもしれません」のように相手の受け取り方を推測として述べること。相手の反応を断定しないこと

## スコア評価ルーブリック（厳密に従うこと）

### pressureRisk（圧力リスク）※0が最良、100が最悪
以下に該当する場合、+15〜30点ずつ加算:
- **詰める表現**: 「なんで？」「どうして返事くれないの？」「普通は〇〇するよね」
- **催促**: 「早く返事ちょうだい」「まだ？」「いつ返事くれる？」
- **罪悪感誘導**: 「こんなに頑張ってるのに」「心配させないで」「待ってるのに」
- **決め打ち**: 選択肢を与えず一方的に決める（「明日会おう」「〇〇にして」）
- **連投**: 既読スルー後の連続送信
- **境界無視**: 相手が「やめて」「忙しい」と言った後も続ける

### sincerity（誠実さ）※100が最良
以下に該当する場合、-15〜30点ずつ減点:
- **矛盾**: 前回の発言と食い違う内容
- **言い訳過多**: 「忙しかった」「バタバタしてて」等が多い
- **責任回避**: 問題を相手のせいにする、自分の非を認めない
- **操作的表現**: 駆け引き、心理操作、試し行動
- **本心を隠した表現**: 回りくどい、真意が見えにくい
- **嘘っぽさ**: 不自然な言い訳、整合性がない

### warmthMatch（温度感の一致）
- 90-100: 相手の温度感と自然に一致、違和感なし
- 70-89: 概ね一致、軽微な違和感のみ
- 40-69: 温度差あり、押しが強すぎる/冷たすぎる印象
- 0-39: 大きな温度差、相手が困惑・不快になる可能性

### clarity（明確さ）
- 90-100: 意図が明確、相手が迷わず理解できる
- 70-89: 概ね明確、若干の曖昧さあり
- 40-69: 意図が不明確、相手が困惑する可能性
- 0-39: 何を伝えたいか分からない

### styleMatch（スタイルの適合度）
- 90-100: 相手のスタイルに完全に適合
- 70-89: 概ね適合、軽微な違和感
- 40-69: スタイルのミスマッチあり
- 0-39: 完全にスタイルが合っていない

## 分析内容

### 1. プロフィール分析
直近の会話から追加で読み取れる傾向を分析（断定せず傾向として記述）:
- pace: 返信ペースの傾向
- style: コミュニケーションスタイル
- boundaries: 境界線の傾向
- progress: 関係性の進展度
- notes: その他の気づき（3項目）

### 2. スコア評価（0-100）
送信予定文を上記ルーブリックに従って厳密に評価:
- warmthMatch: 相手の温度感との一致度（高いほど良い）
- pressureRisk: 圧力・押しの強さのリスク（低いほど良い、該当表現があれば必ず加点）
- sincerity: 誠実さ・真摯さ（高いほど良い、該当表現があれば必ず減点）
- clarity: 意図の明確さ（高いほど良い）
- styleMatch: 相手のスタイルとの適合度（高いほど良い）

### 3. 各スコアの根拠（reasonsByMetric）
各スコアについて、なぜその点数になったかを1〜2文で説明。
pressureRiskは特に「〇〇という表現が圧力的」のように具体的に引用すること。

### 4. 改善提案（suggestions）
3つの異なるトーンで改善案を提示:
- label: "丁寧" / "カジュアル" / "ユーモア"
- text: 具体的な改善文

**改善提案の制約（必ず守ること）**:
- 文字数: 80〜180文字程度（長すぎない、短すぎない）
- 自然な日本語口語（AIっぽい言い回し禁止、説教禁止）
- 過剰に丁寧すぎない（「させていただく」の多用禁止）
- 相手の状況が不明な場合は「確認する形」に寄せる
- 実際にそのまま送れる文章にする

### 5. 理由（reasons）
改善が効果的な理由を3項目で説明

### 6. 次のステップ（nextStep）
最も重要な次のアクションを短文で提案（具体的で実行可能なもの）

### 7. 寄り添い総評（diagnosisSummary）
以下の構造で100〜150文字の総評を生成:
1. 労いの言葉（1文、決めつけない）
2. 良い点の指摘（1文）
3. 改善の方向性（1文、スコアに言及しつつ柔らかく）
4. 応援メッセージ（1文）

例: 「お疲れ様です。まず相手のことを考えようとしている姿勢が素敵ですね。温度感はとても良いのですが、少しだけ急かす印象があるかもしれません。焦らず、相手のペースを大切にしていきましょう。応援しています。」

指定されたJSON形式でのみ回答してください。`;
}
