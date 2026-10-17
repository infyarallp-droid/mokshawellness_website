// Fixed facts about the site. Everything the studio edits day to day — contact
// details, opening hours, social links, page text, team, testimonials, FAQs —
// is managed in the admin panel (Website → Page Content) and loaded by
// src/lib/content.ts. The built-in text lives in src/content/defaults.ts.

export const site = {
  name: 'Moksha Wellness',
  tagline: 'Yoga & Pilates',
  description:
    'Moksha Wellness offers yoga and Pilates classes in studio and online, and teacher training programmes for those who want to go deeper.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  /** Logo files in /public: logo.png (full stacked logo), logo-mark.png (lotus mark), and white versions. */
  logo: { src: '/logo.png', width: 1200, height: 1099 },
};

export interface NavItem {
  href: string;
  label: string;
}

/** Main navigation. Team, Gallery and Stories appear once there is something published for them. */
export function buildNav(opts: { team: boolean; gallery: boolean; testimonials: boolean }): NavItem[] {
  return [
    { href: '/', label: 'Home' },
    { href: '/classes', label: 'Classes' },
    { href: '/teacher-training', label: 'Teacher Training' },
    { href: '/about', label: 'About' },
    ...(opts.team ? [{ href: '/team', label: 'Team' }] : []),
    ...(opts.testimonials ? [{ href: '/testimonials', label: 'Stories' }] : []),
    ...(opts.gallery ? [{ href: '/gallery', label: 'Gallery' }] : []),
    { href: '/contact', label: 'Contact' },
  ];
}
