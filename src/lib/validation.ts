import { z } from 'zod';

// ゴールの選択肢
export const GOAL_OPTIONS = [
  { value: 'invite', label: '誘う' },
  { value: 'schedule', label: '日程調整' },
  { value: 'after_seen', label: '既読スルー後' },
  { value: 'casual', label: '雑談' },
  { value: 'apologize', label: '謝る' },
  { value: 'other', label: 'その他' },
] as const;

// トーンの選択肢
export const TONE_OPTIONS = [
  { value: 'polite', label: '丁寧' },
  { value: 'casual', label: 'カジュアル' },
  { value: 'humorous', label: 'ユーモア' },
] as const;

// フォーム入力のバリデーションスキーマ
export const analysisFormSchema = z.object({
  chatLog: z
    .string({ message: '会話ログを入力してください' })
    .min(1, '会話ログを入力してください')
    .max(100000, '会話ログは100,000文字以内で入力してください'),
  draft: z
    .string({ message: '送信予定文を入力してください' })
    .min(1, '送信予定文を入力してください')
    .max(400, '送信予定文は400文字以内で入力してください'),
  goal: z.enum(['invite', 'schedule', 'after_seen', 'casual', 'apologize', 'other'], {
    message: '目的を選択してください',
  }),
  tone: z.enum(['polite', 'casual', 'humorous'], {
    message: 'トーンを選択してください',
  }),
});

export type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

// スコア別根拠のスキーマ
export const reasonsByMetricSchema = z.object({
  warmthMatch: z.string(),
  pressureRisk: z.string(),
  sincerity: z.string(),
  clarity: z.string(),
  styleMatch: z.string(),
});

// APIレスポンスのバリデーションスキーマ
export const analysisResultSchema = z.object({
  profile: z.object({
    pace: z.string(),
    style: z.string(),
    boundaries: z.string(),
    progress: z.string(),
    notes: z.array(z.string()),
  }),
  scores: z.object({
    warmthMatch: z.number().min(0).max(100),
    pressureRisk: z.number().min(0).max(100),
    sincerity: z.number().min(0).max(100),
    clarity: z.number().min(0).max(100),
    styleMatch: z.number().min(0).max(100),
  }),
  suggestions: z.array(
    z.object({
      label: z.string(),
      text: z.string(),
    })
  ),
  reasons: z.array(z.string()),
  nextStep: z.string(),
  // 追加: スコア別根拠と寄り添い総評
  reasonsByMetric: reasonsByMetricSchema.optional(),
  diagnosisSummary: z.string().optional(),
});

// ========== Part2: プロファイル作成 ==========

// プロファイル作成フォーム
export const profileFormSchema = z.object({
  partnerName: z
    .string({ message: '相手の名前を入力してください' })
    .min(1, '相手の名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  chatLogFull: z
    .string({ message: '会話ログを入力してください' })
    .min(1, '会話ログを入力してください')
    .max(20000, '会話ログは20,000文字以内で入力してください'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// プロファイル構造のバリデーション
export const profileStructSchema = z.object({
  pace: z.string(),
  style: z.string(),
  boundaries: z.string(),
  progress: z.string(),
  notes: z.array(z.string()),
});

// ========== Part2: 解析V2（プロファイル + 直近ログ） ==========

// 絵文字ポリシーのスキーマ
export const emojiPolicySchema = z.enum(['none', 'keep_user_only', 'allow_ai']);

export const analyzeFormV2Schema = z.object({
  // ゲスト添削対応: プロファイルは任意（空文字OK）
  partnerProfileText: z
    .string()
    .max(2000, 'プロファイルは2,000文字以内で入力してください'),
  recentLog: z
    .string({ message: '直近の会話を入力してください' })
    .min(1, '直近の会話を10通くらい貼ってください')
    .max(6000, '長い場合は最新のやりとりだけ残してください'),
  draft: z
    .string({ message: '送信予定文を入力してください' })
    .min(1, '送る文を貼ってください（短くてもOK）')
    .max(500, '送信予定文は500文字以内でお願いします'),
  // 'auto' = 会話ログから自動判定
  goal: z.enum(['invite', 'schedule', 'after_seen', 'casual', 'apologize', 'other', 'auto'], {
    message: '目的を選択してください',
  }).default('auto'),
  tone: z.enum(['polite', 'casual', 'humorous', 'auto'], {
    message: 'トーンを選択してください',
  }).default('auto'),
  // 絵文字ポリシー
  emojiPolicy: emojiPolicySchema.optional(),
  userEmojiHints: z.array(z.string()).optional(),
});

export type AnalyzeFormV2Values = z.infer<typeof analyzeFormV2Schema>;
