import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t mt-auto', className)}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 MessageCoach</p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              利用規約
            </Link>
          </nav>
          <p>Powered by OpenAI</p>
        </div>
      </div>
    </footer>
  );
}
