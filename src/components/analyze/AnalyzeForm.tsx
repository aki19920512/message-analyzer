'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  analysisFormSchema,
  type AnalysisFormValues,
  GOAL_OPTIONS,
  TONE_OPTIONS,
} from '@/lib/validation';
import type { AnalysisResult, AnalyzeResponse } from '@/types/analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResultsDisplay } from './ResultsDisplay';
import { LoadingState } from './LoadingState';

export function AnalyzeForm() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      chatLog: '',
      draft: '',
      goal: undefined,
      tone: undefined,
    },
  });

  const chatLogLength = form.watch('chatLog')?.length || 0;
  const draftLength = form.watch('draft')?.length || 0;

  const onSubmit = async (data: AnalysisFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!json.success || !json.data) {
        // エラー詳細を表示（デバッグ用）
        const details = json.error?.details;
        const detailStr = details
          ? ` [status=${details.status}, code=${details.openaiCode || 'none'}, type=${details.openaiType || 'none'}]`
          : '';
        throw new Error((json.error?.message || '解析に失敗しました') + detailStr);
      }

      setResult(json.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>メッセージ解析</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 会話ログ */}
              <FormField
                control={form.control}
                name="chatLog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>会話ログ</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="これまでの会話を貼り付けてください..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <FormMessage />
                      <span
                        className={
                          chatLogLength > 100000 ? 'text-destructive' : ''
                        }
                      >
                        {chatLogLength.toLocaleString()}/100,000
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* 送信予定文 */}
              <FormField
                control={form.control}
                name="draft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>送信予定文</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="今送ろうとしているメッセージを入力してください..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <FormMessage />
                      <span
                        className={draftLength > 400 ? 'text-destructive' : ''}
                      >
                        {draftLength}/400
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* 目的とトーン */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目的</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="目的を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GOAL_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>トーン</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="トーンを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TONE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? '解析中...' : '解析する'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ローディング表示 */}
      {isLoading && <LoadingState />}

      {/* 結果表示 */}
      {result && <ResultsDisplay result={result} draft={form.getValues('draft')} />}
    </div>
  );
}
