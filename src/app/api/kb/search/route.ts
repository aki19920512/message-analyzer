/**
 * KB検索デバッグAPI
 * POST /api/kb/search
 *
 * リクエスト: { riskTags?, goalTags?, sceneTags?, limit? }
 * レスポンス: { cards: RetrievedRuleCard[], totalLoaded: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchRuleCards, toRetrievedRuleCard } from '@/lib/kb/search';
import { loadRuleCards } from '@/lib/kb/load.server';

interface KbSearchRequest {
  riskTags?: string[];
  goalTags?: string[];
  sceneTags?: string[];
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: KbSearchRequest = await request.json();
    const { riskTags, goalTags, sceneTags, limit = 5 } = body;

    // KB検索
    const scoredCards = searchRuleCards(
      { riskTags, goalTags, sceneTags },
      limit
    );
    const retrievedCards = scoredCards.map(toRetrievedRuleCard);

    // 全件数を取得（デバッグ用）
    const allCards = loadRuleCards();

    return NextResponse.json({
      cards: retrievedCards,
      totalLoaded: allCards.length,
    });
  } catch (error) {
    console.error('[KB Search API] Error:', error);
    return NextResponse.json(
      { error: 'KB search failed', details: String(error) },
      { status: 500 }
    );
  }
}
