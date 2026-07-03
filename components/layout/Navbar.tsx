'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/interview/new', label: 'New Interview' },
  { href: '/history', label: 'History' },
  { href: '/analytics', label: 'Analytics' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/20 text-primary-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold text-white">Interview<span className="text-primary-300">Trainer</span></span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  pathname.startsWith(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 rounded-full border border-border bg-white/5 py-1 pl-1 pr-3 text-sm text-white/80 hover:bg-white/10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/30 text-xs font-semibold text-primary-200">
                  {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                </span>
                Lvl {user.level}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logout();
                  router.push('/');
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
