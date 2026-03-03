import { NextRequest, NextResponse } from 'next/server';
import {
  analysisFormSchema,
  analyzeFormV2Schema,
  analysisResultSchema,
} from '@/lib/validation';
import { validateSuggestions, validateDecode } from '@/lib/suggestion-validator';
import {
  buildAnalysisPrompt,
  buildAnalysisPromptV2,
  analysisJsonSchema,
} from '@/lib/prompts';
import { getOpenAIClient, extractOpenAIError } from '@/lib/openai';
import type { AnalyzeResponse, AnalysisResult, RetrievedRuleCard } from '@/types/analysis';
import { searchRuleCards, toRetrievedRuleCard, buildKbContext, buildDecodeKbHints, searchStrategyCards, buildStrategyContext } from '@/lib/kb/search';
import type { SearchParams } from '@/lib/kb/search';
import { detectDraftRisks } from '@/lib/draft-risk-detector';

export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyzeResponse>> {
  const startTime = performance.now();

  try {
    // 1. リクエストボディをパース
    const body = await request.json();

    // 2. 入力バリデーション（V2形式を優先、フォールバックでV1）
    let systemPrompt: string;
    let userContent: string;
    let retrievedRuleCards: RetrievedRuleCard[] = [];

    // V2形式（プロファイル + 直近ログ）を試す
    const v2Result = analyzeFormV2Schema.safeParse(body);
    if (v2Result.success) {
      const { partnerProfileText, recentLog, draft, goal, tone, emojiPolicy, userEmojiHints, toneControls } = v2Result.data;

      // 下書きリスク検出
      const draftRisks = detectDraftRisks(draft);
      const detectedRiskTags = draftRisks.map((r) => r.tag);

      // KB検索: goal が 'auto' の場合は汎用タグを使用、riskTags にリスク検出結果を注入
      const goalTags = goal === 'auto' ? ['casual', 'other'] : [goal];
      const searchParams: SearchParams = {
        goalTags,
        sceneTags: [],
        riskTags: detectedRiskTags,
      };
      const scoredCards = searchRuleCards(searchParams, 5);
      retrievedRuleCards = scoredCards.map(toRetrievedRuleCard);

      // KBコンテキスト生成
      const kbContext = buildKbContext(scoredCards);
      const decodeKbHints = buildDecodeKbHints(scoredCards);

      // 戦略カード検索
      const strategyScoredCards = searchStrategyCards(searchParams, 3);
      const strategyContext = buildStrategyContext(strategyScoredCards);

      // リスク警告文生成
      let draftRiskWarnings = '';
      if (draftRisks.length > 0) {
        const lines = draftRisks.map((r) => `- ${r.label}: 「${r.matched}」`).join('\n');
        draftRiskWarnings = `\n\n## ⚠ 下書きリスク検出\n以下のリスクが検出されました。Decodeのavoidに必ず反映し、suggestionsでも回避してください:\n${lines}`;
      }

      // プロンプト組み立て（KB情報は関数内部で適切な位置に配置）
      systemPrompt = buildAnalysisPromptV2(
        goal, tone, partnerProfileText, emojiPolicy, userEmojiHints, toneControls,
        kbContext, decodeKbHints, draftRiskWarnings, strategyContext
      );
      userContent = `【直近の会話】\n${recentLog}\n\n【送信予定文】\n${draft}`;
    } else {
      // V1形式（従来の全文ログ）を試す
      const v1Result = analysisFormSchema.safeParse(body);
      if (!v1Result.success) {
        const firstError = v1Result.error.issues[0];
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: firstError?.message || '入力内容を確認してください',
            },
          },
          { status: 400 }
        );
      }

      const { chatLog, draft, goal, tone } = v1Result.data;
      systemPrompt = buildAnalysisPrompt(goal, tone);
      userContent = `【会話ログ】\n${chatLog}\n\n【送信予定文】\n${draft}`;
    }

    // 3. OpenAI APIを呼び出し（JSONモード強制）
    let analysisData: AnalysisResult;
    let retryCount = 0;
    const maxRetries = 1;

    while (true) {
      try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: analysisJsonSchema,
          },
          temperature: 0.7,
          max_tokens: 2500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('OpenAIからの応答が空です');
        }

        // JSONパース
        analysisData = JSON.parse(content);

        // Zodでバリデーション
        const validated = analysisResultSchema.safeParse(analysisData);
        if (!validated.success) {
          throw new Error('レスポンス形式が不正です');
        }

        analysisData = validated.data;

        // 品質ガード: NGフレーズ検出時は再生成
        const qualityCheck = validateSuggestions(analysisData.suggestions);
        const decodeCheck = validateDecode(analysisData.decode);
        const allIssues = [...qualityCheck.issues, ...decodeCheck.issues];
        if (allIssues.length > 0 && retryCount < maxRetries) {
          console.log('[Analyze] NG detected, retrying...', allIssues.length, 'issues');
          retryCount++;
          continue;
        }

        break;
      } catch (parseError) {
        retryCount++;
        if (retryCount > maxRetries) {
          throw parseError;
        }
        continue;
      }
    }

    // 処理時間をログ出力
    const elapsed = performance.now() - startTime;
    console.log(`[Analyze] Total: ${elapsed.toFixed(0)}ms`);

    return NextResponse.json({
      success: true,
      data: analysisData,
      retrievedRuleCards: retrievedRuleCards.length > 0 ? retrievedRuleCards : undefined,
    });
  } catch (error) {
    // OpenAIエラーの詳細を取得
    const { status, code, type, safeMessage } = extractOpenAIError(error);

    // エラーログ（機微データを含めない）
    console.error('Analysis API error:', { status, code, type });

    // エラーコードに応じたメッセージ
    let userMessage = '解析中にエラーが発生しました。もう一度お試しください。';
    let errorCode = code || 'INTERNAL_ERROR';

    if (status === 429) {
      if (code === 'insufficient_quota') {
        userMessage = 'APIの利用上限に達しています。OpenAIの請求設定を確認してください。';
        errorCode = 'INSUFFICIENT_QUOTA';
      } else if (code === 'rate_limit_exceeded') {
        userMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください。';
        errorCode = 'RATE_LIMITED';
      } else {
        userMessage = `レート制限エラー (code: ${code || 'unknown'})`;
        errorCode = code || 'RATE_LIMITED';
      }
    } else if (status === 401) {
      userMessage = 'APIキーが無効です。環境変数を確認してください。';
      errorCode = 'AUTH_ERROR';
    } else if (status === 400) {
      userMessage = `リクエストエラー: ${safeMessage}`;
      errorCode = code || 'BAD_REQUEST';
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: userMessage,
          details: {
            status,
            openaiCode: code,
            openaiType: type,
          },
        },
      },
      { status: status || 500 }
    );
  }
}
