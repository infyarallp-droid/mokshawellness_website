import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import AutoRefresh from '@/components/account/AutoRefresh';
import { rupees } from '@/lib/content';
import { loadForAccount } from '@/lib/server/account';

export const metadata: Metadata = { title: 'Payment status', robots: { index: false } };

interface Order {
  id: string;
  amountPaise: string;
  description: string;
  status: 'CREATED' | 'ATTEMPTED' | 'PAID' | 'FAILED' | 'EXPIRED' | 'NEEDS_REVIEW';
  failureReason: string | null;
  purpose: 'INVOICE' | 'PLAN';
  paidAt: string | null;
}

export default async function PaymentStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { order } = await loadForAccount<{ order: Order }>(`/api/account/payments/orders/${encodeURIComponent(id)}`, `/payment/${id}`);

  if (order.status === 'PAID') {
    return (
      <AuthShell title="Payment successful" subtitle={`${rupees(order.amountPaise)} · ${order.description}`}>
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-brand/15 text-3xl text-forest" aria-hidden="true">
          ✓
        </div>
        <p className="leading-relaxed text-ink/75">
          Thank you. {order.purpose === 'PLAN' ? 'You are enrolled — the studio will share your class timing.' : 'Your invoice has been updated.'} Your receipt is ready in your account.
        </p>
        <Link href="/account" className="btn-primary mt-6 w-full">
          Go to my account
        </Link>
      </AuthShell>
    );
  }

  if (order.status === 'NEEDS_REVIEW') {
    return (
      <AuthShell title="Payment received" subtitle={`${rupees(order.amountPaise)} · ${order.description}`}>
        <p className="leading-relaxed text-ink/75">
          We received your payment, but it needs a quick check by the studio before it is applied (for example, the invoice was already paid another way). The studio has been notified
          and will contact you. If needed, it will be refunded in full.
        </p>
        <Link href="/account" className="btn-primary mt-6 w-full">
          Go to my account
        </Link>
      </AuthShell>
    );
  }

  if (order.status === 'FAILED' || order.status === 'EXPIRED') {
    return (
      <AuthShell title="Payment not completed" subtitle={`${rupees(order.amountPaise)} · ${order.description}`}>
        <p className="leading-relaxed text-ink/75">
          {order.failureReason ? `${order.failureReason}. ` : ''}No money was taken for this attempt. If your bank shows a debit, it is reversed automatically by your bank within a few days.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/account" className="btn-primary flex-1">
            Try again from my account
          </Link>
          <Link href="/contact" className="btn-ghost flex-1">
            Contact the studio
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Confirming your payment…" subtitle={`${rupees(order.amountPaise)} · ${order.description}`}>
      <div className="mb-6 h-10 w-10 animate-spin rounded-full border-4 border-forest/15 border-t-forest" role="status" aria-label="Checking" />
      <p className="mb-4 leading-relaxed text-ink/75">We are waiting for Razorpay to confirm the payment. This usually takes a few seconds.</p>
      <AutoRefresh />
    </AuthShell>
  );
}
