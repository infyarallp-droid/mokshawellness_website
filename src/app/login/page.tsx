import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthShell, { Divider, GoogleButton, urlError } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/forms';
import { getSessionToken, safeNext } from '@/lib/server/session';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getSessionToken()) redirect(next);
  const error = urlError(sp.error);
  const google = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your classes, invoices and receipts, and to pay online."
      footer={
        <>
          New here?{' '}
          <Link href={`/signup${sp.next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-forest underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}
      {google && (
        <>
          <GoogleButton href={`/api/auth/google?next=${encodeURIComponent(next)}`} />
          <Divider />
        </>
      )}
      <LoginForm next={next} />
    </AuthShell>
  );
}
