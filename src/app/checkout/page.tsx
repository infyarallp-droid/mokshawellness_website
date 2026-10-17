import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import PayButton from '@/components/account/PayButton';
import { getSite, rupees } from '@/lib/content';
import { loadForAccount, type AccountInfo } from '@/lib/server/account';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ invoice?: string; plan?: string }> }) {
  const sp = await searchParams;
  const returnTo = `/checkout?${sp.invoice ? `invoice=${encodeURIComponent(sp.invoice)}` : `plan=${encodeURIComponent(sp.plan ?? '')}`}`;
  const info = await loadForAccount<AccountInfo>('/api/account', returnTo);

  if (!info.payments.enabled) {
    return (
      <AuthShell title="Online payments are not available yet" subtitle="Please pay at the studio, or contact us for bank details.">
        <Link href="/account" className="btn-primary w-full">
          Back to my account
        </Link>
      </AuthShell>
    );
  }
  const testMode = info.payments.mode === 'test';

  if (sp.invoice) {
    const dash = await loadForAccount<{ invoices: { id: string; invoiceNo: string; status: string; totalPaise: string; paidPaise: string; balancePaise: string; items: string[] }[] }>(
      '/api/account/dashboard',
      returnTo,
    );
    const inv = dash.invoices.find((i) => i.id === sp.invoice);
    if (!inv || Number(inv.balancePaise) <= 0 || inv.status === 'CANCELLED') {
      return (
        <AuthShell title="Nothing to pay" subtitle="This invoice is already settled or could not be found.">
          <Link href="/account" className="btn-primary w-full">
            Back to my account
          </Link>
        </AuthShell>
      );
    }
    return (
      <AuthShell title="Pay your invoice" subtitle={`Invoice ${inv.invoiceNo}`}>
        {testMode && <TestModeNote />}
        <dl className="mb-6 space-y-2 text-sm">
          <Row label="For" value={inv.items.join(', ')} />
          <Row label="Invoice total" value={rupees(inv.totalPaise)} />
          {Number(inv.paidPaise) > 0 && <Row label="Already paid" value={rupees(inv.paidPaise)} />}
          <div className="flex justify-between border-t border-forest/10 pt-3 text-base">
            <dt className="font-semibold">To pay now</dt>
            <dd className="font-display text-2xl text-forest">{rupees(inv.balancePaise)}</dd>
          </div>
        </dl>
        <PayButton request={{ invoiceId: inv.id }} label={`Pay ${rupees(inv.balancePaise)}`} />
      </AuthShell>
    );
  }

  const site = await getSite();
  const programme = site.programmes.find((p) => p.onlinePlans.some((pl) => pl.id === sp.plan));
  const plan = programme?.onlinePlans.find((pl) => pl.id === sp.plan);
  if (!programme || !plan) {
    return (
      <AuthShell title="This plan is not available online" subtitle="It may have changed. Please choose again or contact the studio.">
        <Link href="/classes" className="btn-primary w-full">
          See classes
        </Link>
      </AuthShell>
    );
  }
  const today = istToday();
  const tax = site.taxPercent > 0 ? Math.round(Number(plan.pricePaise) * (site.taxPercent / 100)) : 0;
  return (
    <AuthShell title={programme.name} subtitle={`${plan.title}${programme.mode ? ` · ${programme.mode}` : ''}`}>
      {testMode && <TestModeNote />}
      <dl className="mb-6 space-y-2 text-sm">
        <Row label="Plan fee" value={rupees(plan.pricePaise)} />
        {tax > 0 && <Row label={`Tax (${site.taxPercent}%)`} value={rupees(tax)} />}
        <div className="flex justify-between border-t border-forest/10 pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-2xl text-forest">{rupees(Number(plan.pricePaise) + tax)}</dd>
        </div>
      </dl>
      <PayButton request={{ coursePlanId: plan.id }} needsStartDate minDate={today} maxDate={addDays(today, 90)} label={`Pay ${rupees(Number(plan.pricePaise) + tax)} and enrol`} />
      <p className="mt-4 text-center text-xs text-ink/50">
        Your enrolment, invoice and receipt are created as soon as the payment is confirmed. The studio will share your class timing.{site.legal('legal.refunds') ? ' ' : ''}
        {site.legal('legal.refunds') && (
          <Link href="/refund-policy" className="underline">
            Cancellation policy
          </Link>
        )}
      </p>
    </AuthShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}

function TestModeNote() {
  return (
    <p className="mb-5 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
      <strong>Test mode:</strong> no real money is charged. Use Razorpay test cards or the test UPI id <code>success@razorpay</code>.
    </p>
  );
}
