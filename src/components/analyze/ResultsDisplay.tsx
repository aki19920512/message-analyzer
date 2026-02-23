'use client';

import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { AnalysisResult, RetrievedRuleCard, ToneControls } from '@/types/analysis';
import { ScoreGrid } from './ScoreGrid';
import { SuggestionItem } from './SuggestionItem';
import { RuleCardItem } from './RuleCardItem';
import { DecodeCard } from './DecodeCard';
import { ToneAdjuster } from './ToneAdjuster';

interface ResultsDisplayProps {
  result: AnalysisResult;
  draft: string;
  retrievedRuleCards?: RetrievedRuleCard[];
  onRepropose?: (toneControls: ToneControls) => void;
  isReproposing?: boolean;
}

export function ResultsDisplay({ result, draft, retrievedRuleCards, onRepropose, isReproposing = false }: ResultsDisplayProps) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [draftCopied, setDraftCopied] = useState(false);

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setDraftCopied(true);
      setTimeout(() => setDraftCopied(false), 2000);
    } catch {
      // コピー失敗時は何もしない
    }
  };

  // 診断メッセージ（AIからの寄り添い総評を優先、なければフォールバック）
  const fallbackMessage = `お疲れ様です。まずはここまで向き合ってきた自分を褒めてあげてくださいね。
分析したところ、あなたのメッセージはとても穏やかで、相手が安心して受け取れる内容です。
より素敵な関係にするために、ほんの少しの温かみをプラスしてみるのも良いかもしれません。
一歩ずつ、あなたのペースで進んでいきましょう。応援しています。`;

  const diagnosisMessage = result.diagnosisSummary || fallbackMessage;

  return (
    <div className="flex flex-col gap-6">
      {/* Decode（次の一手） */}
      {result.decode && <DecodeCard decode={result.decode} />}

      {/* あなたの下書き（原文） */}
      <section className="rounded-xl bg-muted/50 border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-muted">
              <MaterialIcon name="edit_note" size="sm" className="text-muted-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">あなたの下書き</span>
          </div>
          <button
            onClick={handleCopyDraft}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary uppercase tracking-tight hover:opacity-80 transition-opacity"
          >
            <MaterialIcon
              name={draftCopied ? 'check' : 'content_copy'}
              size="sm"
            />
            {draftCopied ? '完了' : 'コピー'}
          </button>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {draft}
        </p>
      </section>

      {/* スコアグリッド */}
      <ScoreGrid scores={result.scores} reasonsByMetric={result.reasonsByMetric} />

      {/* 診断結果セクション */}
      <section className="rounded-xl bg-primary/10 dark:bg-primary/5 border border-primary/20 p-5">
        <div className="flex items-start gap-3">
          <MaterialIcon name="psychology" className="text-primary mt-1" />
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-foreground">診断結果</h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {diagnosisMessage}
            </p>
          </div>
        </div>
      </section>

      {/* トーン調整スライダー */}
      {onRepropose && (
        <ToneAdjuster onRepropose={onRepropose} isLoading={isReproposing} />
      )}

      {/* 改善パターンの提案 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
          改善パターンの提案
        </h2>
        {result.suggestions.map((suggestion, index) => (
          <SuggestionItem key={index} suggestion={suggestion} />
        ))}
      </section>

      {/* 次のステップ */}
      <section className="rounded-xl bg-primary/5 border border-primary/20 p-5">
        <div className="flex items-start gap-3">
          <MaterialIcon name="arrow_forward" className="text-primary mt-1" />
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-foreground">おすすめの次の一手</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {result.nextStep}
            </p>
          </div>
        </div>
      </section>

      {/* 参照ルール（折りたたみ） */}
      {retrievedRuleCards && retrievedRuleCards.length > 0 && (
        <Collapsible open={rulesOpen} onOpenChange={setRulesOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <MaterialIcon name="lightbulb" className="text-amber-500" />
                <span className="font-semibold text-sm">参照ルール</span>
                <span className="text-xs text-muted-foreground">
                  ({retrievedRuleCards.length}件)
                </span>
              </div>
              <MaterialIcon
                name="expand_more"
                className={`transition-transform duration-200 ${
                  rulesOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 pt-3">
              {retrievedRuleCards.map((rule) => (
                <RuleCardItem key={rule.id} rule={rule} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
