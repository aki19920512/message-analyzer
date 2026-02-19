'use client';

import { usePartners } from '@/hooks/usePartners';
import { PartnerList } from '@/components/partners/PartnerList';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/skeleton';

export default function PartnersPage() {
  const { partners, isLoading, deletePartner } = usePartners();

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PartnerList partners={partners} onDelete={deletePartner} />
    </AppShell>
  );
}
