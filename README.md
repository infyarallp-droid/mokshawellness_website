# Moksha Wellness — Website

Public website for Moksha Wellness (Yoga & Pilates). Next.js (App Router) + TypeScript + Tailwind.
Enquiries from the site arrive in the **Leads** inbox of the Moksha admin panel.

## Run locally

Requires Node 20+ and pnpm 9+.

```bash
pnpm install
cp .env.example .env.local     # then fill in the values (see below)
pnpm dev                       # http://localhost:3000   (use `pnpm dev -p 3100` if 3000 is busy)
```

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` · `pnpm typecheck` | Code checks |

## What to edit

| To change… | Edit |
|---|---|
| Phone, WhatsApp, email, address, map link, hours, social links, logo | `src/content/site.ts` |
| Classes and training programmes | `src/content/programmes.ts` |
| Colours | the `:root` variables in `src/app/globals.css` |
| Home-page copy and FAQs | `src/app/page.tsx` |

**Contact details.** Phone and email are filled in; the written address, WhatsApp number, opening hours and social links are still empty. Each one appears on the site as soon as it is filled in (phone link,
floating WhatsApp button, address, map link, opening hours, social links) and stays hidden while empty.
Nothing on the site is invented: there are no fees, timings, addresses, testimonials or trainer
biographies until the studio supplies them.

**Logo.** `public/logo.png` is the full stacked logo and `public/logo-mark.png` is the lotus mark cut
from it (used in the header, hero and as a watermark). The favicon is `src/app/icon.png`. To change the
logo, replace those files keeping the same names.

**Programmes** mirror the course catalogue in the admin panel (same names and delivery modes). If a
course is added or renamed there, update `programmes.ts` to match.

## Enquiry form → admin panel

```
Browser form ──POST /api/enquiry──▶ this site (server) ──POST /api/public/leads + x-api-key──▶ admin API ──▶ Leads inbox
```

The API key is used only on the server (`src/app/api/enquiry/route.ts`), so it never reaches the browser.
The route validates the input, drops bot submissions (hidden honeypot field), applies a light per-IP limit,
and reports honestly when the enquiry could not be saved.

Environment variables (`.env.local` locally, Project → Settings → Environment Variables on Vercel):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public address of this site, e.g. `https://www.mokshawellness.in` |
| `ADMIN_API_URL` | Admin API base URL, e.g. `https://moksha-api-b5pt.onrender.com` |
| `PUBLIC_LEADS_API_KEY` | Same value as `PUBLIC_LEADS_API_KEY` on the admin API (Render) |

If the two admin variables are missing, the form tells the visitor that online enquiries are not switched
on yet — it never pretends to have saved anything.

The admin API runs on a free tier that sleeps when idle, so the first enquiry after a quiet period can take
up to a minute. The route waits for it.

## Deploy (Vercel)

1. Push this repository to GitHub.
2. Vercel → **Add New → Project** → import the repository (framework is detected as Next.js).
3. Add the three environment variables above.
4. Deploy, then send one test enquiry and check it appears under **Leads** in the admin panel.
5. Optional: add the custom domain in Vercel and update `NEXT_PUBLIC_SITE_URL` to match.
