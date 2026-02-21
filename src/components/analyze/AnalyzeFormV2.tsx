'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import type { AnalysisResult, AnalyzeResponse, Partner, RetrievedRuleCard } from '@/types/analysis';
import { usePartners } from '@/hooks/usePartners';
import { useHistory } from '@/hooks/useHistory';
import { useSettings } from '@/hooks/useSettings';

// 絵文字抽出関数
function extractEmojis(text: string): string[] {
  // 広範な絵文字パターンをマッチ
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]/gu;
  const matches = text.match(emojiRegex);
  return matches ? [...new Set(matches)] : [];
}
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepIndicator } from './StepIndicator';
import { PartnerSelector } from './PartnerSelector';
import { OcrDropZone } from './OcrDropZone';
import { ResultsDisplay } from './ResultsDisplay';
import { LoadingState, type LoadingStep } from './LoadingState';

interface AnalyzeFormV2Props {
  partnerId?: string;
}

export function AnalyzeFormV2({ partnerId }: AnalyzeFormV2Props) {
  const router = useRouter();
  const { partners, getPartner, updateScores } = usePartners();
  const { addEntry } = useHistory();
  const { settings } = useSettings();

  // フォーム状態
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(partnerId || null);
  const [recentLog, setRecentLog] = useState('');
  const [draft, setDraft] = useState('');

  // OCR状態
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | undefined>(undefined);

  // 送信状態
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('validating');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [retrievedRuleCards, setRetrievedRuleCards] = useState<RetrievedRuleCard[] | undefined>(undefined);

  // AbortController for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // 現在のステップを計算
  const currentStep = selectedPartnerId ? 2 : 1;

  // 選択中のパートナー
  const selectedPartner = selectedPartnerId ? getPartner(selectedPartnerId) : null;

  // partnerIdが変わったら更新
  useEffect(() => {
    if (partnerId) {
      setSelectedPartnerId(partnerId);
    }
  }, [partnerId]);

  // OCRファイル処理
  const handleOcrFiles = async (files: File[]) => {
    setOcrProcessing(true);
    setOcrText(undefined);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!json.success || !json.data?.text) {
        throw new Error(json.error?.message || 'OCR処理に失敗しました');
      }

      setOcrText(json.data.text);

      if (json.data.warnings?.length > 0) {
        toast.warning(json.data.warnings[0]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR処理に失敗しました';
      toast.error(message);
    } finally {
      setOcrProcessing(false);
    }
  };

  // OCRテキストを使用
  const handleUseOcrText = () => {
    if (ocrText) {
      // 6000文字制限（末尾優先）
      const trimmed = ocrText.length > 6000 ? ocrText.slice(-6000) : ocrText;
      setRecentLog(trimmed);
      setOcrText(undefined);
      toast.success('テキストを挿入しました');
    }
  };

  // 送信処理
  const handleSubmit = async () => {
    // バリデーション
    if (!recentLog.trim()) {
      toast.error('会話の履歴を入力してください');
      return;
    }
    if (!draft.trim()) {
      toast.error('下書きを入力してください');
      return;
    }

    // AbortController を作成
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setLoadingStep('validating');
    setError(null);
    setResult(null);
    setRetrievedRuleCards(undefined);

    try {
      // 入力チェック完了 → 分析開始
      setLoadingStep('analyzing');

      // 絵文字を抽出
      const userEmojiHints = extractEmojis(recentLog + draft);

      const requestBody = {
        partnerProfileText: selectedPartner?.profileText || '',
        recentLog: recentLog.trim(),
        draft: draft.trim(),
        goal: 'auto', // 自動判定
        tone: 'auto', // 自動判定
        emojiPolicy: settings.emojiPolicy,
        userEmojiHints,
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      // 結果整形
      setLoadingStep('formatting');

      const json: AnalyzeResponse = await response.json();

      if (!json.success || !json.data) {
        throw new Error(json.error?.message || '添削に失敗しました');
      }

      setResult(json.data);
      setRetrievedRuleCards(json.retrievedRuleCards);
      toast.success('添削が完了しました');

      // スコアを保存（パートナー選択時のみ）
      if (selectedPartner) {
        updateScores(selectedPartner.id, {
          warmthMatch: json.data.scores.warmthMatch,
          pressureRisk: json.data.scores.pressureRisk,
          clarity: json.data.scores.clarity,
        });
      }
    } catch (err) {
      // キャンセルの場合はエラーを表示しない
      if (err instanceof Error && err.name === 'AbortError') {
        toast.info('分析をキャンセルしました');
        return;
      }
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(message);
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // シェア機能
  const handleShare = async () => {
    if (!result) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MessageCoach - 分析結果',
          text: `温度感: ${result.scores.warmthMatch}点\n明確さ: ${result.scores.clarity}点\n誠実さ: ${result.scores.sincerity}点`,
        });
      } else {
        // フォールバック: クリップボードにコピー
        const shareText = `【MessageCoach 分析結果】\n温度感: ${result.scores.warmthMatch}点\n明確さ: ${result.scores.clarity}点\n誠実さ: ${result.scores.sincerity}点`;
        await navigator.clipboard.writeText(shareText);
        toast.success('結果をコピーしました');
      }
    } catch {
      // シェアがキャンセルされた場合など
    }
  };

  // 履歴に保存
  const handleSaveToHistory = () => {
    if (!result) return;

    addEntry(result, {
      partnerId: selectedPartnerId || undefined,
      partnerName: selectedPartner?.partnerName || 'ゲスト',
      draft,
      goal: 'auto',
    });

    toast.success('履歴に保存しました');
    router.push('/history');
  };

  // 結果表示時
  if (result) {
    return (
      <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center bg-background/80 backdrop-blur-md p-4 border-b border-primary/10">
          <button
            onClick={() => setResult(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          >
            <MaterialIcon name="arrow_back" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold tracking-tight pr-10">分析完了</h1>
        </header>

        <main className="flex flex-col gap-6 p-4">
          <ResultsDisplay result={result} draft={draft} retrievedRuleCards={retrievedRuleCards} />

          {/* ゲスト添削後の保存導線 */}
          {!selectedPartner && (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                この相手を保存すると、次回から直近ログだけで添削できます
              </p>
              <Link
                href="/submit?mode=profile"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <MaterialIcon name="person_add" size="sm" />
                相手を保存する
              </Link>
            </div>
          )}
        </main>

        {/* Fixed Footer Actions */}
        <footer className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-background p-4 border-t border-border flex gap-3">
          <button
            onClick={handleSaveToHistory}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-primary-foreground font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            <MaterialIcon name="history" />
            履歴に保存する
          </button>
          <button
            onClick={handleShare}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <MaterialIcon name="share" />
          </button>
        </footer>

        {/* Bottom accent bar */}
        <div className="fixed bottom-0 left-0 right-0 z-0 h-2 bg-primary/20" />
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-card">
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-center">
          <h1 className="text-lg font-bold tracking-tight">分析中...</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <LoadingState currentStep={loadingStep} onCancel={handleCancel} />
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-card shadow-xl overflow-hidden relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <MaterialIcon name="arrow_back" className="text-muted-foreground" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">会話を分析</h1>
        <Link
          href="/guide"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <MaterialIcon name="help_outline" className="text-muted-foreground" />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
        {/* Step Indicators */}
        <StepIndicator currentStep={currentStep} totalSteps={4} />

        {/* Section 1: Partner Selection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              1. 相手を選ぶ
            </h2>
            <MaterialIcon
              name="info"
              size="sm"
              className="text-muted-foreground/50 cursor-help"
            />
          </div>
          <PartnerSelector
            partners={partners}
            selectedId={selectedPartnerId}
            onSelect={setSelectedPartnerId}
            onAddNew={() => router.push('/submit?mode=profile')}
          />
        </section>

        {/* Section 2: OCR Uploader */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              2. 会話の履歴
            </h2>
          </div>
          <OcrDropZone
            onFilesSelected={handleOcrFiles}
            isProcessing={ocrProcessing}
            ocrText={ocrText}
            onUseText={handleUseOcrText}
          />
        </section>

        {/* Section 3: Recent Log Text Area */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              3. 直近のメッセージ（任意）
            </h2>
          </div>
          <div className="relative">
            <textarea
              value={recentLog}
              onChange={(e) => setRecentLog(e.target.value)}
              placeholder="スクリーンショットがない場合は、直近の数件のメッセージをここに貼り付けてください..."
              rows={3}
              className="w-full bg-muted border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60 transition-all resize-none"
            />
          </div>
        </section>

        {/* Section 4: Draft Message */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              4. あなたの下書き
            </h2>
          </div>
          <div className="relative">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 500))}
              placeholder="ここに送信予定のメッセージを入力してください..."
              rows={5}
              className="w-full bg-muted border-2 border-transparent rounded-xl p-4 text-sm focus:border-primary/50 focus:ring-0 placeholder:text-muted-foreground/60 transition-all resize-none font-medium"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-mono">
                {draft.length} / 500
              </span>
            </div>
          </div>
        </section>

        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </main>

      {/* Fixed Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/95 to-transparent">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !draft.trim()}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          <MaterialIcon name="auto_awesome" size="sm" />
          メッセージを分析する
        </button>
      </div>
    </div>
  );
}
