/**
 * KBルールカードのローダー（サーバー専用）
 * .server.ts 命名規約によりクライアントバンドルから除外される
 */

import 'server-only';

import * as fs from 'fs';
import * as path from 'path';
import type { RuleCard } from './types';

// globalThis にキャッシュを保持（HMRでも維持）
declare global {
  // eslint-disable-next-line no-var
  var __kbCache: RuleCard[] | undefined;
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
