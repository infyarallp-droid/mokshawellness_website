import Link from 'next/link';
import type { Blocks } from '@/content/defaults';
import { site, type NavItem } from '@/content/site';
import { formatWhatsApp, whatsappHref } from '@/lib/content';
import Logo from './Logo';

export default function Footer({
  settings,
  nav,
  policies,
}: {
  settings: Blocks['site.settings'];
  nav: NavItem[];
  policies: { href: string; label: string }[];
}) {
  const socials = [
    { label: 'Instagram', href: settings.instagram },
    { label: 'Facebook', href: settings.facebook },
    { label: 'YouTube', href: settings.youtube },
    { label: 'Website', href: settings.website },
  ].filter((s) => s.href);
  const wa = whatsappHref(settings.whatsapp);
  const hasContact = settings.phone || settings.email || settings.address.length > 0 || wa;

  return (
    <footer className="bg-forest text-cream/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" className="h-24 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">{settings.description || site.description}</p>
          {settings.hours.length > 0 && (
            <dl className="mt-5 max-w-xs space-y-1 text-sm">
              {settings.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-6">
                  <dt className="text-cream/60">{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/account" className="transition hover:text-white">
                My account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">Get in touch</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="transition hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                  WhatsApp: {formatWhatsApp(settings.whatsapp)}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="break-all transition hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address.length > 0 && <li className="leading-relaxed">{settings.address.join(', ')}</li>}
            {settings.mapsUrl && (
              <li>
                <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                  Find us on Google
                </a>
              </li>
            )}
            <li>
              <Link href="/contact#enquire" className="font-semibold text-cream underline decoration-cream/30 underline-offset-4 transition hover:decoration-cream">
                {hasContact ? 'Send an enquiry' : 'Send us an enquiry'}
              </Link>
            </li>
          </ul>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-4 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          {policies.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {policies.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="hover:text-cream">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {settings.footerNote && <p className="sm:max-w-sm sm:text-right">{settings.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
