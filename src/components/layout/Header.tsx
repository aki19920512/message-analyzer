'use client';

import Link from 'next/link';
import { NavLink } from './NavLink';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

const NAV_ITEMS = [
  { href: '/', label: 'ホーム' },
  { href: '/partners', label: '相手一覧' },
  { href: '/submit?mode=analyze', label: '添削' },
  { href: '/history', label: '履歴' },
  { href: '/guide', label: '使い方' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-8 items-center justify-center rounded-lg text-white" style={{ background: '#F472B6' }}>
            <MaterialIcon name="favorite" size="sm" filled />
          </div>
          <span className="font-semibold text-lg transition-colors" style={{ color: 'inherit' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F472B6')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '')}>
            オクルン
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile: 添削ボタン（BottomNavがあるので最小限） */}
        <Link
          href="/submit?mode=analyze"
          className="flex md:hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <MaterialIcon name="edit" size="sm" />
          オクルンする
        </Link>
      </div>
    </header>
  );
}
