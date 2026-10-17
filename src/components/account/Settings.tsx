'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import type { AccountInfo } from '@/lib/server/account';

async function request(path: string, method: string, body?: unknown) {
  const res = await fetch(`/api/account/${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) throw Object.assign(new Error('Your session has ended. Please sign in again.'), { signedOut: true });
  if (!res.ok || json.ok === false) throw new Error(json.error ?? 'Something went wrong. Please try again.');
  return json;
}

function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-3xl border border-forest/10 bg-white/80 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <h2 className="text-xl font-medium">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-ink/60">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function Status({ ok, error }: { ok: string | null; error: string | null }) {
  if (error)
    return (
      <p role="alert" className="mt-3 text-sm text-clay">
        {error}
      </p>
    );
  if (ok)
    return (
      <p role="status" className="mt-3 text-sm text-forest">
        {ok}
      </p>
    );
  return null;
}

export default function Settings({ info, focusPassword, notice }: { info: AccountInfo; focusPassword: boolean; notice: string | null }) {
  const router = useRouter();
  const a = info.account;
  // Session ended in another tab or was revoked: go to sign-in.
  const call = (path: string, method: string, body?: unknown) =>
    request(path, method, body).catch((err: Error & { signedOut?: boolean }) => {
      if (err.signedOut) router.push('/login?next=/account/settings');
      throw err;
    });

  // Profile
  const [profile, setProfile] = useState({ fullName: a.fullName, email: a.email ?? '' });
  const [pState, setPState] = useState<{ ok: string | null; error: string | null; busy: boolean }>({ ok: null, error: null, busy: false });
  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setPState({ ok: null, error: null, busy: true });
    try {
      await call('profile', 'PATCH', profile);
      setPState({ ok: 'Saved.', error: null, busy: false });
      router.refresh();
    } catch (err) {
      setPState({ ok: null, error: (err as Error).message, busy: false });
    }
  };

  // Password
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwState, setPwState] = useState<{ ok: string | null; error: string | null; busy: boolean }>({ ok: null, error: null, busy: false });
  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return setPwState({ ok: null, error: 'The two new passwords do not match.', busy: false });
    setPwState({ ok: null, error: null, busy: true });
    try {
      await call('password', 'POST', { currentPassword: a.hasPassword ? pw.currentPassword : undefined, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwState({ ok: 'Password updated. Other devices have been signed out.', error: null, busy: false });
      router.refresh();
    } catch (err) {
      setPwState({ ok: null, error: (err as Error).message, busy: false });
    }
  };

  // WhatsApp
  const [wa, setWa] = useState(info.whatsapp.optedIn);
  const [waState, setWaState] = useState<{ ok: string | null; error: string | null }>({ ok: null, error: null });
  const toggleWa = async (on: boolean) => {
    setWa(on);
    try {
      await call('whatsapp', 'PUT', { optIn: on });
      setWaState({ ok: on ? 'You will receive WhatsApp updates.' : 'WhatsApp updates are off.', error: null });
    } catch (err) {
      setWa(!on);
      setWaState({ ok: null, error: (err as Error).message });
    }
  };

  // Google & sessions
  const [gState, setGState] = useState<{ ok: string | null; error: string | null }>({ ok: null, error: null });
  const disconnectGoogle = async () => {
    try {
      await call('google', 'DELETE');
      setGState({ ok: 'Google disconnected.', error: null });
      router.refresh();
    } catch (err) {
      setGState({ ok: null, error: (err as Error).message });
    }
  };
  const [sState, setSState] = useState<string | null>(null);
  const signOutOthers = async () => {
    try {
      const r = await call('sessions/revoke-others', 'POST', {});
      setSState(r.revoked ? `Signed out of ${r.revoked} other device(s).` : 'No other devices were signed in.');
    } catch (err) {
      setSState((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {notice && <p className="rounded-2xl bg-sage/60 px-5 py-4 text-sm text-forest">{notice}</p>}

      <Section title="Profile" description="Your mobile number is how the studio identifies you. To change it, please contact the studio.">
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink/80">
              Full name
            </label>
            <input id="fullName" className="field" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink/80">
              Email
            </label>
            <input id="email" type="email" className="field" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <p className="text-sm text-ink/60">Mobile: {a.mobile}</p>
          <button className="btn-primary" disabled={pState.busy}>
            {pState.busy ? 'Saving…' : 'Save'}
          </button>
          <Status ok={pState.ok} error={pState.error} />
        </form>
      </Section>

      <Section
        title={a.hasPassword ? 'Password' : 'Set a password'}
        description={a.hasPassword ? 'Changing it signs you out on your other devices.' : 'You sign in with Google. Add a password to also sign in with your mobile number.'}
      >
        <form onSubmit={savePassword} className="space-y-4">
          {a.hasPassword && (
            <div>
              <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-ink/80">
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="field"
                autoComplete="current-password"
                autoFocus={focusPassword}
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              />
            </div>
          )}
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-ink/80">
              New password
            </label>
            <input id="newPassword" type="password" className="field" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            <p className="mt-1 text-xs text-ink/50">At least 8 characters, with a letter and a number.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-ink/80">
              Confirm new password
            </label>
            <input id="confirm" type="password" className="field" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
          <button className="btn-primary" disabled={pwState.busy || !pw.newPassword}>
            {pwState.busy ? 'Saving…' : 'Update password'}
          </button>
          <Status ok={pwState.ok} error={pwState.error} />
        </form>
      </Section>

      <Section title="WhatsApp updates" description="Class reminders, payment updates and studio announcements. You can also reply STOP to any message.">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-forest" checked={wa} onChange={(e) => toggleWa(e.target.checked)} />
          <span className="text-sm leading-relaxed text-ink/80">{info.whatsapp.consentText}</span>
        </label>
        <Status ok={waState.ok} error={waState.error} />
      </Section>

      <Section title="Google sign-in">
        {a.google !== null ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/80">Connected{a.google ? ` as ${a.google}` : ''}.</p>
            <button type="button" className="btn-ghost" onClick={disconnectGoogle} disabled={!a.hasPassword} title={a.hasPassword ? '' : 'Set a password first'}>
              Disconnect
            </button>
          </div>
        ) : (
          <a href="/api/auth/google?mode=link" className="btn-ghost">
            Connect Google
          </a>
        )}
        <Status ok={gState.ok} error={gState.error} />
      </Section>

      <Section title="Devices" description="Signed in on a shared or lost device?">
        <button type="button" className="btn-ghost" onClick={signOutOthers}>
          Sign out of all other devices
        </button>
        {sState && <p className="mt-3 text-sm text-ink/70">{sState}</p>}
      </Section>
    </div>
  );
}
