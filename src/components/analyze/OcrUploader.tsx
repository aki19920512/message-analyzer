'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { OcrResponse } from '@/types/analysis';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const RECENT_LOG_MAX = 6000;

interface OcrUploaderProps {
  onTextExtracted: (text: string) => void;
}

export function OcrUploader({ onTextExtracted }: OcrUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // プレビューURLのクリーンアップ
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError(null);

    // 合計枚数チェック
    const totalFiles = files.length + selectedFiles.length;
    if (totalFiles > MAX_FILES) {
      setError(`画像は最大${MAX_FILES}枚までです。`);
      return;
    }

    // 各ファイルのバリデーション
    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`対応形式: PNG, JPG, WEBP（${file.name} は非対応です）`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`ファイルサイズは1枚あたり5MBまでです（${file.name}）`);
        return;
      }
    }

    // プレビュー生成
    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // input をリセット（同じファイルを再選択可能にする）
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOcr = async () => {
    if (files.length === 0) {
      setError('画像を選択してください。');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOcrText('');
    setOcrWarnings([]);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const json: OcrResponse = await response.json();

      if (!json.success || !json.data) {
        throw new Error(json.error?.message || '画像の読み取りに失敗しました');
      }

      setOcrText(json.data.text);
      setOcrWarnings(json.data.warnings);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseText = () => {
    if (!ocrText.trim()) {
      setError('読み取り結果が空です。');
      return;
    }

    // 6000文字超の場合は先頭をトリム（最新のメッセージを優先）
    const trimmed =
      ocrText.length > RECENT_LOG_MAX
        ? ocrText.slice(ocrText.length - RECENT_LOG_MAX)
        : ocrText;

    onTextExtracted(trimmed);
  };

  const ocrTextLength = ocrText.length;

  return (
    <div className="space-y-4">
      {/* 注意書き */}
      <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground space-y-1">
        <p>
          スクリーンショットから会話テキストをAIで読み取ります。
        </p>
        <p className="text-xs">
          ・固有名詞（本名など）が含まれる場合は、読み取り後に伏せてください
          <br />
          ・誤読の可能性があるので<strong>必ず結果を確認</strong>してください
          <br />
          ・スタンプは [スタンプ] と表示されます
        </p>
      </div>

      {/* ファイル選択 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= MAX_FILES || isProcessing}
          >
            <ImagePlus className="size-4" />
            画像を選択
          </Button>
          <span className="text-xs text-muted-foreground">
            PNG / JPG / WEBP　最大{MAX_FILES}枚・各5MB
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* プレビュー */}
        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group rounded-md overflow-hidden border w-20 h-20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt={`スクリーンショット ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/60 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`${file.name}を削除`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* OCR実行ボタン */}
        {files.length > 0 && !ocrText && (
          <Button
            type="button"
            onClick={handleOcr}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing && <Loader2 className="animate-spin" />}
            {isProcessing ? '読み取り中...' : '読み取る（OCR）'}
          </Button>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* OCR結果 */}
      {ocrText && (
        <div className="space-y-3">
          <div className="text-sm font-medium">読み取り結果（編集できます）</div>

          {/* 警告 */}
          {ocrWarnings.length > 0 && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-200">
              {ocrWarnings.map((w, i) => (
                <p key={i}>⚠ {w}</p>
              ))}
            </div>
          )}

          <Textarea
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            className="min-h-[180px] font-mono text-sm"
            placeholder="読み取り結果が表示されます..."
          />

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {ocrTextLength > RECENT_LOG_MAX && (
                <span className="text-destructive">
                  ※ {RECENT_LOG_MAX.toLocaleString()}文字を超えた分は先頭からカットされます
                </span>
              )}
            </span>
            <span
              className={ocrTextLength > RECENT_LOG_MAX ? 'text-destructive' : ''}
            >
              {ocrTextLength.toLocaleString()}/{RECENT_LOG_MAX.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUseText}
              className="flex-1"
            >
              このテキストを直近ログに使う
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleOcr}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="animate-spin" />}
              再読み取り
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
