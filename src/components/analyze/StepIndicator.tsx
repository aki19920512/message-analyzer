'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex w-full flex-row items-center justify-center gap-3 py-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all',
            i + 1 === currentStep
              ? 'w-8 bg-primary'
              : i + 1 < currentStep
              ? 'w-2 bg-primary/60'
              : 'w-2 bg-primary/30'
          )}
        />
      ))}
    </div>
  );
}
