import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import { GoogleMobileForm } from '@/components/auth/forms';
import { GOOGLE_PENDING_COOKIE } from '@/lib/server/session';

export const metadata: Metadata = { title: 'Add your mobile number', robots: { index: false } };

// The mandatory second step for new Google sign-ups: no account exists until a mobile number is added.
export default async function GoogleMobilePage() {
  let pending: { name?: string; email?: string } | null = null;
  try {
    pending = JSON.parse((await cookies()).get(GOOGLE_PENDING_COOKIE)?.value ?? '');
  } catch {
    pending = null;
  }
  if (!pending) {
    return (
      <AuthShell title="Sign-in expired" subtitle="Please start again.">
        <Link href="/login" className="btn-primary w-full">
          Back to sign in
        </Link>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="One last step" subtitle="Add your mobile number to finish creating your account.">
      <GoogleMobileForm name={pending.name ?? ''} email={pending.email ?? ''} />
    </AuthShell>
  );
}
