# Moksha Wellness — Platform Enhancement Plan

Status: **implemented** on branch `feature/platform-enhancement` in both repositories · Planned and built 2026-10-17

## Decisions taken (supersede the open questions in §8)

| Topic | Decision | Notes |
|---|---|---|
| Mobile sign-in | **Mobile number + password**, no OTP / SMS / DLT | Requested by the owner. A password was added because a mobile number alone would let anyone open someone else's account. OTP can be added later behind the same flow. |
| Linking to studio records | Never automatic; staff link on **Website Logins** | Numbers are unverified. Online plan purchases by a new person create a new student record. |
| Google sign-in | Implemented; account created only after a mobile number is entered | |
| Email sign-in | Added on request: sign up / sign in with email + password; mobile number still mandatory; emails unique (case-insensitive), never used to merge accounts | |
| What can be paid online | Invoices **and** plans an admin marks "Sell online" | Fees appear publicly only for those plans. |
| Recurring payments | Not implemented — one-time payments + renewal reminders | |
| Payments | Razorpay **test mode** for the client demo; live after KYC | docs: admin repo `docs/SETUP_RAZORPAY.md` |
| Hosting tier | Code works on Render free; Starter recommended once taking payments | |
| Scheduler | DB outbox + idempotent `POST /internal/jobs/tick` (cron-job.org free, Render cron, or in-process) | |
| Policy pages | Privacy / terms / refunds as CMS sections with suggested drafts, shown only once published | Needed for Razorpay KYC and Meta live mode. |

Setup guides live in the admin repo: `docs/SETUP_WHATSAPP.md`, `docs/SETUP_RAZORPAY.md`,
`docs/SETUP_GOOGLE_AUTH.md`, `docs/ADMIN_GUIDE.md`, `DEPLOYMENT.md`. Testing: `docs/TESTING.md` here.

---

*The original plan follows, unchanged, for reference.*
Covers two repositories:

| Repo | Path | Stack | Hosting |
|---|---|---|---|
| `mokshawellness_website` | `infyara_website/` | Next.js 16 (App Router), React 19, Tailwind 3, zod | Vercel |
| `infyara_admin_panel` | `infyara_admin_panel/` | pnpm monorepo: Express 4 + Prisma 5 + PostgreSQL API (`apps/api`), React 18 + Vite SPA (`apps/web`), shared zod (`packages/shared`) | Render (API, free tier) · Vercel (SPA) · Neon · Upstash Redis · Supabase Storage |

---

## 1. Audit — what exists today

### Public website (`infyara_website`)
- 5 pages: Home, Classes, Teacher Training, About, Contact + 404, sitemap, robots, JSON-LD.
- **All content is hard-coded** in `src/content/site.ts`, `src/content/programmes.ts` and page files (hero copy, pillars, steps, FAQs).
- Enquiry form → `/api/enquiry` (server route) → admin API `POST /api/public/leads` with a server-only API key. Honeypot + in-memory per-IP throttle. Good pattern; keep it.
- Logo: `public/logo.png` + `public/logo-mark.png` + `src/app/icon.png` — this is an **older logo version**. The new logo (`moksha-logo-estd-2025-print.pdf`, found in Downloads) differs: line-art lotus, red bindu, "ESTD 2025", "YOGA AND PILATES".
- No database, no auth, no payments, no tests. Security headers are minimal (no CSP/HSTS).

### Admin system (`infyara_admin_panel`) — substantial and well built
- **Staff auth**: email + bcrypt password, JWT access (15m) + refresh (7d), roles `SUPER_ADMIN, ADMIN, MANAGER, FRONT_DESK, ACCOUNTANT, TRAINER`, `requireRole` middleware.
- **Modules**: Students (+CSV import), digital Consent forms (signatures, PDFs), Courses/Plans/Class timings, Enrollments + Renewals, Billing (invoices, multi-mode payments with idempotency keys, receipts, PDFs, FY numbering), Inventory, Employees (HR, AES-GCM encrypted Aadhaar/PAN), Leads inbox (Website/WhatsApp/Google Form), Notifications, Analytics dashboard, Audit log.
- **WhatsApp**: Meta Cloud API sender, `MessageLog` with dedupe keys, attempt limits, delivery receipts via webhook, renewal-reminder job (`jobs/reminders.ts`) and optional payment/admission templates — **templates are configured by env var, not in the UI**.
- **Storage**: Supabase private bucket with 1-year signed URLs; local-disk fallback.
- **Tests**: `node:test` integration suite against a Docker Postgres test DB.

### Gaps against the requirements
| Requirement | State |
|---|---|
| Logo everywhere / favicon | Website has old logo; admin SPA has no logo (text only) and a generic favicon |
| Student/customer accounts (Google + phone OTP) | **Missing** — only staff accounts exist |
| WhatsApp module in admin (send, schedule, templates, rules, consent, history, retry) | Partial — sending engine + log exist; no UI, no consent ledger, no scheduling, no templates table |
| Online payments | **Missing** — only staff-recorded offline payments |
| Public team profiles | Missing — `Employee` is an HR record with PII; must **not** be exposed publicly |
| Video testimonials | Missing |
| CMS (homepage, about, FAQs, contact, footer, announcements, gallery, programmes) | Missing — all hard-coded |
| Responsive admin UI | Sidebar is fixed-width; not usable on phones |

### Security findings (existing code)
1. **Refresh tokens are not re-checked against the DB** — a deactivated staff member or a demoted role keeps access for up to 7 days. → re-validate `isActive`/role on refresh; add a session table so tokens can be revoked.
2. Staff tokens live in `localStorage` (readable by any XSS). → move the refresh token to an httpOnly cookie.
3. **No rate limiting on staff login** (`/api/auth/login`). → Redis-backed limiter.
4. WhatsApp webhook **accepts unsigned payloads when `WHATSAPP_APP_SECRET` is unset**. → fail closed in production.
5. Default secrets (`PUBLIC_LEADS_API_KEY="change-me…"`, `WHATSAPP_VERIFY_TOKEN`) are accepted in production. → refuse to boot with defaults when `NODE_ENV=production`.
6. Private documents (Aadhaar/PAN scans) get **1-year signed URLs**. → serve via authenticated API route or short-lived URLs.
7. Local-disk storage fallback on Render loses files on every deploy (ephemeral disk). → fail loudly in production instead of falling back.
8. Website: no CSP / HSTS / Permissions-Policy.

None of these are fixed silently — each lands as its own commit in Phase 2.

---

## 2. Architecture decision

**One backend, one database.** The existing admin API (Express + Prisma + Postgres) becomes the single system of record for students, accounts, content, messaging and payments. The website stays a Next.js front end and never talks to the database directly.

```
                    ┌──────────────────────── Vercel ───────────────────────┐
 Visitor ─────────▶ │ Next.js website                                       │
                    │  • public pages: Server Components, ISR + on-demand   │
                    │    revalidation (content fetched from API, cached)    │
                    │  • /login /verify-phone /account /checkout            │
                    │  • BFF route handlers: hold the student session in an │
                    │    httpOnly cookie, call the API server-to-server     │
                    └───────────────┬───────────────────────▲───────────────┘
                                    │ HTTPS + service key    │ POST /api/revalidate (secret)
                                    ▼                        │ after admin publishes
 Staff ──▶ Admin SPA (Vercel) ──▶ ┌─────────────── Render ───┴──────────────┐
                                  │ Express API (+ Prisma)                   │
 Google OAuth ◀──────────────────▶│  /api/customer-auth  (Google, OTP)       │
 SMS OTP provider ◀──────────────▶│  /api/account        (student self-serve)│
 Razorpay ───── webhooks ────────▶│  /webhooks/razorpay                      │
 Meta WhatsApp ─ webhooks ───────▶│  /webhooks/whatsapp                      │
                                  │  /api/cms, /api/whatsapp, /api/payments  │
                                  │  /api/public/content (read-only, cached) │
                                  │  /internal/jobs/tick  (cron, secret)     │
                                  └──────┬───────────────┬───────────────────┘
                                         ▼               ▼
                                 Neon Postgres     Supabase Storage
                                 (system of        • private bucket: consent, HR docs
                                  record)          • public bucket: team photos,
                                 Upstash Redis       testimonial media, gallery
                                 (rate limits)
```

Why this shape:
- The admin API already has the Student, Invoice, Payment, Receipt and MessageLog models. Online payments **must** post into the same invoices/receipts; student accounts **must** link to the same Student records. A second backend would duplicate all of that.
- The website keeps its current deployment and visual identity. The student session cookie lives on the website domain (httpOnly, `Secure`, `SameSite=Lax`), so no cross-site cookies and no tokens in browser JS.
- Content changes are visible within seconds (on-demand revalidation) without redeploys; if the API is asleep/down the site keeps serving the last cached content, with the current hard-coded copy as a built-in fallback.

### Background jobs (no in-memory scheduling)
All scheduled work is a **database outbox**: rows with `sendAfter` / `nextAttemptAt`, claimed with `SELECT … FOR UPDATE SKIP LOCKED`, deduplicated by unique keys. A secret-protected `POST /internal/jobs/tick` processes due rows. It is triggered by **Render Cron** (every 5 min) — or, on a zero budget, a free external scheduler (cron-job.org / GitHub Actions). Nothing is lost if a tick is missed; the next tick picks it up. The existing daily `reminders.ts` job folds into the same tick.

### Payment gateway: **Razorpay** (recommended)
| | Razorpay | Stripe |
|---|---|---|
| India business, INR settlement | Native, built for it | Stripe India stopped onboarding new Indian businesses in 2024 (invite-only) — verify current status |
| UPI, cards, netbanking, wallets | All | Cards; UPI limited |
| Recurring | Subscriptions + UPI Autopay / e-mandates | Yes, but India mandate rules add friction |
| Fees | ~2% standard (confirm on razorpay.com/pricing) | Higher for domestic |
| Onboarding | KYC with PAN, bank account, business proof; test mode immediately | — |

Razorpay only; no second gateway. Integration uses the Orders API + Standard Checkout + server signature verification + webhooks, implemented with `fetch` + `crypto` (no SDK needed).

### Video storage
YouTube/Vimeo links (unlisted is fine) are the primary option — free, adaptive streaming, no bandwidth cost. Direct uploads go **browser → Supabase public bucket via a signed upload URL** (never through the API server, which has 512 MB RAM on Render), capped at 50 MB (Supabase free-tier limit), MP4/WebM only, with a poster image. Videos never autoplay; players load only when clicked (facade pattern).

---

## 3. Data model (additive migrations only)

No existing table or column is dropped or renamed. Every migration is reviewed before it runs and comes with a backup step in the release notes.

**Accounts & auth**
- `CustomerAccount` — `id, name, email?, phoneE164 (unique), phoneVerifiedAt, status, studentId? (unique FK → students), lastLoginAt`. A student/customer principal, separate from staff `users`.
- `AuthIdentity` — `accountId, provider (GOOGLE|PHONE), providerSubject, email, emailVerified`; `unique(provider, providerSubject)`.
- `OtpChallenge` — `phoneE164, purpose (LOGIN|LINK_PHONE), codeHash (HMAC-SHA256 + server pepper), expiresAt (5 min), attempts (max 5), consumedAt, ipHash, pendingIdentityId?`. OTPs are never stored in plain text.
- `CustomerSession` — `accountId, tokenHash, expiresAt, revokedAt, userAgent, ipHash`. Opaque, revocable sessions.
- `StaffSession` — same for staff refresh tokens (fixes finding #1/#2).

**Account linking rules**
- Google sign-in creates a *pending* identity only. The account becomes usable after an OTP-verified phone.
- If the verified phone already belongs to an account → the Google identity is attached to it **only after that OTP**, never by matching email.
- If the verified phone matches an existing `Student` record (created by staff) → the account links to it, giving the student their enrollments, invoices and receipts. Phone ownership was just proven by OTP; nothing is linked on an unverified number.
- One phone = one account (DB unique). One Google subject = one account.

**CMS**
- `MediaAsset` — `kind (IMAGE|VIDEO), bucket, key, publicUrl, mimeType, sizeBytes, width, height, alt, uploadedById, status`.
- `ContentBlock` — `key (e.g. home.hero, about.story, site.contact, site.footer), draft Json, published Json, publishedAt, updatedById`. Each key has a zod schema in `packages/shared`, so the admin form and the website renderer are typed from one definition. Draft → preview → publish.
- `TeamMember` — public profile, **separate from the HR `Employee`** (optional `employeeId` link): `name, slug, photoAssetId, title, shortBio, bio?, specialization?, experience?, qualifications?, socialLinks, displayOrder, status (DRAFT|PUBLISHED|ARCHIVED)`.
- `Testimonial` — `studentName, studentId?, photoAssetId?, videoSource (YOUTUBE|VIMEO|UPLOAD), videoUrl?/videoAssetId?, posterAssetId?, quote, courseName?, displayOrder, status, isFeatured, consentRecordedAt, consentScope {name, photo, video}, consentEvidenceAssetId?`. **Cannot be published without a consent record.**
- `Faq`, `Announcement (title, body, link, startsAt, endsAt, status)`, `GalleryItem`.
- `Course` gains public fields: `slug (unique), summary, forWhom, isPublished, displayOrder, imageAssetId` — the website's programme list then comes from the same catalogue staff enroll into (today it's a hand-maintained mirror).

**WhatsApp**
- `WhatsAppConsent` — append-only ledger: `phoneE164, accountId?, studentId?, status (OPTED_IN|OPTED_OUT), source (WEBSITE_SIGNUP|CONSENT_FORM|STAFF_RECORDED|INBOUND_STOP|ACCOUNT_SETTINGS), consentText, consentTextVersion, recordedById?, ipHash?, createdAt`. Current state = latest row.
- `WhatsAppTemplate` — synced from Meta: `name, language, category (UTILITY|MARKETING|AUTHENTICATION), metaStatus, bodyText, variables [{position, label, source}]`.
- `ReminderRule` — `name, trigger (ENROLLMENT_EXPIRY|INVOICE_DUE|ENROLLMENT_CREATED|PAYMENT_RECEIVED|CLASS_UPCOMING), offset, templateId, isEnabled`.
- `MessageCampaign` — admin-initiated sends to selected students, optional `scheduledAt`.
- `MessageLog` (existing) gains nullable `campaignId, ruleId, templateId, scheduledFor, nextAttemptAt` and becomes the outbox + history. Existing dedupe-key logic is kept.

**Payments**
- `PaymentOrder` — `gateway, gatewayOrderId (unique), accountId, invoiceId?, purpose, amountPaise (computed server-side), currency, status (CREATED|ATTEMPTED|PAID|FAILED|EXPIRED)`.
- `GatewayPayment` — `orderId, gatewayPaymentId (unique), method, status, amountPaise, feePaise, taxPaise, errorCode, errorReason`. On capture it creates an existing `Payment` (`idempotencyKey = rzp:<paymentId>`) + `Receipt` via the existing billing service — so invoices, receipts, PDFs and analytics work unchanged.
- `Refund` — `gatewayRefundId (unique), gatewayPaymentId, amountPaise, status, reason, initiatedById`.
- `WebhookEvent` (existing) gains `externalEventId (unique)` for idempotent processing.

---

## 4. Roles & authorization

| Principal | Roles | Access |
|---|---|---|
| Staff (`users`) | `SUPER_ADMIN` | Everything incl. staff management, refunds, settings, audit log |
| | `ADMIN` | Everything except staff role changes and secrets |
| | `MANAGER / FRONT_DESK / ACCOUNTANT / TRAINER` | Existing permissions unchanged; CMS editing for MANAGER; payment views for ACCOUNTANT |
| Customer (`customer_accounts`) | `STUDENT` | Own profile, enrollments, invoices, receipts, payments, WhatsApp preference |

Every route enforces this on the server. Customer routes derive the account from the session only — never from an ID in the request. All admin mutations on content, payments, refunds, messaging, consent and roles write an `AuditLog` row.

---

## 5. Feature breakdown by phase

Each phase ends with typecheck + lint + build + tests run and a short report. Commits are per feature, on a branch per phase.

### Phase 1 — Audit & plan *(this document)*

### Phase 2 — Foundations & security hardening
- Fix findings #1–#8 above.
- Redis rate limiter middleware (login, OTP send/verify, enquiry, checkout).
- Production env validation (refuse defaults), `.env.example` updates for both repos.
- Website security headers: CSP (allowing Razorpay, Google, YouTube), HSTS, Permissions-Policy.
- Migration 1: accounts/sessions/OTP tables + `StaffSession`.

### Phase 3 — Branding & authentication
- Extract the new logo from the PDF (vector → SVG + PNGs); regenerate `logo.png`, `logo-mark.png`, favicon (`icon.png`, `apple-icon.png`, 192/512 manifest icons). Header, footer, login/signup, account pages, admin sidebar, admin login, admin favicon.
- Google sign-in (OAuth 2.0 authorization code + PKCE in the website BFF; the API re-verifies the ID token signature and audience).
- Phone OTP (provider adapter; see decision Q1).
- Flows: Google → verify phone → complete profile → dashboard; Phone → OTP → profile → dashboard; logout; session refresh; account linking per §3.
- Student dashboard `/account`: profile, enrollments, invoices, receipts (PDF download), WhatsApp preference.
- Admin: **Customers** page (accounts, link status, sessions, revoke).

### Phase 4 — CMS & dynamic website
- Media library with direct-to-storage uploads, validation (type sniffing, size limits), alt text.
- Admin modules: Website Content (home hero, pillars, steps, about, contact details, footer, CTA links), Team, Testimonials, FAQs, Announcements, Gallery, Programmes (course public fields).
- Draft / preview / publish with a signed preview link to the real website page.
- Reordering (drag or up/down), publish toggles, archive instead of delete where history matters, confirmation dialogs, empty/loading/error states.
- Website reads all of it from `/api/public/content/*` with cache tags; admin publish triggers revalidation. New `/team` page, testimonials section (home + about), announcement banner, gallery (only rendered when content exists).
- Seed script imports today's hard-coded copy into the CMS so nothing visible changes on day one.
- Admin SPA: responsive layout (drawer nav on mobile), consistent with website palette.

### Phase 5 — WhatsApp module
- Template sync from Meta (Graph API `message_templates`) + variable mapping UI.
- Consent: opt-in checkbox (unticked) at signup and in account settings; staff can record in-person consent with evidence; inbound "STOP" → opt-out; every send checks consent first (`SKIPPED_NO_CONSENT` logged).
- Send to one / selected students, schedule for later, reminder rules (enable/disable), message history with delivery status, retry eligible failures.
- Existing renewal/payment/admission notifications migrate from env-vars to rules, keeping current behaviour as defaults.

### Phase 6 — Razorpay payments
- Pay outstanding invoices (and/or buy plans — decision Q2) from `/account`.
- Server-side order creation with server-computed amount → Checkout → server signature verification → success/failure pages.
- Webhooks: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed` — signature-verified, idempotent on event id, safe against out-of-order delivery and abandoned checkouts (reconciliation job polls orders stuck in `ATTEMPTED`).
- Admin: online payments dashboard, filters, refund initiation (SUPER_ADMIN/ACCOUNTANT), refund tracking.
- Receipts reuse the existing receipt PDFs; WhatsApp payment confirmation via rule.

### Phase 7 — Testing & optimization
- API integration tests (node:test, existing harness): OTP expiry/attempt limits/rate limits, Google + phone linking and duplicate prevention, RBAC denial on every admin route, CMS CRUD + publish, consent enforcement, scheduler dedupe, Razorpay signature/webhook idempotency/duplicate events, refund flow, WhatsApp webhook signature.
- External providers are stubbed at the HTTP boundary in tests; **real-credential verification is listed separately and only claimed once you've run it.**
- Website: typecheck, lint, build; Playwright smoke tests for login UI, account, checkout pages and responsive breakpoints (one new dev dependency).
- Lighthouse pass on public pages; image sizing; lazy video facades.

### Phase 8 — Deployment & documentation
`docs/` in both repos: `SETUP_GOOGLE_AUTH.md`, `SETUP_OTP.md`, `SETUP_WHATSAPP.md`, `SETUP_RAZORPAY.md`, `ADMIN_GUIDE.md`, `DEPLOYMENT.md` (env checklist, migration order, rollback, production verification). Each guide separates *done in code* from *you must do in the provider dashboard*.

---

## 6. New dependencies (kept minimal)

| Package | Where | Why |
|---|---|---|
| `jose` | API | Verify Google ID tokens against Google's JWKS |
| `@playwright/test` | website (dev) | E2E smoke tests |

Rate limiting uses the existing `ioredis`; Razorpay and WhatsApp use `fetch` + `crypto`; uploads use the existing Supabase client. No auth framework is added — the custom phone-first flow would fight one.

---

## 7. What I need from you

| Item | When |
|---|---|
| Decisions Q1–Q4 (below) | Before Phase 3 |
| Start **Docker Desktop** (local test DB) | Before Phase 2 tests |
| Google Cloud OAuth client ID/secret | To test Phase 3 end to end (code works without it) |
| SMS/OTP provider account + DLT registration (India) | DLT approval takes days — start early |
| Meta Business verification + WhatsApp number | Takes days — start early |
| Razorpay account + KYC | Test keys are instant; live keys need KYC |
| Testimonial consent from each student | Before publishing any testimonial |

## 8. Open decisions

- **Q1 — OTP delivery.** MSG91 (India-native, cheapest per SMS, needs your DLT registration) · Twilio Verify (no DLT work for you, costs several times more per verification) · WhatsApp authentication template (cheapest, reuses the Meta setup, but only reaches WhatsApp users — best as primary with SMS fallback).
- **Q2 — What can students pay online?** Outstanding invoices raised by staff only · also buy a course plan directly (requires publishing fees, which the website currently avoids) · both.
- **Q3 — API hosting tier.** Render free sleeps after 15 min → a 30–60 s delay on the first OTP/login after idle. Starter (~US$7/month) removes this and is recommended before taking payments.
- **Q4 — Recurring payments.** One-time payments + renewal reminders with a pay link (recommended to start) · Razorpay Subscriptions/UPI Autopay for monthly plans.
