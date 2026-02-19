'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ProfileResponse, Partner } from '@/types/analysis';
import { usePartners } from '@/hooks/usePartners';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingState } from './LoadingState';

interface ProfileFormProps {
  existingPartner?: Partner | null;
}

type InputMode = 'text' | 'file' | 'ocr';

export function ProfileForm({ existingPartner }: ProfileFormProps) {
  const router = useRouter();
  const { addPartner, updatePartner } = usePartners();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  // フォーム状態
  const [partnerName, setPartnerName] = useState(existingPartner?.partnerName || '');
  const [chatLogFull, setChatLogFull] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('text');

  // OCR状態
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  // 送信状態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [savedPartnerId, setSavedPartnerId] = useState<string | null>(null);

  const chatLogLength = chatLogFull.length;

  // テキストファイル読み込み
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const trimmed = text.slice(0, 20000);
      setChatLogFull(trimmed);
      setInputMode('text');
      toast.success('ファイルを読み込みました');
    } catch {
      toast.error('ファイルの読み込みに失敗しました');
    }
  };

  // OCRファイル処理
  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setOcrProcessing(true);
    setOcrProgress(0);
    setOcrPreview(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      // 進捗シミュレーション
      const progressInterval = setInterval(() => {
        setOcrProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setOcrProgress(100);

      const json = await response.json();

      if (!json.success || !json.data?.text) {
        throw new Error(json.error?.message || 'OCR処理に失敗しました');
      }

      setOcrPreview(json.data.text.slice(0, 200) + '...');
      setChatLogFull(json.data.text.slice(0, 20000));
      toast.success('画像を読み取りました');

      if (json.data.warnings?.length > 0) {
        toast.warning(json.data.warnings[0]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR処理に失敗しました';
      toast.error(message);
    } finally {
      setOcrProcessing(false);
      setOcrProgress(0);
    }
  };

  // 送信処理
  const handleSubmit = async () => {
    // バリデーション
    if (!partnerName.trim()) {
      toast.error('相手の名前を入力してください');
      return;
    }
    if (!chatLogFull.trim()) {
      toast.error('会話ログを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partnerName.trim(),
          chatLogFull: chatLogFull.trim(),
        }),
      });

      const json: ProfileResponse = await response.json();

      if (!json.success || !json.data) {
        throw new Error(json.error?.message || 'プロファイル作成に失敗しました');
      }

      // localStorageに保存
      if (existingPartner) {
        const result = updatePartner(existingPartner.id, {
          partnerName: partnerName.trim(),
          profileText: json.data.profileText,
        });

        if ('error' in result) {
          throw new Error(result.error);
        }
        setSavedPartnerId(existingPartner.id);
      } else {
        const result = addPartner(partnerName.trim(), json.data.profileText);

        if ('error' in result) {
          throw new Error(result.error);
        }
        setSavedPartnerId(result.id);
      }

      setSuccess(true);
      toast.success(`プロファイルを${existingPartner ? '更新' : '作成'}しました`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(message);
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 成功時の表示
  if (success && savedPartnerId) {
    return (
      <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center bg-background/80 backdrop-blur-md p-4 border-b border-primary/10">
          <button
            onClick={() => router.push('/partners')}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          >
            <MaterialIcon name="arrow_back" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold tracking-tight pr-10">登録完了</h1>
        </header>

        <main className="flex-1 p-4 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <MaterialIcon name="check_circle" className="text-primary text-4xl" />
            </div>
            <h2 className="text-xl font-bold">
              {existingPartner ? 'プロファイルを更新しました' : 'プロファイルを作成しました'}
            </h2>
            <p className="text-sm text-muted-foreground">
              この相手との会話を添削できるようになりました
            </p>
          </div>

          <div className="w-full space-y-3">
            <Link
              href={`/submit?partnerId=${savedPartnerId}&mode=analyze`}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <MaterialIcon name="edit" />
              この相手で添削する
            </Link>
            <Link
              href="/partners"
              className="w-full bg-muted hover:bg-muted/80 text-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <MaterialIcon name="group" />
              相手一覧に戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ローディング時
  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 border-b border-primary/10">
          <h1 className="text-lg font-bold tracking-tight">プロファイル作成中...</h1>
        </header>
        <main className="flex-1 p-4">
          <LoadingState />
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          >
            <MaterialIcon name="arrow_back" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold tracking-tight pr-10">相手を登録</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-primary/10 bg-card">
        <Link
          href="/submit?mode=analyze"
          className="flex flex-col items-center justify-center border-b-2 border-transparent text-muted-foreground py-4 flex-1 hover:text-primary transition-colors"
        >
          <p className="text-sm font-bold">添削</p>
        </Link>
        <div className="flex flex-col items-center justify-center border-b-2 border-primary text-primary py-4 flex-1">
          <p className="text-sm font-bold">相手を新しく登録する</p>
        </div>
      </div>

      <main className="flex-1 p-4 space-y-6">
        {/* Information Box */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <MaterialIcon name="info" size="sm" />
              <p className="text-base font-bold">プロフィール編集</p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AIがあなたと大切なお相手との会話を読み解き、コミュニケーションのヒントを見つけます。
              最初だけ少し長めのログをいただけると、より正確なアドバイスができます。
              お預かりした内容は大切に分析し、要約したプロフィールのみを保存します。
              元の会話ログは保存されませんので、どうぞご安心くださいね。
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-5">
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold flex items-center gap-1">
              どなたを登録しますか？
              <span className="text-xs font-normal text-primary/70">(お名前を教えてください)</span>
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="例: ゆい"
              className="w-full rounded-lg border border-primary/20 bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 p-4 text-base transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Input Mode Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1 ${
                inputMode === 'text'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-primary/20 hover:border-primary'
              }`}
            >
              <MaterialIcon name="edit_note" size="sm" />
              テキスト入力
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 text-xs font-bold rounded-full bg-card text-muted-foreground border border-primary/20 hover:border-primary transition-all"
            >
              テキストファイル
            </button>
            <button
              onClick={() => ocrInputRef.current?.click()}
              className="flex-1 py-2 px-3 text-xs font-bold rounded-full bg-card text-muted-foreground border border-primary/20 hover:border-primary transition-all"
            >
              スクショ(OCR)
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.text"
            className="hidden"
            onChange={handleFileUpload}
          />
          <input
            ref={ocrInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleOcrUpload}
          />

          {/* Log Input Area */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold flex items-center gap-1">
              最近の会話の内容を教えてください
              <span className="text-xs font-normal text-primary/70">(最大 20,000文字まで)</span>
            </label>
            <div className="relative">
              <textarea
                value={chatLogFull}
                onChange={(e) => setChatLogFull(e.target.value.slice(0, 20000))}
                placeholder="LINEやメッセージの会話をそのまま貼り付けてください..."
                className="w-full min-h-[300px] rounded-lg border border-primary/20 bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 p-4 text-base transition-all placeholder:text-muted-foreground resize-none"
              />
              <div className="absolute bottom-3 right-3 bg-card/80 px-2 py-1 rounded text-[10px] font-medium text-muted-foreground border border-border">
                {chatLogLength.toLocaleString()} / 20,000
              </div>
            </div>
          </div>

          {/* OCR Upload Area */}
          <div className="space-y-4">
            <div
              onClick={() => ocrInputRef.current?.click()}
              className="border-2 border-dashed border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center bg-card hover:border-primary/40 transition-colors cursor-pointer"
            >
              <MaterialIcon name="add_photo_alternate" className="text-4xl text-primary/40 mb-2" />
              <p className="text-sm text-muted-foreground">スクリーンショットを追加（複数可）</p>
            </div>

            {/* OCR Progress */}
            {ocrProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>画像の読み取り中...</span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full shadow-[0_0_8px_rgba(25,212,230,0.5)] transition-all"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* OCR Preview */}
            {ocrPreview && (
              <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                <p className="text-[10px] font-bold text-primary mb-2">取り込み内容のプレビュー</p>
                <div className="text-xs text-muted-foreground italic line-clamp-3 mb-3">
                  {ocrPreview}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-primary/80 bg-card p-2 rounded border border-primary/10">
                  <MaterialIcon name="verified_user" size="sm" />
                  <span>保存されるのは解析されたテキストだけですのでご安心ください。</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !partnerName.trim() || !chatLogFull.trim()}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MaterialIcon name="favorite" />
            この内容でプロフィールを作成する
          </button>
        </div>

        {/* Footer Section */}
        <footer className="mt-12 text-center space-y-4 pb-10">
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary underline">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-primary underline">
              利用規約
            </Link>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1">
              <MaterialIcon name="bolt" size="sm" />
              Powered by OpenAI
            </p>
            <p className="text-[10px] text-muted-foreground/70">© 2025 MessageCoach</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
