// ゴールの選択肢
export type GoalType =
  | 'invite'        // 誘う
  | 'schedule'      // 日程調整
  | 'after_seen'    // 既読スルー後
  | 'casual'        // 雑談
  | 'apologize'     // 謝る
  | 'other'         // その他
  | 'auto';         // 自動判定

// トーンの選択肢
export type ToneType =
  | 'polite'        // 丁寧
  | 'casual'        // カジュアル
  | 'humorous'      // ユーモア
  | 'auto';         // 自動判定

// フォーム入力データ
export interface AnalysisFormData {
  chatLog: string;
  draft: string;
  goal: GoalType;
  tone: ToneType;
}

// プロフィール分析結果
export interface ProfileAnalysis {
  pace: string;        // 返信ペース傾向
  style: string;       // コミュニケーションスタイル
  boundaries: string;  // 境界線の傾向
  progress: string;    // 関係性の進展度
  notes: string[];     // その他気づき（3項目）
}

// スコア
export interface Scores {
  warmthMatch: number;    // 温度感の一致 (0-100)
  pressureRisk: number;   // 圧力リスク (0-100)
  sincerity: number;      // 誠実さ (0-100)
  clarity: number;        // 明確さ (0-100)
  styleMatch: number;     // スタイル適合 (0-100)
}

// 提案
export interface Suggestion {
  label: string;  // 丁寧/カジュアル/ユーモア
  text: string;   // 改善案テキスト
}

// スコア別根拠
export interface ReasonsByMetric {
  warmthMatch: string;
  pressureRisk: string;
  sincerity: string;
  clarity: string;
  styleMatch: string;
}

// AI解析結果
export interface AnalysisResult {
  profile: ProfileAnalysis;
  scores: Scores;
  suggestions: Suggestion[];
  reasons: string[];
  nextStep: string;
  // 追加: スコア別根拠と寄り添い総評
  reasonsByMetric?: ReasonsByMetric;
  diagnosisSummary?: string;
}

// APIリクエスト
export interface AnalyzeRequest {
  chatLog: string;
  draft: string;
  goal: GoalType;
  tone: ToneType;
}

// APIレスポンス
export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  retrievedRuleCards?: RetrievedRuleCard[];
  error?: {
    code: string;
    message: string;
    details?: {
      status: number;
      openaiCode: string | null;
      openaiType: string | null;
    };
  };
}

// ========== Part2: パートナー管理 ==========

// 保存するスコア（直近の主要3つのみ）
export interface LastScores {
  warmthMatch: number;
  pressureRisk: number;
  clarity: number;
}

// パートナー（localStorage保存用）
export interface Partner {
  id: string;
  partnerName: string;
  profileText: string;
  updatedAt: string;
  lastScores: LastScores | null;
}

// プロファイル作成APIリクエスト
export interface ProfileRequest {
  partnerName: string;
  chatLogFull: string;
}

// プロファイル作成APIレスポンス
export interface ProfileResponse {
  success: boolean;
  data?: {
    profileText: string;
    profileStruct: ProfileAnalysis;
  };
  error?: {
    code: string;
    message: string;
    details?: {
      status: number;
      openaiCode: string | null;
      openaiType: string | null;
    };
  };
}

// Part2用 解析リクエスト（プロファイル + 直近ログ）
export interface AnalyzeRequestV2 {
  partnerProfileText: string;
  recentLog: string;
  draft: string;
  goal: GoalType;
  tone: ToneType;
}

// ========== OCR ==========

// OCR APIレスポンス
export interface OcrResponse {
  success: boolean;
  data?: {
    text: string;
    warnings: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ========== KB統合 ==========

// KBから取得したルールカード（フロントエンド用）
export interface RetrievedRuleCard {
  id: string;
  anti_pattern: string;
  why_risky: string;
  rewrite_policy: string;
  good_examples: Array<{
    label: string;
    text: string;
  }>;
  matchedTags: string[];
  score: number;
}
