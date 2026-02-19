'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Check, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RetrievedRuleCard } from '@/types/analysis';

interface RuleCardItemProps {
  rule: RetrievedRuleCard;
}

export function RuleCardItem({ rule }: RuleCardItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('コピーしました');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto text-left hover:bg-muted/50"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Lightbulb className="size-4 shrink-0 text-amber-500" />
            <span className="font-medium truncate">{rule.anti_pattern}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {rule.matchedTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag.replace('goal:', '').replace('risk:', '').replace('scene:', '')}
              </Badge>
            ))}
            <ChevronDown
              className={`size-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-4">
        {/* 避けたいパターン */}
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              避けたいパターン
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{rule.anti_pattern}</p>
          <p className="text-sm text-muted-foreground mt-2 italic">
            {rule.why_risky}
          </p>
        </div>

        {/* 改善方針 */}
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                改善方針
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(rule.rewrite_policy, 'policy');
              }}
            >
              {copiedField === 'policy' ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              <span className="ml-1 text-xs">コピー</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{rule.rewrite_policy}</p>
        </div>

        {/* 良い例（存在する場合） */}
        {rule.good_examples.length > 0 &&
          rule.good_examples.some((ex) => !ex.text.includes('LLMモードがOFF')) && (
            <div className="space-y-2">
              <span className="text-sm font-medium">改善例</span>
              {rule.good_examples
                .filter((ex) => !ex.text.includes('LLMモードがOFF'))
                .map((example, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border bg-muted/30 p-3 flex justify-between items-start gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {example.label}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {example.text}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(example.text, `example-${idx}`);
                      }}
                    >
                      {copiedField === `example-${idx}` ? (
                        <Check className="size-3" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                ))}
            </div>
          )}
      </CollapsibleContent>
    </Collapsible>
  );
}
