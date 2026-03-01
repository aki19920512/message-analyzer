import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient, extractOpenAIError } from '@/lib/openai';
import { createRateLimiter } from '@/lib/rate-limit';
import type { OcrResponse } from '@/types/analysis';

// レートリミッター: 10リクエスト/分/IP
const limiter = createRateLimiter(10, 60 * 1000);

// 許可するMIMEタイプ（image/* 全般を受け入れ — スマホの HEIC/HEIF/AVIF 対応）

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// OCRシステムプロンプト
const OCR_SYSTEM_PROMPT = `あなたはチャットアプリのスクリーンショットからテキストを抽出する専門家です。

以下のルールに従って、画像からメッセージテキストのみを抽出してください：

1. メッセージの発言者を判別し、以下の形式で出力してください：
   - 自分（右側/送信側）のメッセージ → 「あなた:」で始める
   - 相手（左側/受信側）のメッセージ → 「相手:」で始める
2. 時系列順に並べてください（上から下）
3. スタンプ・絵文字スタンプは [スタンプ] と表記
4. 画像・動画メッセージは [画像] と表記
5. 読めない文字・不明瞭な箇所は [不明] と表記
6. UIの要素（日時ヘッダー、既読マーク等）は省略
7. 複数画像がある場合は時系列順に連結

テキストのみを出力してください。JSON形式にしないでください。
余計な説明や前置きは不要です。`;

export async function POST(
  request: NextRequest
): Promise<NextResponse<OcrResponse>> {
  try {
    // 1. レートリミットチェック
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { allowed } = limiter.check(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'リクエストが多すぎます。しばらく待ってから再度お試しください。',
          },
        },
        { status: 429 }
      );
    }

    // 2. multipart/form-data をパース
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    // 3. バリデーション
    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILES',
            message: '画像ファイルを選択してください。',
          },
        },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: `画像は最大${MAX_FILES}枚までです。`,
          },
        },
        { status: 400 }
      );
    }

    // 各ファイルのバリデーション + base64変換
    const imageContents: { base64: string; mediaType: string }[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_TYPE',
              message: `画像ファイルのみ対応しています（${file.name} は非対応です）`,
            },
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `ファイルサイズは1枚あたり5MBまでです（${file.name}）`,
            },
          },
          { status: 400 }
        );
      }

      // base64エンコード（ファイル保存しない）
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mediaType = file.type || 'image/jpeg';
      imageContents.push({ base64, mediaType });
    }

    // 4. OpenAI Vision APIを呼び出し
    const openai = getOpenAIClient();

    // 画像をcontent配列に変換
    const imageMessages: Array<{
      type: 'image_url';
      image_url: { url: string; detail: 'high' };
    }> = imageContents.map(({ base64, mediaType }) => ({
      type: 'image_url' as const,
      image_url: {
        url: `data:${mediaType};base64,${base64}`,
        detail: 'high' as const,
      },
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: OCR_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `この${files.length}枚のスクリーンショットからチャットの会話テキストを抽出してください。`,
            },
            ...imageMessages,
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    // 5. base64データへの参照を破棄（GC対象にする）
    imageContents.length = 0;

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error('OCR結果が空です');
    }

    // 6. 警告の生成
    const warnings: string[] = [];
    if (text.includes('[不明]')) {
      warnings.push('一部読み取れない箇所がありました。確認してください。');
    }
    if (files.length > 1) {
      warnings.push('複数画像を連結しました。順序が正しいか確認してください。');
    }

    return NextResponse.json({
      success: true,
      data: { text, warnings },
    });
  } catch (error) {
    const { status, code, type } = extractOpenAIError(error);

    // エラーログ（画像データを含めない）
    console.error('OCR API error:', { status, code, type });

    let userMessage = '画像の読み取りに失敗しました。もう一度お試しください。';
    let errorCode = code || 'INTERNAL_ERROR';

    if (status === 429) {
      userMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください。';
      errorCode = 'RATE_LIMITED';
    } else if (status === 401) {
      userMessage = 'APIキーが無効です。環境変数を確認してください。';
      errorCode = 'AUTH_ERROR';
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: userMessage,
          details: { status, openaiCode: code, openaiType: type },
        },
      },
      { status: status || 500 }
    );
  }
}
