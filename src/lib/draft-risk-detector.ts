/**
 * 下書きの事故パターンを軽量regexで検出する
 * 検出結果の tag は KB の risk_tags 語彙と一致させ、
 * そのまま searchRuleCards の riskTags に渡せる
 */

export interface DraftRisk {
  tag: string;       // KB risk_tags と同じ語彙
  label: string;     // 日本語ラベル
  matched: string;   // マッチした部分文字列（or 説明）
}

interface RiskPattern {
  tag: string;
  label: string;
  pattern: RegExp;
}

const RISK_PATTERNS: RiskPattern[] = [
  {
    tag: '追いLINE',
    label: '追撃',
    pattern: /返事まだ|既読スルー|既読無視|なんで返して|おーい|無視しないで|返信ないけど|返事くれない|スルーされ/,
  },
  {
    tag: '詰問',
    label: '詰問',
    pattern: /なんで[？?]|どうして[？?]|なぜ[？?]|普通は[そそ]|普通さ[あぁ]/,
  },
  {
    tag: '決めつけ',
    label: '決めつけ',
    pattern: /に決まってる|に違いない|絶対.{0,4}だ[よね。！!]|どうせ/,
  },
  {
    tag: '懇願過多',
    label: '重い確認',
    pattern: /お願いだから|頼むから|[最ラ][後ス][のト]チャンス|一回だけ|諦めるから/,
  },
  {
    tag: '期限要求',
    label: '試し行動',
    pattern: /いつまでに|[0-9０-９]+時まで|期限|今日中に|明日まで/,
  },
];

const LONG_TEXT_THRESHOLD = 200;

/**
 * 下書きのリスクパターンを検出する
 * 各カテゴリで最初にマッチした1つのみ返す（重複排除）
 */
export function detectDraftRisks(draft: string): DraftRisk[] {
  const risks: DraftRisk[] = [];

  for (const { tag, label, pattern } of RISK_PATTERNS) {
    const match = draft.match(pattern);
    if (match) {
      risks.push({ tag, label, matched: match[0] });
    }
  }

  // 長文チェック（文字数閾値）
  if (draft.length > LONG_TEXT_THRESHOLD) {
    risks.push({
      tag: '長文',
      label: '長文',
      matched: `${draft.length}文字（${LONG_TEXT_THRESHOLD}文字超）`,
    });
  }

  return risks;
}
