import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Moksha Wellness collects, uses and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function Page() {
  return <LegalPage blockKey="legal.privacy" />;
}
