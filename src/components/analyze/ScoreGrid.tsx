'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn, getScoreLevel, getScoreLevelLabel, getScoreBarColor, getScoreLevelClasses } from '@/lib/utils';
import type { Scores } from '@/types/analysis';

interface ScoreGridProps {
  scores: Scores;
  reasonsByMetric?: {
    warmthMatch: string;
    pressureRisk: string;
    sincerity: string;
    clarity: string;
    styleMatch: string;
  };
}

// スコアの説明（ツールチップ用）
const SCORE_TOOLTIPS: Record<string, string> = {
  warmthMatch: '相手の温度感とどれだけ一致しているか。高いほど自然な距離感です。',
  sincerity: 'メッセージの誠実さ・真摯さ。矛盾や言い訳がないほど高くなります。',
  clarity: '意図の明確さ。何を伝えたいか相手に伝わりやすいほど高くなります。',
  styleMatch: '相手のコミュニケーションスタイルとの適合度。',
  pressureRisk: '圧力・押しの強さのリスク。低いほど相手が安心できます。',
};

export function ScoreGrid({ scores, reasonsByMetric }: ScoreGridProps) {
  // pressureRisk: 低いほど良い（inverted=true）
  const pressureLevel = getScoreLevel(scores.pressureRisk, { inverted: true });

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
        パフォーマンス指標
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {/* 温度感の一致 */}
        <ScoreCard
          icon="wb_sunny"
          iconColor="text-orange-400"
          label="温度感の一致"
          value={scores.warmthMatch}
          tooltip={SCORE_TOOLTIPS.warmthMatch}
          reason={reasonsByMetric?.warmthMatch}
        />

        {/* 誠実さ */}
        <ScoreCard
          icon="favorite"
          iconColor="text-blue-400"
          label="誠実さ"
          value={scores.sincerity}
          tooltip={SCORE_TOOLTIPS.sincerity}
          reason={reasonsByMetric?.sincerity}
        />

        {/* 明確さ */}
        <ScoreCard
          icon="visibility"
          iconColor="text-emerald-400"
          label="明確さ"
          value={scores.clarity}
          tooltip={SCORE_TOOLTIPS.clarity}
          reason={reasonsByMetric?.clarity}
        />

        {/* スタイルの適合度 */}
        <ScoreCard
          icon="auto_awesome"
          iconColor="text-purple-400"
          label="スタイルの適合度"
          value={scores.styleMatch}
          tooltip={SCORE_TOOLTIPS.styleMatch}
          reason={reasonsByMetric?.styleMatch}
        />

        {/* 圧リスク - 2カラム幅（低いほど安全） */}
        <div className="col-span-2 flex flex-col gap-3 rounded-xl bg-card p-4 shadow-sm border border-primary/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MaterialIcon
                name={pressureLevel === 'good' ? 'check_circle' : pressureLevel === 'warning' ? 'warning' : 'error'}
                size="sm"
                className={cn(
                  pressureLevel === 'good' && 'text-score-good',
                  pressureLevel === 'warning' && 'text-score-warning',
                  pressureLevel === 'danger' && 'text-score-danger'
                )}
              />
              <p className="text-xs font-medium text-muted-foreground">
                圧リスク
              </p>
              <span className="text-[9px] text-muted-foreground/70">（低いほど安全）</span>
              <TooltipIcon tooltip={SCORE_TOOLTIPS.pressureRisk} />
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                getScoreLevelClasses(pressureLevel)
              )}>
                {pressureLevel === 'good' ? '安全' : pressureLevel === 'warning' ? '注意' : '危険'}
              </span>
              <p className={cn(
                'text-xl font-bold',
                pressureLevel === 'good' && 'text-score-good',
                pressureLevel === 'warning' && 'text-score-warning',
                pressureLevel === 'danger' && 'text-score-danger'
              )}>
                {scores.pressureRisk}
              </p>
            </div>
          </div>
          {/* 色分けされたバー（反転: 0が左=緑、100が右=赤） */}
          <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-score-good via-score-warning to-score-danger">
            {/* インジケーター */}
            <div
              className="absolute top-[-4px] h-5 w-1 bg-foreground rounded-full border-2 border-card"
              style={{ left: `${Math.min(Math.max(scores.pressureRisk, 2), 98)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium px-1">
            <span>安全</span>
            <span>注意</span>
            <span>危険</span>
          </div>
          {/* 圧力リスクの根拠 */}
          {reasonsByMetric?.pressureRisk && (
            <p className="text-xs text-muted-foreground mt-1 px-1">
              {reasonsByMetric.pressureRisk}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ScoreCard({
  icon,
  iconColor,
  label,
  value,
  tooltip,
  reason,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: number;
  tooltip?: string;
  reason?: string;
}) {
  const level = getScoreLevel(value);

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-card p-4 shadow-sm border border-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MaterialIcon name={icon} size="sm" className={iconColor} />
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        {tooltip && <TooltipIcon tooltip={tooltip} />}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-[10px] text-muted-foreground">/100</p>
        </div>
        <span className={cn(
          'text-[10px] font-semibold px-1.5 py-0.5 rounded',
          getScoreLevelClasses(level)
        )}>
          {getScoreLevelLabel(level)}
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getScoreBarColor(level))}
          style={{ width: `${value}%` }}
        />
      </div>
      {/* 根拠表示 */}
      {reason && (
        <p className="text-[10px] text-muted-foreground mt-1">
          {reason}
        </p>
      )}
    </div>
  );
}

function TooltipIcon({ tooltip }: { tooltip: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        <MaterialIcon name="help" size="sm" className="text-[14px]" />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-[10px] rounded-lg shadow-lg border border-border">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
}
