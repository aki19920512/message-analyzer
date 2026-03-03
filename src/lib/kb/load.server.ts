/**
 * KBルールカードのローダー（サーバー専用）
 * .server.ts 命名規約によりクライアントバンドルから除外される
 */

import 'server-only';

import * as fs from 'fs';
import * as path from 'path';
import type { RuleCard, StrategyCard } from './types';

// globalThis にキャッシュを保持（HMRでも維持）
declare global {
  // eslint-disable-next-line no-var
  var __kbCache: RuleCard[] | undefined;
  // eslint-disable-next-line no-var
  var __strategyKbCache: StrategyCard[] | undefined;
}

/**
 * rule_cards.jsonl を読み込み、RuleCard配列を返す
 * - globalThis にキャッシュし、毎リクエストでのファイル読み込みを防止
 * - ファイル不在やパースエラー時は空配列を返却（graceful degradation）
 */
export function loadRuleCards(): RuleCard[] {
  // キャッシュがあればそれを返す
  if (globalThis.__kbCache) {
    return globalThis.__kbCache;
  }

  // data/rule_cards.jsonl のパスを構築
  const filePath = path.join(process.cwd(), 'data', 'rule_cards.jsonl');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    const cards: RuleCard[] = [];
    let skippedCount = 0;

    for (const line of lines) {
      try {
        const card = JSON.parse(line) as RuleCard;
        cards.push(card);
      } catch {
        // 個別行のパースエラーはスキップ（内容はログ出力しない）
        skippedCount++;
      }
    }

    // 安全なログ（スキップした行数のみ、内容は出さない）
    if (skippedCount > 0) {
      console.warn(`[KB] Skipped ${skippedCount} malformed line(s)`);
    }
    console.log(`[KB] Loaded ${cards.length} rule cards from ${lines.length} lines`);

    // キャッシュに保存
    globalThis.__kbCache = cards;
    return cards;
  } catch (error) {
    // ファイル読み込みエラー（エラーメッセージのみ、パスは出さない）
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[KB] Failed to load KB file: ${errMsg}`);
    return [];
  }
}

/**
 * キャッシュをクリアする（開発時のホットリロード用）
 */
export function clearKbCache(): void {
  globalThis.__kbCache = undefined;
}

/**
 * strategy_cards.jsonl を読み込み、StrategyCard配列を返す
 */
export function loadStrategyCards(): StrategyCard[] {
  if (globalThis.__strategyKbCache) {
    return globalThis.__strategyKbCache;
  }

  const filePath = path.join(process.cwd(), 'data', 'strategy_cards.jsonl');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length === 0) {
      globalThis.__strategyKbCache = [];
      return [];
    }

    const cards: StrategyCard[] = [];
    let skippedCount = 0;

    for (const line of lines) {
      try {
        const card = JSON.parse(line) as StrategyCard;
        cards.push(card);
      } catch {
        skippedCount++;
      }
    }

    if (skippedCount > 0) {
      console.warn(`[KB] Skipped ${skippedCount} malformed strategy line(s)`);
    }
    if (cards.length > 0) {
      console.log(`[KB] Loaded ${cards.length} strategy cards`);
    }

    globalThis.__strategyKbCache = cards;
    return cards;
  } catch {
    // ファイル不在時は空配列（graceful degradation）
    globalThis.__strategyKbCache = [];
    return [];
  }
}

export function clearStrategyKbCache(): void {
  globalThis.__strategyKbCache = undefined;
}
