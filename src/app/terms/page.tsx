import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms for enquiries, accounts, enrolment and payments at Moksha Wellness.',
  alternates: { canonical: '/terms' },
};

export default function Page() {
  return <LegalPage blockKey="legal.terms" />;
}
