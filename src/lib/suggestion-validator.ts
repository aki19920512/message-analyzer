import type { Suggestion, Decode } from '@/types/analysis';

// NGフレーズリスト
const NG_PHRASES = [
  // ビジネス敬語定型
  'させていただ',
  'お忙しいところ恐縮',
  '恐れ入りますが',
  'ご査収',
  'ご確認いただけますと幸いです',
  // 説教調
  'べきです',
  'すべきでは',
  'しなければなりません',
  'しなさい',
  // 過剰タメ口（初期関係向け）
  'マジで',
  'ヤバい',
  'ヤバ',
  'ウケる',
  'ワロタ',
  '草',
];

// 絵文字過多の判定（5個以上は過多とみなす）
const MAX_EMOJI_COUNT = 4;

/**
 * suggestionsの品質を検証する
 * @param suggestions 改善案の配列
 * @returns valid: 全て問題なし, issues: 検出された問題のリスト
 */
export function validateSuggestions(suggestions: Suggestion[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  for (const suggestion of suggestions) {
    const text = suggestion.text;

    // NGフレーズ検出
    for (const phrase of NG_PHRASES) {
      if (text.includes(phrase)) {
        issues.push(`NG phrase: ${phrase}`);
      }
    }

    // 絵文字過多チェック
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojiMatches = text.match(emojiRegex);
    if (emojiMatches && emojiMatches.length > MAX_EMOJI_COUNT) {
      issues.push(`Too many emojis: ${emojiMatches.length}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Decodeの品質を検証する
 * @param decode Decodeオブジェクト（optional）
 * @returns valid: 問題なし, issues: 検出された問題のリスト
 */
export function validateDecode(decode: Decode | undefined): {
  valid: boolean;
  issues: string[];
} {
  if (!decode) return { valid: true, issues: [] };

  const issues: string[] = [];
  const text = `${decode.headline} ${decode.why} ${decode.avoid} ${decode.next}`;

  for (const phrase of NG_PHRASES) {
    if (text.includes(phrase)) {
      issues.push(`Decode NG phrase: ${phrase}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
