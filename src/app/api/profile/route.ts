import { NextRequest, NextResponse } from 'next/server';
import { profileFormSchema, profileStructSchema } from '@/lib/validation';
import { buildProfilePrompt, profileJsonSchema } from '@/lib/prompts';
import { getOpenAIClient, extractOpenAIError } from '@/lib/openai';
import type { ProfileResponse } from '@/types/analysis';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ProfileResponse>> {
  try {
    // 1. リクエストボディをパース
    const body = await request.json();

    // 2. 入力バリデーション
    const validationResult = profileFormSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
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

    const { chatLogFull } = validationResult.data;

    // 3. プロンプト構築（入力全文はログに出さない）
    const systemPrompt = buildProfilePrompt();

    // 4. OpenAI APIを呼び出し
    let retryCount = 0;
    const maxRetries = 1;

    while (true) {
      try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `【会話ログ】\n${chatLogFull}`,
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: profileJsonSchema,
          },
          temperature: 0.7,
          max_tokens: 1500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('OpenAIからの応答が空です');
        }

        // JSONパース
        const parsed = JSON.parse(content);

        // profileStructのバリデーション
        const validated = profileStructSchema.safeParse(parsed.profileStruct);
        if (!validated.success) {
          throw new Error('レスポンス形式が不正です');
        }

        return NextResponse.json({
          success: true,
          data: {
            profileText: parsed.profileText,
            profileStruct: validated.data,
          },
        });
      } catch (parseError) {
        retryCount++;
        if (retryCount > maxRetries) {
          throw parseError;
        }
        continue;
      }
    }
  } catch (error) {
    // OpenAIエラーの詳細を取得
    const { status, code, type, safeMessage } = extractOpenAIError(error);

    // エラーログ（機微データを含めない）
    console.error('Profile API error:', { status, code, type });

    // エラーコードに応じたメッセージ
    let userMessage = 'プロファイル作成中にエラーが発生しました。もう一度お試しください。';
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
