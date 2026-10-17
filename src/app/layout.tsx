import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import type { ReactNode } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ContactButtons from '@/components/ContactButtons';
import ChatWidget from '@/components/ChatWidget';
import { PreviewBanner } from '@/components/ui';
import { buildNav, site } from '@/content/site';
import { getSite, whatsappHref } from '@/lib/content';
import './globals.css';

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await getSite()).block('site.settings');
  const tagline = settings.tagline || site.tagline;
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${tagline}`, template: `%s · ${site.name}` },
    description: settings.description || site.description,
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: `${site.name} — ${tagline}`,
      description: settings.description || site.description,
      locale: 'en_IN',
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: '/' },
    manifest: '/manifest.webmanifest',
  };
}

export const viewport: Viewport = { themeColor: '#093a18' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getSite();
  const settings = s.block('site.settings');
  const bot = s.block('chatbot.settings');
  const nav = buildNav({ team: s.team.length > 0, gallery: s.gallery.length > 0, testimonials: s.testimonials.length > 0, blog: s.blogCount > 0 });
  const policies = [
    s.legal('legal.privacy') && { href: '/privacy', label: 'Privacy' },
    s.legal('legal.terms') && { href: '/terms', label: 'Terms' },
    s.legal('legal.refunds') && { href: '/refund-policy', label: 'Refunds & cancellations' },
  ].filter(Boolean) as { href: string; label: string }[];

  // Structured data for search engines. Only facts that are filled in are published.
  const sameAs = [settings.instagram, settings.facebook, settings.youtube, settings.website].filter(Boolean);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ExerciseGym',
    name: site.name,
    description: settings.description || site.description,
    url: site.url,
    logo: `${site.url}/logo.png`,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address.length ? { address: settings.address.join(', ') } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-cream">
          Skip to content
        </a>
        {s.preview && <PreviewBanner />}
        <AnnouncementBar items={s.announcements} />
        <Header nav={nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} nav={nav} policies={policies} />
        <ContactButtons
          links={{
            whatsapp: whatsappHref(settings.whatsapp),
            instagram: settings.instagram,
            facebook: settings.facebook,
            youtube: settings.youtube,
            google: settings.mapsUrl,
            website: settings.website,
          }}
        />
        {s.chatbotAvailable && bot.status !== 'off' && (
          <ChatWidget botName={bot.botName || 'Moksha Assistant'} greeting={bot.greeting} suggestions={bot.suggestions} />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  );
}
