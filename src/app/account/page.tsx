import type { Metadata } from 'next';
import Link from 'next/link';
import AccountNav from '@/components/account/AccountNav';
import { getSite, rupees } from '@/lib/content';
import { loadForAccount, type AccountInfo } from '@/lib/server/account';

export const metadata: Metadata = { title: 'My account', robots: { index: false } };

interface Dashboard {
  linked: boolean;
  enrollments: { id: string; course: string; plan: string; timing: string | null; startDate: string; endDate: string; status: string; daysRemaining: number }[];
  invoices: { id: string; invoiceNo: string; createdAt: string; dueDate: string | null; status: string; totalPaise: string; paidPaise: string; balancePaise: string; items: string[] }[];
  payments: { id: string; paidAt: string; amountPaise: string; refundedPaise: string; mode: string; invoiceNo: string; receiptId: string | null; receiptNo: string | null }[];
  orders: { id: string; description: string; amountPaise: string; status: string; createdAt: string; paidAt: string | null; failureReason: string | null }[];
}

const ENROLMENT: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Active', cls: 'bg-brand/15 text-forest' },
  UPCOMING: { label: 'Starts soon', cls: 'bg-sky-100 text-sky-800' },
  RENEWAL_DUE: { label: 'Renewal due', cls: 'bg-amber-100 text-amber-800' },
  PENDING_PAYMENT: { label: 'Payment pending', cls: 'bg-amber-100 text-amber-800' },
  EXPIRED: { label: 'Ended', cls: 'bg-ink/10 text-ink/70' },
  RENEWED: { label: 'Renewed', cls: 'bg-ink/10 text-ink/70' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-ink/10 text-ink/70' },
};
const INVOICE: Record<string, { label: string; cls: string }> = {
  PAID: { label: 'Paid', cls: 'bg-brand/15 text-forest' },
  PARTIAL: { label: 'Part paid', cls: 'bg-amber-100 text-amber-800' },
  UNPAID: { label: 'Due', cls: 'bg-clay/10 text-clay' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-ink/10 text-ink/60' },
};
const ORDER: Record<string, string> = { PAID: 'Paid', CREATED: 'Started', ATTEMPTED: 'Not completed', FAILED: 'Failed', EXPIRED: 'Not completed', NEEDS_REVIEW: 'Being checked by the studio' };

const date = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T00:00:00+05:30` : iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '—';

function Pill({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-forest/10 bg-white/80 p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function AccountPage() {
  const [info, dash, site] = await Promise.all([
    loadForAccount<AccountInfo>('/api/account', '/account'),
    loadForAccount<Dashboard>('/api/account/dashboard', '/account'),
    getSite(),
  ]);
  const payOnline = info.payments.enabled;
  const due = dash.invoices.filter((i) => ['UNPAID', 'PARTIAL'].includes(i.status) && Number(i.balancePaise) > 0);
  const onlinePlans = site.programmes.flatMap((p) => p.onlinePlans.map((pl) => ({ ...pl, course: p.name })));

  return (
    <div className="container-page space-y-8 py-10 sm:py-14">
      <AccountNav name={info.account.fullName} />

      {info.account.mustChangePassword && (
        <p className="rounded-2xl bg-amber-100 px-5 py-4 text-sm text-amber-900">
          You signed in with a temporary password.{' '}
          <Link href="/account/settings?change-password=1" className="font-semibold underline">
            Choose a new password
          </Link>
          .
        </p>
      )}

      {!dash.linked && (
        <div className="rounded-3xl bg-sage/50 p-6 sm:p-8">
          <h2 className="text-2xl font-medium">Your studio record will appear here</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink/75">
            Already a student? The studio team will connect this account to your record (mobile {info.account.mobile}) so you can see your classes,
            invoices and receipts here. New to Moksha? {onlinePlans.length ? 'Join a class online below, or ' : ''}
            <Link href="/contact#enquire" className="font-semibold text-forest underline underline-offset-4">
              send us an enquiry
            </Link>
            .
          </p>
        </div>
      )}

      {due.length > 0 && (
        <div className="rounded-3xl bg-forest p-6 text-cream sm:p-8">
          <h2 className="text-2xl font-medium text-cream">Payment due</h2>
          <ul className="mt-4 space-y-3">
            {due.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-cream/15 pt-3">
                <span>
                  <span className="block font-medium">{i.items.join(', ')}</span>
                  <span className="text-sm text-cream/70">
                    Invoice {i.invoiceNo}
                    {i.dueDate ? ` · due ${date(i.dueDate)}` : ''}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-display text-2xl">{rupees(i.balancePaise)}</span>
                  {payOnline ? (
                    <Link href={`/checkout?invoice=${i.id}`} className="btn-light !py-2.5">
                      Pay now
                    </Link>
                  ) : (
                    <span className="text-sm text-cream/70">Pay at the studio</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel title="My classes">
          {!dash.enrollments.length ? (
            <p className="text-ink/60">No enrolments yet.</p>
          ) : (
            <ul className="divide-y divide-forest/10">
              {dash.enrollments.map((e) => {
                const st = ENROLMENT[e.status] ?? { label: e.status, cls: 'bg-ink/10' };
                return (
                  <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                    <span>
                      <span className="block font-medium text-forest">{e.course}</span>
                      <span className="text-sm text-ink/60">
                        {e.plan}
                        {e.timing ? ` · ${e.timing}` : ''} · {date(e.startDate)} – {date(e.endDate)}
                      </span>
                    </span>
                    <Pill {...st} />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Invoices">
          {!dash.invoices.length ? (
            <p className="text-ink/60">No invoices yet.</p>
          ) : (
            <ul className="divide-y divide-forest/10">
              {dash.invoices.map((i) => {
                const st = INVOICE[i.status] ?? { label: i.status, cls: 'bg-ink/10' };
                return (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span>
                      <span className="block font-medium">{i.invoiceNo}</span>
                      <span className="text-sm text-ink/60">
                        {date(i.createdAt)} · {rupees(i.totalPaise)}
                        {Number(i.balancePaise) > 0 && i.status !== 'CANCELLED' ? ` · ${rupees(i.balancePaise)} due` : ''}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Pill {...st} />
                      <a href={`/api/account/invoices/${i.id}/pdf`} target="_blank" rel="noopener" className="text-sm font-semibold text-forest underline underline-offset-4">
                        PDF
                      </a>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Payments & receipts">
          {!dash.payments.length ? (
            <p className="text-ink/60">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-forest/10">
              {dash.payments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <span className="block font-medium">{rupees(p.amountPaise)}</span>
                    <span className="text-sm text-ink/60">
                      {date(p.paidAt)} · {p.mode.replace('_', ' ').toLowerCase()} · {p.invoiceNo}
                      {Number(p.refundedPaise) > 0 ? ` · ${rupees(p.refundedPaise)} refunded` : ''}
                    </span>
                  </span>
                  {p.receiptId && (
                    <a href={`/api/account/receipts/${p.receiptId}/pdf`} target="_blank" rel="noopener" className="text-sm font-semibold text-forest underline underline-offset-4">
                      Receipt {p.receiptNo}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {dash.orders.length > 0 && (
          <Panel title="Online payments">
            <ul className="divide-y divide-forest/10">
              {dash.orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <span className="block font-medium">{o.description}</span>
                    <span className="text-sm text-ink/60">
                      {date(o.paidAt ?? o.createdAt)} · {rupees(o.amountPaise)}
                    </span>
                  </span>
                  <Link href={`/payment/${o.id}`} className="text-sm font-semibold text-forest underline underline-offset-4">
                    {ORDER[o.status] ?? o.status}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      {payOnline && onlinePlans.length > 0 && (
        <Panel title="Join a class online" action={<span className="text-sm text-ink/60">Secure payment by Razorpay · UPI, cards, netbanking</span>}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {onlinePlans.map((pl) => (
              <li key={pl.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-forest/10 p-4">
                <span>
                  <span className="block font-medium text-forest">{pl.course}</span>
                  <span className="text-sm text-ink/60">{pl.title}</span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="font-display text-xl">{rupees(pl.pricePaise)}</span>
                  <Link href={`/checkout?plan=${pl.id}`} className="btn-primary !px-4 !py-2">
                    Join
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
