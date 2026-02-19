import OpenAI from 'openai';

// 遅延初期化でビルド時のエラーを回避
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

// OpenAIエラーから詳細情報を抽出（入力内容は含めない）
export function extractOpenAIError(e: unknown) {
  const err = e as Record<string, unknown>;
  const errError = err?.error as Record<string, unknown> | undefined;

  const status = (err?.status as number) ?? 500;
  const code = (errError?.code as string) ?? (err?.code as string) ?? null;
  const type = (errError?.type as string) ?? null;

  const safeMessage =
    (errError?.message as string) ?? (err?.message as string) ?? 'OpenAI API error';

  return { status, code, type, safeMessage };
}
