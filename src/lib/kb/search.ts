/**
 * KBルールカードの検索エンジン
 * タグベースのスコアリングと重複排除を行う
 */

import type { RuleCard, ScoredRuleCard, RetrievedRuleCard, ScoredStrategyCard } from './types';
import { loadRuleCards, loadStrategyCards } from './load.server';

export interface SearchParams {
  riskTags?: string[];
  goalTags?: string[];
  sceneTags?: string[];
  // 戦略カード用
  phaseTags?: string[];
  situationTags?: string[];
  partnerStateTags?: string[];
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
    .map((r) => {
      let entry = `- 避けるべき: ${r.card.anti_pattern}\n  → 改善方針: ${r.card.rewrite_policy}`;
      if (r.card.notes && r.card.notes.length > 0) {
        const noteStr = r.card.notes.slice(0, 2).join('、');
        entry += `\n  補足: ${noteStr}`;
      }
      return entry;
    })
    .join('\n');

  return `\n\n## 参考ルール（以下のパターンに注意してください）\n${rules}`;
}

/**
 * decode フィールドを持つカードからDecode専用ヒントを生成
 */
export function buildDecodeKbHints(cards: ScoredRuleCard[]): string {
  const decodeCards = cards.filter((c) => c.card.decode);
  if (decodeCards.length === 0) return '';

  const hints = decodeCards
    .map((c) => {
      const d = c.card.decode!;
      return `- ${d.headline}: next=[${d.next.join(', ')}] avoid=[${d.avoid.join(', ')}]`;
    })
    .join('\n');

  return `\n\n## Decodeヒント（以下のKB知見を参考にheadline/avoid/nextを生成）\n${hints}`;
}

// ========== 戦略カード検索 ==========

const STRATEGY_WEIGHTS = {
  partnerState: 3,
  phase: 2,
  situation: 2,
};

/**
 * 戦略カードを検索し、スコア順にソートして返す
 */
export function searchStrategyCards(
  params: SearchParams,
  limit = 3
): ScoredStrategyCard[] {
  const cards = loadStrategyCards();
  if (cards.length === 0) return [];

  const scored: ScoredStrategyCard[] = cards.map((card) => {
    let score = 0;
    const matchedTags: string[] = [];

    params.partnerStateTags?.forEach((tag) => {
      if (card.partner_state_tags.includes(tag)) {
        score += STRATEGY_WEIGHTS.partnerState;
        matchedTags.push(`partnerState:${tag}`);
      }
    });

    params.phaseTags?.forEach((tag) => {
      if (card.phase_tags.includes(tag)) {
        score += STRATEGY_WEIGHTS.phase;
        matchedTags.push(`phase:${tag}`);
      }
    });

    params.situationTags?.forEach((tag) => {
      if (card.situation_tags.includes(tag)) {
        score += STRATEGY_WEIGHTS.situation;
        matchedTags.push(`situation:${tag}`);
      }
    });

    return { card, score, matchedTags };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((item, index, arr) => {
      const key = item.card.strategy;
      return arr.findIndex((x) => x.card.strategy === key) === index;
    })
    .slice(0, limit);
}

/**
 * プロンプトに注入するための戦略コンテキストを生成
 */
export function buildStrategyContext(cards: ScoredStrategyCard[]): string {
  if (cards.length === 0) return '';

  const entries = cards
    .map((s) => {
      return `- 状況: ${s.card.situation_tags.join('、')}\n  戦略: ${s.card.strategy}\n  理由: ${s.card.why_effective}\n  タイミング: ${s.card.timing}\n  避けるべきこと: ${s.card.avoid}`;
    })
    .join('\n');

  return `\n\n## 参考戦略（KBマッチ）\n${entries}`;
}
