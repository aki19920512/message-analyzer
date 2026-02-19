import { NextRequest, NextResponse } from 'next/server';
import {
  analysisFormSchema,
  analyzeFormV2Schema,
  analysisResultSchema,
} from '@/lib/validation';
import {
  buildAnalysisPrompt,
  buildAnalysisPromptV2,
  analysisJsonSchema,
} from '@/lib/prompts';
import { getOpenAIClient, extractOpenAIError } from '@/lib/openai';
import type { AnalyzeResponse, AnalysisResult, RetrievedRuleCard } from '@/types/analysis';
import { searchRuleCards, toRetrievedRuleCard, buildKbContext } from '@/lib/kb/search';
import type { SearchParams } from '@/lib/kb/search';

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
      const { partnerProfileText, recentLog, draft, goal, tone } = v2Result.data;

      // KB検索: goal が 'auto' の場合は汎用タグを使用
      const goalTags = goal === 'auto' ? ['casual', 'other'] : [goal];
      const searchParams: SearchParams = {
        goalTags,
        sceneTags: [],
        riskTags: [],
      };
      const scoredCards = searchRuleCards(searchParams, 5);
      retrievedRuleCards = scoredCards.map(toRetrievedRuleCard);

      // プロンプトにKBコンテキストを注入
      const kbContext = buildKbContext(scoredCards);
      systemPrompt = buildAnalysisPromptV2(goal, tone, partnerProfileText) + kbContext;
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
          max_tokens: 2000,
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
