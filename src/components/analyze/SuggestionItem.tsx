'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { Suggestion } from '@/types/analysis';

interface SuggestionItemProps {
  suggestion: Suggestion;
}

const LABEL_CONFIG: Record<
  string,
  {
    icon: string;
    iconBg: string;
    iconColor: string;
    displayLabel: string;
  }
> = {
  '自然': {
    icon: 'verified',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    displayLabel: '自然（おすすめ）',
  },
  '親しみ': {
    icon: 'favorite',
    iconBg: 'bg-pink-50 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
    displayLabel: '親しみ',
  },
  '軽い遊び心': {
    icon: 'sentiment_satisfied',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    displayLabel: '軽い遊び心',
  },
};

export function SuggestionItem({ suggestion }: SuggestionItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestion.text);
      setCopied(true);
      toast.success('コピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  const config = LABEL_CONFIG[suggestion.label] || {
    icon: 'chat',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    displayLabel: suggestion.label,
  };

  return (
    <div className="rounded-xl bg-card p-4 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.iconBg} ${config.iconColor}`}>
            <MaterialIcon name={config.icon} size="sm" />
          </div>
          <span className="text-sm font-bold">{config.displayLabel}</span>
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
      <p className="text-sm text-muted-foreground italic leading-relaxed">
        &ldquo;{suggestion.text}&rdquo;
      </p>
    </div>
  );
}
