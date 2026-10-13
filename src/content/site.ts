// ─────────────────────────────────────────────────────────────────────────────
// Everything the studio is likely to change lives in this file.
//
// Contact details are left EMPTY on purpose: nothing here was invented. Fill in a
// value and the matching piece of the site (phone link, WhatsApp button, address,
// map link, opening hours, social links) appears automatically. Leave it empty
// and that piece stays hidden.
// ─────────────────────────────────────────────────────────────────────────────

interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  logo: { src: string; width: number; height: number };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string[];
    mapsUrl: string;
    hours: { days: string; time: string }[];
  };
  social: { instagram: string; facebook: string; youtube: string };
}

export const site: SiteConfig = {
  name: 'Moksha Wellness',
  tagline: 'Yoga & Pilates',
  description:
    'Moksha Wellness offers yoga and Pilates classes in studio and online, and teacher training programmes for those who want to go deeper.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  /** Logo files live in /public: logo.png (full stacked logo) and logo-mark.png (the lotus mark). */
  logo: { src: '/logo.png', width: 818, height: 878 },

  contact: {
    /** Display phone, e.g. "+91 98765 43210". */
    phone: '+91 78935 85558',
    /** WhatsApp number in international digits only, e.g. "919876543210". Shows the floating WhatsApp button. */
    whatsapp: '',
    email: 'themokshawellness@gmail.com',
    /** Address lines, e.g. ['Plot 12, Example Road', 'Hyderabad 500043']. */
    address: [],
    /** Link to the studio's Google listing (directions, photos, reviews). */
    mapsUrl: 'https://www.google.com/search?kgmid=/g/11zd83mcsj&q=Moksha+Yoga+%26+pilates+studio',
    /** e.g. [{ days: 'Mon – Sat', time: '6:00 AM – 8:00 PM' }] */
    hours: [],
  },

  social: {
    instagram: '',
    facebook: '',
    youtube: '',
  },
};

export const nav = [
  { href: '/classes', label: 'Classes' },
  { href: '/teacher-training', label: 'Teacher Training' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

/** wa.me link with a pre-filled greeting, or null when no WhatsApp number is configured. */
export function whatsappLink(message = 'Hello Moksha Wellness, I would like to know more about your classes.') {
  const digits = site.contact.whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
