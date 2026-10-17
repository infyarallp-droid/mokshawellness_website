import type { Metadata } from 'next';
import AccountNav from '@/components/account/AccountNav';
import Settings from '@/components/account/Settings';
import { urlError } from '@/components/auth/AuthShell';
import { loadForAccount, type AccountInfo } from '@/lib/server/account';

export const metadata: Metadata = { title: 'Account settings', robots: { index: false } };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ google?: string; error?: string; 'change-password'?: string }> }) {
  const sp = await searchParams;
  const info = await loadForAccount<AccountInfo>('/api/account', '/account/settings');
  const notice = sp.google === 'connected' ? 'Google is now connected — you can use it to sign in.' : urlError(sp.error);
  return (
    <div className="container-page space-y-8 py-10 sm:py-14">
      <AccountNav name={info.account.fullName} />
      <Settings info={info} focusPassword={!!sp['change-password']} notice={notice} />
    </div>
  );
}
