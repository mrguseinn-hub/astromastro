'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/entities', label: 'Entities', icon: '🌟' },
  { href: '/admin/interpretations', label: 'Interpretations', icon: '📖' },
  { href: '/admin/language-bank', label: 'Language Bank', icon: '💬' },
  { href: '/admin/rules', label: 'Combination Rules', icon: '🔗' },
  { href: '/admin/readings', label: 'Readings', icon: '📜' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== '/admin' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? 'white' : 'var(--foreground)',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}