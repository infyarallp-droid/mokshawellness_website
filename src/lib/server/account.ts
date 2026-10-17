import { redirect } from 'next/navigation';
import { AdminApiError, adminJson } from './admin-api';
import { getSessionToken } from './session';

export interface AccountInfo {
  account: {
    id: string;
    fullName: string;
    mobile: string;
    email: string | null;
    signupMethod: 'MOBILE_PASSWORD' | 'GOOGLE';
    hasPassword: boolean;
    mustChangePassword: boolean;
    linkedToStudent: boolean;
    google: string | null;
    createdAt: string;
  };
  student: { fullName: string; studentCode: string | null } | null;
  whatsapp: { optedIn: boolean; consentText: string };
  payments: { enabled: boolean; mode: 'test' | 'live' | null; keyId: string | null };
}

/** Load something for the signed-in visitor, or send them to sign in. */
export async function loadForAccount<T>(path: string, returnTo: string): Promise<T> {
  const session = await getSessionToken();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  try {
    return await adminJson<T>(path, { session });
  } catch (err) {
    if (err instanceof AdminApiError && (err.status === 401 || err.status === 403)) {
      redirect(`/api/auth/session-expired?next=${encodeURIComponent(returnTo)}`);
    }
    throw err;
  }
}
