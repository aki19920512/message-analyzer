'use client';

import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type LoadingStep = 'validating' | 'analyzing' | 'formatting';

interface LoadingStateProps {
  currentStep?: LoadingStep;
  onCancel?: () => void;
}

const STEPS: { key: LoadingStep; label: string; icon: string }[] = [
  { key: 'validating', label: '入力チェック', icon: 'checklist' },
  { key: 'analyzing', label: 'AIがチェック中', icon: 'psychology' },
  { key: 'formatting', label: '結果をまとめ中', icon: 'format_list_bulleted' },
];

export function LoadingState({ currentStep = 'analyzing', onCancel }: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 経過時間のカウント
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // プログレスバーのアニメーション
  useEffect(() => {
    const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
    const baseProgress = (stepIndex / STEPS.length) * 100;

    // ステップ内での進捗をゆっくり進める
    const timer = setInterval(() => {
      setProgress((prev) => {
        const maxForStep = ((stepIndex + 1) / STEPS.length) * 100 - 5;
        if (prev < maxForStep) {
          return Math.min(prev + 0.5, maxForStep);
        }
        return prev;
      });
    }, 100);

    setProgress(baseProgress);
    return () => clearInterval(timer);
  }, [currentStep]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* アニメーションアイコン */}
      <div className="relative mb-6">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <MaterialIcon
            name="progress_activity"
            size="lg"
            className="animate-spin text-primary text-4xl"
          />
        </div>
      </div>

      {/* ステップ表示 */}
      <div className="flex items-center gap-2 mb-4">
        {STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/20 text-primary',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                <MaterialIcon
                  name={isCompleted ? 'check_circle' : step.icon}
                  size="sm"
                  className="text-[14px]"
                />
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-4 h-0.5 rounded-full',
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 現在のステップラベル（モバイル用） */}
      <p className="sm:hidden text-sm font-medium text-foreground mb-2">
        {STEPS[currentStepIndex]?.label}
      </p>

      {/* プログレスバー */}
      <div className="w-full max-w-xs mb-4">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 経過時間 */}
      <p className="text-xs text-muted-foreground mb-4">
        経過時間: {elapsedTime}秒
      </p>

      {/* キャンセルボタン */}
      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <MaterialIcon name="close" size="sm" className="mr-1" />
          キャンセル
        </Button>
      )}
    </div>
  );
}
