import Link from 'next/link';
import { nav, site, whatsappLink } from '@/content/site';
import Logo from './Logo';

export default function Footer() {
  const { contact, social } = site;
  const socials = [
    { label: 'Instagram', href: social.instagram },
    { label: 'Facebook', href: social.facebook },
    { label: 'YouTube', href: social.youtube },
  ].filter((s) => s.href);
  const wa = whatsappLink();
  const hasContact = contact.phone || contact.email || contact.address.length > 0 || wa;

  return (
    <footer className="bg-forest text-cream/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">{site.description}</p>
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
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-cream/50">Get in touch</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="transition hover:text-white">
                  {contact.phone}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                  WhatsApp us
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="transition hover:text-white">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.address.length > 0 && <li className="leading-relaxed">{contact.address.join(', ')}</li>}
            {contact.mapsUrl && (
              <li>
                <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
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
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Practise within your own limits. Yoga and Pilates are not a substitute for medical advice.</p>
        </div>
      </div>
    </footer>
  );
}
