'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ProfileForm } from '@/components/analyze/ProfileForm';
import { AnalyzeFormV2 } from '@/components/analyze/AnalyzeFormV2';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { getPartnerById } from '@/lib/storage';

function SubmitContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'analyze';
  const partnerId = searchParams.get('partnerId');

  const existingPartner = partnerId ? getPartnerById(partnerId) : null;

  // analyzeモードは独自レイアウト
  if (mode === 'analyze') {
    return <AnalyzeFormV2 partnerId={partnerId || undefined} />;
  }

  // profileモードも独自レイアウト（ProfileForm内で完結）
  return <ProfileForm existingPartner={existingPartner} />;
}

export default function SubmitPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="max-w-md mx-auto min-h-screen flex flex-col bg-card">
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </div>
        }
      >
        <SubmitContent />
      </Suspense>
      <BottomNavigation />
    </>
  );
}
