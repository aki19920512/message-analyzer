import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * スコアのレベルを判定する
 * @param score 0-100のスコア
 * @param options.inverted trueの場合、低いほど良い（pressureRisk用）
 */
export function getScoreLevel(
  score: number,
  options?: { inverted?: boolean }
): 'good' | 'warning' | 'danger' {
  if (options?.inverted) {
    // pressureRisk: 低いほど良い
    // 0-30: 緑 (good)
    // 31-60: 黄 (warning)
    // 61-100: 赤 (danger)
    if (score <= 30) return 'good';
    if (score <= 60) return 'warning';
    return 'danger';
  }
  // 他スコア: 高いほど良い
  // 71-100: 緑 (good)
  // 41-70: 黄 (warning)
  // 0-40: 赤 (danger)
  if (score >= 71) return 'good';
  if (score >= 41) return 'warning';
  return 'danger';
}

export function getScoreLevelLabel(level: 'good' | 'warning' | 'danger'): string {
  const labels = { good: '良い', warning: '注意', danger: '危険' };
  return labels[level];
}

export function getScoreBarColor(level: 'good' | 'warning' | 'danger'): string {
  const colors = {
    good: 'bg-score-good',
    warning: 'bg-score-warning',
    danger: 'bg-score-danger'
  };
  return colors[level];
}

export function getScoreLevelClasses(level: 'good' | 'warning' | 'danger'): string {
  const classes = {
    good: 'bg-score-good-bg text-score-good',
    warning: 'bg-score-warning-bg text-score-warning',
    danger: 'bg-score-danger-bg text-score-danger'
  };
  return classes[level];
}
