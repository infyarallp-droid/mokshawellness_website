import crypto from 'node:crypto';
import { site } from '@/content/site';

// Google OAuth 2.0 (authorization code + PKCE). This server holds the client
// secret and exchanges the code; the admin API then verifies the ID token
// independently against Google's keys before trusting it.

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret, redirectUri: `${site.url.replace(/\/+$/, '')}/api/auth/google/callback` } : null;
}

export function pkce() {
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge, state: crypto.randomBytes(24).toString('base64url') };
}

export function authorizeUrl(cfg: NonNullable<ReturnType<typeof googleConfig>>, state: string, challenge: string) {
  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();
  return u.toString();
}

/** Exchange the authorization code for Google's ID token. */
export async function exchangeCode(cfg: NonNullable<ReturnType<typeof googleConfig>>, code: string, verifier: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.redirectUri,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!res?.ok) {
    console.error('[google] token exchange failed', res?.status);
    return null;
  }
  const json = (await res.json()) as { id_token?: string };
  return json.id_token ?? null;
}
