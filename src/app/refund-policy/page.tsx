import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'When fees paid to Moksha Wellness can be cancelled or refunded, and how refunds are paid.',
  alternates: { canonical: '/refund-policy' },
};

export default function Page() {
  return <LegalPage blockKey="legal.refunds" />;
}
