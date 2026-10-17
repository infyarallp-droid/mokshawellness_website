'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AccountNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/');
    router.refresh();
  };
  const tabs = [
    { href: '/account', label: 'Overview' },
    { href: '/account/settings', label: 'Settings' },
  ];
  return (
    <div className="flex flex-col gap-4 border-b border-forest/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">My account</p>
        <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Namaste, {name.split(' ')[0]}</h1>
      </div>
      <nav aria-label="Account" className="flex flex-wrap items-center gap-1">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={pathname === t.href ? 'page' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium ${pathname === t.href ? 'bg-forest text-cream' : 'text-forest hover:bg-forest/5'}`}
          >
            {t.label}
          </Link>
        ))}
        <button type="button" onClick={logout} disabled={busy} className="rounded-full px-4 py-2 text-sm font-medium text-clay hover:bg-clay/5">
          {busy ? 'Signing out…' : 'Sign out'}
        </button>
      </nav>
    </div>
  );
}
