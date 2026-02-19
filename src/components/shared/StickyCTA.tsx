'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StickyCTAProps {
  children: React.ReactNode;
  formId: string;
  isLoading?: boolean;
  buttonLabel?: string;
  loadingLabel?: string;
}

export function StickyCTA({
  children,
  formId,
  isLoading = false,
  buttonLabel = '添削する',
  loadingLabel = '添削中...',
}: StickyCTAProps) {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Original button position */}
      <div ref={sentinelRef}>
        {children}
      </div>

      {/* Sticky mobile CTA */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-40 md:hidden transition-transform duration-200',
          isSticky ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <button
          type="submit"
          form={formId}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? loadingLabel : buttonLabel}
        </button>
      </div>
    </>
  );
}
