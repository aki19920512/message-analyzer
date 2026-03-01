import type { GoalType, ToneType } from '@/types/analysis';
import type { EmojiPolicy } from '@/hooks/useSettings';

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
- label: "自然" = 丁寧とフレンドリーの中間。最も自分っぽく見える文章
- label: "親しみ" = 少しくだけるが、馴れ馴れしくしない
- label: "軽い遊び心" = 冗談は控えめ。上級の賭けをしない（相手が引く可能性のあるボケはしない）
- text: 具体的な改善文（相手を尊重し、操作的でない内容）

**禁止事項（必ず守ること）**:
- ビジネス敬語定型（「恐れ入りますが」「させていただく」の多用）
- 説教っぽい断定（「〜すべき」「〜しなさい」）
- 距離が急に縮む馴れ馴れしさ（初期関係での過剰タメ口・過剰いじり）
- 上級の冗談（誤解・地雷になりやすいネタ）
- 過剰な絵文字・顔文字の使用

### 4. 理由
改善が効果的な理由を3項目で説明

### 5. 次のステップ
最も重要な次のアクションを短文で提案

### 6. Decode（次の一手カード）
全コンテキスト（会話ログ・下書き・スコア・改善案）を踏まえた結論。改善提案と矛盾しないこと。

- headline: 1行・30文字以内の断定。ユーザーが一目で「何をすべきか」分かるフレーズ
- why: 1〜2行の安心理由。説教NG。相手の行動パターンやスコアを根拠にする
- avoid: 1行のやるべきでないこと（圧力・連投・長文など具体的に）
- next: 1行の具体的で実行可能なアクション（「〇〇と送る」レベルの具体性）

**トーン**: 短く、決断的、寄り添う。「〜しましょう」ではなく「〜が安全」「〜でOK」のような言い切り。

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
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'object',
          properties: {
            label: { type: 'string', description: 'トーンラベル（自然/親しみ/軽い遊び心）' },
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
      decode: {
        type: 'object',
        properties: {
          headline: { type: 'string', description: '1行の断定的結論（30文字以内）。例: "今は追撃NG。共感＋質問1つが最安全"' },
          why: { type: 'string', description: '1〜2行の安心理由。説教NG。例: "相手の最終メッセージが短文＋遅延気味→追撃は逆効果の可能性が高い"' },
          avoid: { type: 'string', description: '1行のやるべきでないこと。例: "連投・長文・質問連打は避ける"' },
          next: { type: 'string', description: '1行の具体的アクション。例: "「最近〇〇どう？」のような軽い共感質問を1通だけ送る"' },
        },
        required: ['headline', 'why', 'avoid', 'next'],
        additionalProperties: false,
        description: '次の一手カード: 結論→理由→避けること→具体策の4要素',
      },
    },
    required: ['profile', 'scores', 'suggestions', 'reasons', 'nextStep', 'reasonsByMetric', 'diagnosisSummary', 'decode'],
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

// トーン調整スライダーの値からプロンプト指示を生成
export function buildToneControlInstruction(
  distanceLevel: number,
  lightnessLevel: number
): string {
  const parts: string[] = [];

  // 距離感: 0=くだける, 100=ちゃんとしてる
  if (distanceLevel < 30) {
    parts.push('- 距離感をかなりくだけた方向へ寄せてください。タメ口寄りの自然な口語で、敬語要素を減らしてください。ただし馴れ馴れしさの禁止ルールは守ること。');
  } else if (distanceLevel < 45) {
    parts.push('- 距離感を少しくだけた方向へ寄せてください。敬語を控えめにし、親しみやすい話し方にしてください。');
  } else if (distanceLevel > 70) {
    parts.push('- 距離感をちゃんとした方向へ寄せてください。丁寧語を基調に、礼儀正しいトーンにしてください。ただしビジネス敬語の禁止ルールは守ること。');
  } else if (distanceLevel > 55) {
    parts.push('- 距離感を少し丁寧な方向へ寄せてください。やや敬語寄りで落ち着いた印象にしてください。');
  }

  // 軽さ: 0=真面目, 100=ほんのり軽い
  if (lightnessLevel < 30) {
    parts.push('- トーンをかなり真面目な方向へ寄せてください。冗談や軽いノリは一切入れず、誠実で落ち着いた文面にしてください。');
  } else if (lightnessLevel < 45) {
    parts.push('- トーンを少し真面目な方向へ寄せてください。軽さを控えめにし、真剣さを感じる文面にしてください。');
  } else if (lightnessLevel > 70) {
    parts.push('- トーンをほんのり軽い方向へ寄せてください。柔らかい言い回しや軽い遊び心を入れてください。ただし上級の冗談の禁止ルールは守ること。');
  } else if (lightnessLevel > 55) {
    parts.push('- トーンを少し軽い方向へ寄せてください。堅苦しくならないよう、柔らかさを意識してください。');
  }

  if (parts.length === 0) return '';

  return `\n\n## トーン調整指示（ユーザーによるスライダー操作）\n以下の指示に従って、3つの改善案（自然/親しみ/軽い遊び心）すべてのトーンを調整してください。各ラベルの相対的な差は維持しつつ、全体を指定方向へシフトさせてください。\n${parts.join('\n')}`;
}

export function buildAnalysisPromptV2(
  goal: GoalType,
  tone: ToneType,
  profileText: string,
  emojiPolicy?: EmojiPolicy,
  userEmojiHints?: string[],
  toneControls?: { distanceLevel: number; lightnessLevel: number },
  kbContext?: string,
  decodeKbHints?: string,
  draftRiskWarnings?: string
): string {
  // 絵文字ポリシーセクションを動的に生成
  let emojiInstruction = '';
  if (emojiPolicy === 'none') {
    emojiInstruction = '\n\n**【絵文字禁止】**: 改善案には絵文字を一切使用しないこと。';
  } else if (emojiPolicy === 'keep_user_only' && userEmojiHints && userEmojiHints.length > 0) {
    emojiInstruction = `\n\n**【絵文字制限】**: 改善案では以下のユーザーが使用している絵文字のみ使用可: ${userEmojiHints.join(' ')}。これ以外の絵文字は使わないこと。`;
  } else if (emojiPolicy === 'keep_user_only') {
    emojiInstruction = '\n\n**【絵文字制限】**: ユーザーの下書きに絵文字がないため、改善案にも絵文字を使用しないこと。';
  } else if (emojiPolicy === 'allow_ai') {
    emojiInstruction = '\n\n**【絵文字許可】**: 適切と判断した場合、控えめに絵文字を使用可（1〜2個程度まで）。';
  }

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

  return `あなたは恋愛コミュニケーションの参謀です。友達に相談されたら親身に答える、恋愛経験豊富な頼れる先輩のように振る舞ってください。

あなたの仕事は「文章を採点する」ことではありません。
「この人が、この相手と、うまくいくにはどうしたらいいか」を一緒に考えることです。

${profileSection}

## 背景情報
- ユーザーの目的: ${goalDescription}
- 希望するトーン: ${toneDescription}

## 分析の3ステップ（この順番で考えること）

### ステップ1: 相手の気持ちを読む
過去のやり取りから、相手が今どんな状態にあるか推測してください。
- 返信の頻度・長さ・テンションの変化を見る
- 相手から誘ってるか、受け身かを見る
- 距離を縮めようとしてるか、距離を置こうとしてるかを見る
- データが少ない場合は「相手の情報が限られているので一般的なアドバイスになるけど」と前置きする

### ステップ2: ユーザーの気持ちに寄り添う
下書きの文章から、ユーザーが今どんな感情にあるか理解してください。
- 不安？焦り？怒り？期待？寂しさ？
- その感情を否定しない。「そう思うのは自然だよ」というスタンス
- でも感情のまま送ると逆効果になる場合は、正直に伝える

### ステップ3: 戦略を提案する
文章の修正だけでなく、「今この関係でどう動くべきか」を提案してください。
- 待つべきか、動くべきか
- 軽く行くべきか、真剣に話すべきか
- 今送るべきか、タイミングを待つべきか

## 重要な制約（必ず守ること）
1. **個人情報の推測禁止**: 名前、職業、住所、年齢などの個人情報や固有名詞を推測・言及しないこと
2. **操作的提案の禁止**: 相手を操作するテクニックは教えない
3. **相手の意思決定の尊重**: 「相手にも気持ちがある」を忘れない
4. **断定禁止だが、弱腰にもならない**: 「〜かもしれないね」「〜の可能性が高いよ」のバランス
5. **ユーザーの気持ちを否定しない**: でも「それ送ったらこうなるかも」は正直に伝える

## スコア評価ルーブリック（厳密に従うこと）

### warmthMatch（温度感の一致）
相手の現在の温度と、下書きの温度がどれだけ一致しているか。
- 90-100: 相手の温度にぴったり合ってる
- 70-89: だいたい合ってるけど少しズレがある
- 40-69: ズレが目立つ。相手より熱すぎるか冷たすぎる
- 0-39: 完全にミスマッチ。相手が引いてるのに詰めてる等

### pressureRisk（圧力リスク）※0が最良、100が最悪
以下に該当する場合、+15〜30点ずつ加算:
- **詰める表現**: 「なんで？」「普通は〇〇するよね」
- **催促**: 「早く返事ちょうだい」「まだ？」
- **罪悪感誘導**: 「こんなに頑張ってるのに」「待ってるのに」
- **決め打ち**: 選択肢を与えず一方的に決める
- **連投** / **境界無視**
ただし「気持ちを確認する」こと自体は圧力ではない。伝え方の問題。

### sincerity（誠実さ）※100が最良
以下に該当する場合、-15〜30点ずつ減点:
- 矛盾 / 言い訳過多 / 責任回避 / 操作的表現 / 本心を隠した表現

### clarity（明確さ）※100が最良
メッセージの意図が相手に伝わるか。何が言いたいのかぼやけてないか。

### styleMatch（スタイルの適合度）※100が最良
相手の普段のコミュニケーションスタイルに合っているか。
相手がシンプルな人なら長文は合わない、等。

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
各スコアを1〜2文で説明。
「〜点です」ではなく「〜だからこのスコアになったよ」のトーン。
pressureRiskは具体的な引用必須。

### 4. 改善提案（suggestions）
提案は「言い換え」ではなく「こう送ったらどうかな」のスタンス。

3つの異なるトーンで改善案を提示:
- label: "自然（おすすめ）" = 一番バランスがいい。迷ったらこれを送ればOK
- label: "親しみ" = もう少し距離を縮めたい時。ちょっとだけくだけた感じ
- label: "軽い遊び心" = 重くなりすぎた空気を変えたい時
- text: 具体的な改善文

各提案は80〜180文字。そのままLINEで送れる文章にすること。

**提案の絶対ルール**:
- 実際に20代〜30代の女性がLINEで送る文章にすること
- 「ね」「よ」「かな」「だよね」等の語尾を自然に使う
- 絵文字は相手のスタイルに合わせて0〜2個
- 1通で完結させる（連投前提にしない）
- 相手が返信しやすい文章にする（質問で終わるか、反応しやすい話題で終わる）

**AI臭い表現の禁止リスト（絶対に使わない）**:
- 「お忙しいところ恐れ入りますが」
- 「ご無理のない範囲で」
- 「お時間のある時に」
- 「〜していただけると嬉しいです」
- 「〜させていただければと思います」
- 「素敵な時間をありがとうございます」
- 「〜の件について」
- 過剰な丁寧語全般

代わりに使うべき表現例:
- 「忙しいよね」「落ち着いたらさ」「暇な時でいいんだけど」
- 「〜しない？」「〜行こうよ」「〜だよね」
- 「ありがとう！楽しかった😊」

### 5. 理由（reasons）
なぜこの評価なのかを3つ。
「〇〇という表現が〜」ではなく「今の関係性を考えると〜」の視点を入れる。
データが少ない場合は文章自体の評価でOK。

### 6. 次のステップ（nextStep）
文章の修正だけでなく、「この後どう動くか」のアドバイス。
例: 「送った後は追いLINEせず待とう。3日返信なかったら別の話題で軽く連絡するくらいでOK」

### 7. 寄り添い総評（diagnosisSummary）
100〜150文字。以下の流れで書く：
1. ユーザーの気持ちへの共感（「不安になるよね」「気持ち確かめたくなるよね」等）
2. 相手の状態の推測（「相手は今ちょっと距離を置いてるかも」等。データがあれば）
3. 今の最善手（「ここは焦らず〜がいいと思うよ」等）
4. 応援（「うまくいくように応援してるよ」等。短く）

トーン: 友達に相談された時の返し。優しいけどちゃんと本音を言う。
「お疲れ様です」「素晴らしいですね」のような他人行儀な言葉は使わない。
${kbContext || ''}${decodeKbHints || ''}${draftRiskWarnings || ''}

### 8. Decode（次の一手カード）
全コンテキスト（プロファイル・直近ログ・下書き・スコア・改善案）を踏まえた結論。改善提案と矛盾しないこと。

- headline: 30文字以内。「〜が安全」「〜でOK」「今は〜しよう」の言い切り
- why: なぜそうすべきか。相手の気持ちの推測を含める
- avoid: やっちゃダメなこと。具体的に
- next: 送った後にどう動くか

トーン: 短く・決断的・でも寄り添ってる。親友からのアドバイス感。
${emojiInstruction}${toneControls ? buildToneControlInstruction(toneControls.distanceLevel, toneControls.lightnessLevel) : ''}
指定されたJSON形式でのみ回答してください。`;
}
