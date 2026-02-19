'use client';

import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNavigation } from './BottomNavigation';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn(
        'flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8',
        'pb-bottom-nav md:pb-8', // ボトムナビ分のパディング
        className
      )}>
        {children}
      </main>
      <Footer className="hidden md:block" />
      <BottomNavigation />
    </div>
  );
}
