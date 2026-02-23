/**
 * KBルールカードの型定義
 * rule_cards.jsonl のスキーマに準拠
 */

export interface GoodExample {
  label: string;
  text: string;
}

export interface RuleCard {
  id: string;
  case_id: string;
  scene_tags: string[];
  goal_tags: string[];
  risk_tags: string[];
  anti_pattern: string;
  why_risky: string;
  rewrite_policy: string;
  good_examples: GoodExample[];
  notes: string[];
  // 新カード向け拡張フィールド（optional）
  tags?: string[];
  when?: string;
  insight?: string;
  decode?: {
    headline: string;
    next: string[];
    avoid: string[];
  };
  templates?: Record<string, string>;
}

export interface ScoredRuleCard {
  card: RuleCard;
  score: number;
  matchedTags: string[];
}

/**
 * フロントエンドに返すルールカード情報
 * （cardの全フィールドではなく必要な情報のみ）
 */
export interface RetrievedRuleCard {
  id: string;
  anti_pattern: string;
  why_risky: string;
  rewrite_policy: string;
  good_examples: GoodExample[];
  matchedTags: string[];
  score: number;
}
