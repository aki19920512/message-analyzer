'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Slider } from '@/components/ui/slider';
import type { ToneControls } from '@/types/analysis';

interface ToneAdjusterProps {
  onRepropose: (toneControls: ToneControls) => void;
  isLoading: boolean;
}

export function ToneAdjuster({ onRepropose, isLoading }: ToneAdjusterProps) {
  const [distanceLevel, setDistanceLevel] = useState(50);
  const [lightnessLevel, setLightnessLevel] = useState(50);

  const handleRepropose = () => {
    onRepropose({ distanceLevel, lightnessLevel });
  };

  // スライダーがデフォルト(50)から動いたか
  const hasChanges = distanceLevel !== 50 || lightnessLevel !== 50;

  return (
    <section className="rounded-xl bg-card border border-border p-5 space-y-5">
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <MaterialIcon name="tune" size="sm" className="text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">トーンを調整する</h3>
      </div>

      {/* スライダー A: 距離感 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">くだける</span>
          <span className="text-[11px] font-medium text-foreground">距離感</span>
          <span className="text-xs text-muted-foreground">ちゃんとしてる</span>
        </div>
        <Slider
          value={[distanceLevel]}
          onValueChange={([v]) => setDistanceLevel(v)}
          max={100}
          step={1}
          className="py-1"
        />
      </div>

      {/* スライダー B: 軽さ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">真面目</span>
          <span className="text-[11px] font-medium text-foreground">軽さ</span>
          <span className="text-xs text-muted-foreground">ほんのり軽い</span>
        </div>
        <Slider
          value={[lightnessLevel]}
          onValueChange={([v]) => setLightnessLevel(v)}
          max={100}
          step={1}
          className="py-1"
        />
      </div>

      {/* 再提案ボタン */}
      <button
        onClick={handleRepropose}
        disabled={isLoading || !hasChanges}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-primary font-bold py-3 text-sm transition-all active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
            再提案中...
          </>
        ) : (
          <>
            <MaterialIcon name="refresh" size="sm" />
            このトーンで再提案
          </>
        )}
      </button>
    </section>
  );
}
