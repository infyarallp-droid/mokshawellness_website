import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthShell, { Divider, GoogleButton } from '@/components/auth/AuthShell';
import { SignupForm } from '@/components/auth/forms';
import { getSite } from '@/lib/content';
import { getSessionToken, safeNext } from '@/lib/server/session';

export const metadata: Metadata = { title: 'Create an account', robots: { index: false } };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await getSessionToken()) redirect(next);
  const google = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  const site = await getSite();
  const policies = { terms: !!site.legal('legal.terms'), privacy: !!site.legal('legal.privacy') };
  return (
    <AuthShell
      title="Create your account"
      subtitle="Keep track of your classes, download receipts and pay online."
      footer={
        <>
          Already have an account?{' '}
          <Link href={`/login${sp.next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-forest underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      {google && (
        <>
          <GoogleButton href={`/api/auth/google?next=${encodeURIComponent(next)}`} label="Sign up with Google" />
          <p className="mt-2 text-center text-xs text-ink/50">You will be asked for your mobile number next.</p>
          <Divider />
        </>
      )}
      <SignupForm next={next} policies={policies} />
    </AuthShell>
  );
}
