'use client';

import { useState, useRef, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/utils';

interface OcrDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  ocrText?: string;
  onUseText?: () => void;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function OcrDropZone({
  onFilesSelected,
  isProcessing,
  ocrText,
  onUseText,
}: OcrDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // iOS フォールバック: 写真ライブラリから戻った時に onChange が消失するケースに対応
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        if (inputRef.current && inputRef.current.files && inputRef.current.files.length > 0) {
          const syntheticEvent = { target: inputRef.current } as unknown as React.ChangeEvent<HTMLInputElement>;
          handleFileChange(syntheticEvent);
        }
      }, 500);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFiles = (files: File[]): File[] => {
    setError(null);
    const valid: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルのみ対応しています');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('ファイルサイズは5MB以下にしてください');
        continue;
      }
      valid.push(file);
    }

    if (valid.length > MAX_FILES) {
      setError(`最大${MAX_FILES}枚まで選択できます`);
      return valid.slice(0, MAX_FILES);
    }

    return valid;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = validateFiles(files);
    if (valid.length > 0) {
      onFilesSelected(valid);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const valid = validateFiles(files);
    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  };

  return (
    <div className="space-y-2">
      {ocrText ? (
        /* OCR結果がある場合 */
        <div className="space-y-3">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <MaterialIcon name="check_circle" className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">読み取り完了</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {ocrText.slice(0, 100)}...
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onUseText}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              このテキストを使う
            </button>
            <div className="relative rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
              再読込
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>
        </div>
      ) : isProcessing ? (
        /* 処理中 */
        <div className="rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MaterialIcon
                name="progress_activity"
                className="animate-spin text-primary"
              />
            </div>
            <p className="font-medium text-foreground">読み取り中...</p>
            <p className="text-xs text-muted-foreground">
              画像からテキストを抽出しています
            </p>
          </div>
        </div>
      ) : (
        /* 初期アップロードゾーン */
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'group relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <MaterialIcon name="add_a_photo" />
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <MaterialIcon name="gallery_thumbnail" />
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground">
                  スクショをアップ
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  AIが実際のチャットから雰囲気を読み取り、
                  <br />
                  トーンを合わせます。
                </p>
              </div>
            </div>

            {/* 透明inputを全面に被せる（iOS Safari 対応） */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <MaterialIcon name="error" size="sm" className="text-[14px]" />
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
