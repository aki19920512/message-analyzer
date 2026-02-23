'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { Decode } from '@/types/analysis';

interface DecodeCardProps {
  decode: Decode;
}

export function DecodeCard({ decode }: DecodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleCopy = async () => {
    try {
      const text = `${decode.headline}\n${decode.next}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('コピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <section className="rounded-xl bg-primary/10 dark:bg-primary/5 border-2 border-primary/30 p-5">
      {/* ヘッダー: ラベル + コピーボタン */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <MaterialIcon name="gps_fixed" size="sm" className="text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            次の一手
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary uppercase tracking-tight hover:opacity-80 transition-opacity"
        >
          <MaterialIcon
            name={copied ? 'check' : 'content_copy'}
            size="sm"
          />
          {copied ? '完了' : 'コピー'}
        </button>
      </div>

      {/* headline: 大きく太字 */}
      <p className="text-lg font-bold text-foreground leading-snug mb-3">
        {decode.headline}
      </p>

      {/* 折りたたみ詳細 */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors">
            <span>{detailsOpen ? '詳細を閉じる' : '詳細を見る'}</span>
            <MaterialIcon
              name="expand_more"
              size="sm"
              className={`transition-transform duration-200 ${
                detailsOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-2.5 text-sm">
            {/* why: 安心理由 */}
            <div className="flex items-start gap-2">
              <MaterialIcon name="check_circle" size="sm" className="text-primary mt-0.5 shrink-0" />
              <p className="text-muted-foreground leading-relaxed">{decode.why}</p>
            </div>
            {/* avoid: やらない方がいいこと */}
            <div className="flex items-start gap-2">
              <MaterialIcon name="block" size="sm" className="text-destructive mt-0.5 shrink-0" />
              <p className="text-muted-foreground leading-relaxed">{decode.avoid}</p>
            </div>
            {/* next: 具体アクション */}
            <div className="flex items-start gap-2">
              <MaterialIcon name="arrow_forward" size="sm" className="text-primary mt-0.5 shrink-0" />
              <p className="text-foreground font-medium leading-relaxed">{decode.next}</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
