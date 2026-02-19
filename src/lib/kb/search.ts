/**
 * KBルールカードの検索エンジン
 * タグベースのスコアリングと重複排除を行う
 */

import type { RuleCard, ScoredRuleCard, RetrievedRuleCard } from './types';
import { loadRuleCards } from './load.server';

export interface SearchParams {
  riskTags?: string[];
  goalTags?: string[];
  sceneTags?: string[];
}

/**
 * スコアリング重み付け
 * - risk_tags: 最も重要（リスク回避に直結）
 * - goal_tags: 重要（目的に関連）
 * - scene_tags: 参考情報
 */
const WEIGHTS = {
  risk: 3,
  goal: 2,
  scene: 1,
};

/**
 * ルールカードを検索し、スコア順にソートして返す
 * @param params 検索パラメータ（タグ配列）
 * @param limit 最大取得件数（デフォルト5）
 * @returns スコア付きルールカード配列
 */
export function searchRuleCards(
  params: SearchParams,
  limit = 5
): ScoredRuleCard[] {
  const cards = loadRuleCards();
  if (cards.length === 0) return [];

  const scored: ScoredRuleCard[] = cards.map((card) => {
    let score = 0;
    const matchedTags: string[] = [];

    // risk_tags マッチング (+3点)
    params.riskTags?.forEach((tag) => {
      if (card.risk_tags.includes(tag)) {
        score += WEIGHTS.risk;
        matchedTags.push(`risk:${tag}`);
      }
    });

    // goal_tags マッチング (+2点)
    params.goalTags?.forEach((tag) => {
      if (card.goal_tags.includes(tag)) {
        score += WEIGHTS.goal;
        matchedTags.push(`goal:${tag}`);
      }
    });

    // scene_tags マッチング (+1点)
    params.sceneTags?.forEach((tag) => {
      if (card.scene_tags.includes(tag)) {
        score += WEIGHTS.scene;
        matchedTags.push(`scene:${tag}`);
      }
    });

    return { card, score, matchedTags };
  });

  // フィルタ（スコア > 0）→ ソート（降順）→ 重複排除 → 上限
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((item, index, arr) => {
      // 重複排除: 同一の (risk_tags + anti_pattern) を持つカードは最初の1件のみ
      const key = JSON.stringify([item.card.risk_tags, item.card.anti_pattern]);
      return (
        arr.findIndex(
          (x) =>
            JSON.stringify([x.card.risk_tags, x.card.anti_pattern]) === key
        ) === index
      );
    })
    .slice(0, limit);
}

/**
 * ScoredRuleCard を RetrievedRuleCard に変換
 * フロントエンドに必要な情報のみを抽出
 */
export function toRetrievedRuleCard(scored: ScoredRuleCard): RetrievedRuleCard {
  return {
    id: scored.card.id,
    anti_pattern: scored.card.anti_pattern,
    why_risky: scored.card.why_risky,
    rewrite_policy: scored.card.rewrite_policy,
    good_examples: scored.card.good_examples,
    matchedTags: scored.matchedTags,
    score: scored.score,
  };
}

/**
 * プロンプトに注入するためのKBコンテキストを生成
 */
export function buildKbContext(cards: ScoredRuleCard[]): string {
  if (cards.length === 0) return '';

  const rules = cards
    .map(
      (r) =>
        `- 避けるべき: ${r.card.anti_pattern}\n  → 改善方針: ${r.card.rewrite_policy}`
    )
    .join('\n');

  return `\n\n## 参考ルール（以下のパターンに注意してください）\n${rules}`;
}
