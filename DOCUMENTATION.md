# COACHEDBYRUDHRA — Complete Documentation

Everything this site does, how to operate it, and what to expect from each part.

Setup-from-scratch instructions live in two companion files and are not repeated here:

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) — creating the Firebase project, security rules, service account
- [EMAIL_SETUP.md](EMAIL_SETUP.md) — Resend + SMTP configuration

---

## Contents

1. [What the site is](#1-what-the-site-is)
2. [Pages and routes](#2-pages-and-routes)
3. [The homepage funnel](#3-the-homepage-funnel)
4. [The application form](#4-the-application-form)
5. [What happens when someone applies](#5-what-happens-when-someone-applies)
6. [Email — sending and receiving](#6-email--sending-and-receiving)
7. [Admin panel — logging in](#7-admin-panel--logging-in)
8. [Admin panel — what to expect](#8-admin-panel--what-to-expect)
9. [SEO features](#9-seo-features)
10. [Environment variables](#10-environment-variables)
11. [Content and copy](#11-content-and-copy)
12. [Running and deploying](#12-running-and-deploying)
13. [Known limitations](#13-known-limitations)

---

## 1. What the site is

A single-coach marketing and lead-capture site for **COACHEDBYRUDHRA**, offering fully online 1:1 personal training and nutrition coaching for busy professionals in India.

**Stack:** Next.js 16.2.10 (App Router, Turbopack) · React 19.2 · Tailwind CSS v4 · Firebase Firestore · Resend + nodemailer · deployed on Vercel.

The site has two jobs:

1. **Convert** — an interactive funnel that earns attention before asking for anything (no email gate, no signup).
2. **Capture** — a 13-question application that lands in Firestore and emails Rudhra immediately.

Everything the client supplied lives in one file, [lib/content.ts](lib/content.ts), so copy changes never require hunting through components.

---

## 2. Pages and routes

| Route | Rendering | Indexed | Purpose |
|---|---|---|---|
| `/` | Static | Yes | Interactive funnel — hero, assessment, result, story deck |
| `/coaching` | Static | Yes | Program, pillars, pricing, who it's for, outcomes |
| `/about` | Static | Yes | Meet Rudhra, coaching approach |
| `/faq` | Static | Yes | The five FAQs, with rich-result schema |
| `/results` | Static | Yes | Client transformation gallery |
| `/apply` | Static | Yes | The 13-question application form |
| `/apply/submitted` | Dynamic | **No** | Confirmation page after submitting |
| `/admin` | Dynamic | **No** | Password-gated applications + inbox |
| `/api/apply` | Node runtime | n/a | Receives form submissions |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image` | Static | n/a | Metadata endpoints |

`/admin` and `/apply/submitted` carry `robots: { index: false, follow: false }`, and `/admin` is additionally disallowed in `robots.txt`.

---

## 3. The homepage funnel

The homepage is a four-stage client-side flow. There is no scrolling long-page — each stage replaces the last.

### Stage 1 — Hero
Headline, subheadline, Instagram badge, and two paths: **Start Your Free Assessment**, or *"I will do this later, just show me the page"* which skips straight to the deck.

### Stage 2 — Free assessment (6 steps)
Six taps, no email, no signup. Collects:

1. Sex (male / female)
2. Goals — multi-select from: lose weight, build muscle, body recomposition, get stronger, energy and sleep, stress and focus
3. Age band (under 20, 20s, 30s, 40s, 50+)
4. Height
5. Weight
6. Weekly commitment (2, 3, 4, or 5+ days)

Selecting an option auto-advances after 140ms — no extra "Next" tap.

**This data is never sent anywhere.** It lives in browser state only and is discarded on refresh. It is not stored, not emailed, and not in Firestore.

### Stage 3 — Result projection

Computed in [lib/assessment.ts](lib/assessment.ts) over a **12-week** window. The maths is deliberately conservative because it makes a claim to a real prospect:

- **BMI** — standard `kg / m²`
- **Body fat** — Deurenberg estimate (`1.2·BMI + 0.23·age − 10.8·(male) − 5.4`), clamped 5–60%, labelled an estimate in the UI
- **Fat loss** — 0.5%/week (realistic) to 0.8%/week (ambitious) of bodyweight, **floored at BMI 21** so it never projects someone into an unhealthy range
- **Muscle gain** — 0.1–0.2 kg/week
- **Neither selected** — returns a "hold" result that explicitly refuses to invent a scale target: *"Your win here isn't on the scale."*
- **Already at a healthy weight** — *"You're already at a healthy weight. So we build strength, not a deficit."*

The result screen states ranges, not a single promise.

### Stage 4 — Story deck (8 slides)

One slide per screen, with back / next navigation and a progress counter: Meet Rudhra → Why This Works → The Program → Who This Is For → What Changes → Real Results → Questions → Let's Talk. The final slide leads to `/apply` or WhatsApp.

### Background

A full-bleed training montage cycles through the clips in `media.heroVideos`. It sits under a gradient, a light blur, and a cream radial glow that keeps the headline legible on both bright and dark frames.

Performance behaviour:
- The poster image paints immediately (optimised via `next/image`, `priority`)
- The video mounts only once the browser goes idle (`requestIdleCallback`, 3s timeout; 1.5s fallback)
- Users with `prefers-reduced-motion: reduce` **never download the video at all**

---

## 4. The application form

`/apply` asks 13 questions, one per screen, verbatim from the client's form PDF. They are defined once in [lib/application-questions.ts](lib/application-questions.ts) and shared by the form, the API route, the email, and the admin panel — so labels and order can never drift.

| # | Question | Type |
|---|---|---|
| 1 | First, your name and age | text |
| 2 | Your phone / WhatsApp number | text |
| 3 | What do you do, and what's your schedule like? | textarea |
| 4 | Why do you want to start now — what changed? | textarea |
| 5 | How frustrated are you with your health and energy right now? | scale 1–10 |
| 6 | What would hitting this goal actually mean for your life? | textarea |
| 7 | What's your primary fitness goal? | text |
| 8 | What's your current activity level? | text |
| 9 | Any injuries, medical conditions, or limitations? | textarea — **optional** |
| 10 | Where will you train? | text |
| 11 | Any dietary preferences or restrictions? | text |
| 12 | How many days a week can you commit? | choice: 2 / 3 days |
| 13 | A quick one on investment | choice: comfortable / discuss first / not in budget |

**Question 9 is the only optional one.** All others must be answered.

---

## 5. What happens when someone applies

Handled by [app/api/apply/route.ts](app/api/apply/route.ts). Runs on the Node.js runtime (nodemailer and the Firebase Admin SDK cannot run on Edge).

1. **Validate** — answers are whitelisted against known question IDs, coerced to trimmed strings, and capped at 4,000 characters each. Unknown fields are dropped. Any missing required answer returns `400` naming the question.
2. **Save first** — writes to the Firestore `applications` collection with all answers, a numbered `summary` string, `status: "new"`, `source: "website"`, and a server timestamp. If this fails the applicant sees an error and nothing is lost silently.
3. **Email second, in the background** — the notification is sent inside Next.js `after()`, so the applicant never waits on SMTP and **a mail failure cannot lose a lead that is already saved**.
4. **Redirect** — on an `ok` response the form itself navigates to `/apply/submitted`, passing the applicant's first name in the query string. That page greets them by name, re-parsing and capping it at 40 characters rather than trusting the URL.

The ordering is deliberate: capturing the lead is the critical step; notifying is best-effort.

---

## 6. Email — sending and receiving

Two independent halves. Either can be unconfigured without breaking the other or the site.

### Sending — new-application notifications

Via nodemailer over SMTP ([lib/mailer.ts](lib/mailer.ts)), configured entirely from env so any provider works (Resend SMTP, Google Workspace, Zoho, Brevo, Mailgun, SES).

- `MAIL_FROM` — the from address on the custom domain
- `MAIL_TO` — where notifications land (Rudhra's inbox)
- Port `465` uses implicit TLS; `587` uses STARTTLS. Chosen automatically from `SMTP_PORT`.
- Timeouts: 10s connect, 10s greeting, 20s socket — it fails fast rather than hanging.

**If SMTP is not configured, sending is skipped silently and the submission still saves.**

The notification email is a hand-built responsive HTML template with:
- A light theme via inline styles, plus a full `prefers-color-scheme: dark` re-theme
- The applicant's name and phone surfaced at the top
- A tappable `tel:` link and a green **Message on WhatsApp** button
- All 13 answers as labelled rows, with `—` for blanks
- A hidden preheader line: *"New application from {name} — {phone}"*

### Receiving — inbound email in the admin panel

Via the Resend API ([lib/resend-inbound.ts](lib/resend-inbound.ts)). **No webhook is involved** — Resend is the source of truth and the admin panel reads it live on each page load, up to 50 messages, fetching each message body individually (falling back to list metadata if a body fetch fails).

Requires `RESEND_API_KEY`. Without it the inbox tab shows a configuration notice.

---

## 7. Admin panel — logging in

### Where

```
https://www.coachedbyrudhra.com/admin
```

Locally: `http://localhost:3000/admin`

### Credentials

Set by environment variable, not stored in any database:

- **`ADMIN_PASSWORD`** — required. Without it the login form shows *"Admin password is not configured yet."* and no one can get in.
- **`ADMIN_USERNAME`** — **optional**. The username field only appears if this is set. If it is unset, the login form asks for a password alone.

Both are compared with a timing-safe comparison, so the form does not leak credential length or content through response timing.

### How the session works

On successful login the server sets an httpOnly cookie named `cbr_admin`. Its value is an HMAC-SHA256 of a fixed string keyed by the password — so:

- The password itself **never reaches the browser**
- The cookie cannot be forged without knowing the password
- The cookie is `httpOnly` (JavaScript cannot read it), `sameSite: lax`, and `secure` in production

**Session length is 8 hours.** After that you log in again.

> **Changing `ADMIN_PASSWORD` immediately logs everyone out.** The session token is derived from the password, so every existing cookie stops validating the moment the password changes. This is the intended way to revoke access.

Logging out (the **Log out** button, top right) deletes the cookie.

### If login fails

| Message | Meaning |
|---|---|
| "Admin password is not configured yet." | `ADMIN_PASSWORD` is not set in the environment |
| "Incorrect username or password." | Shown when `ADMIN_USERNAME` is set |
| "Incorrect password." | Shown when only a password is required |

---

## 8. Admin panel — what to expect

Once logged in you get two tabs.

### Tab 1 — Applications

The default view. Shows the **latest 200** applications, newest first.

Each application is a card containing:

- **Name** as the heading, with a **NEW** badge
- **Phone number** as a tappable `tel:` link
- **Submission date and time**, formatted for India (`en-IN`, medium date + short time). Hidden on narrow screens.
- **All 11 remaining answers** in a two-column grid, with the long-form ones (occupation & schedule, why now, what it would mean, injuries) spanning full width. The frustration answer renders as `7 / 10`. Unanswered fields show a greyed italic `—`.
- **A delete button**, which opens a confirmation dialog naming the applicant. Deletion is a **permanent Firestore delete and cannot be undone.**

A count sits above the list; when exactly 200 are returned it reads *"200 total (latest 200)"* so you know the list is capped.

**Empty state:** *"No applications yet. They'll appear here the moment someone submits the form."*

**Error states:**
- *"Firestore admin credentials are not configured. Set FIREBASE_ADMIN_* env vars."*
- *"Could not read submissions. Check the service account and that Firestore is enabled."*

### Tab 2 — Received emails

Reads live from Resend. Each email shows subject, sender, which of your addresses it was received for, the date, and the plain-text body (scrollable, capped at ~20rem). If a message has no plain-text part you get *"(No plain-text body — open in Resend to view the full message.)"*

**Replying.** Every email has a reply form beneath it. Replies are:
- **Threaded** — sent with `In-Reply-To` and `References` headers pointing at the original message, so they land in the same conversation in the recipient's client
- **Sent from your domain** — specifically from the address the mail was received for, if it ends in `@coachedbyrudhra.com`; otherwise from `MAIL_FROM`
- **Subject-corrected** — `Re: ` is prefixed automatically if absent

**Removing an email is a dismiss, not a delete.** Resend has no delete API for inbound mail, so the panel records the message ID in a `dismissed_inbound` Firestore collection and filters it out of your view. The confirmation dialog says so explicitly: *"This removes it from your admin inbox. The original stays in Resend."* The message remains in Resend permanently.

If dismissals cannot be read for any reason, the panel fails open and shows everything rather than hiding mail.

**Empty state:** *"No received emails yet. Anything sent to your Resend inbound address will appear here."*

**Error states:**
- *"Email reading isn't configured. Set RESEND_API_KEY."*
- *"Could not read received emails from Resend."*

### Security notes

- The whole page is `force-dynamic` — it reads cookies, Firestore and Resend at request time and is never cached or prerendered.
- Every mutating action (delete, dismiss, reply) **re-checks the session server-side** before doing anything. A stale browser tab cannot delete or send.
- The panel is `noindex, nofollow` and disallowed in `robots.txt`.
- Applications are read with the Firebase **Admin** SDK using a service account, so client-side Firestore rules can (and should) deny all public access to the collection.

---

## 9. SEO features

### Crawlable content

The homepage is an interactive deck whose slides live in client state, which means a crawler landing on `/` sees only the hero. The four content pages — `/coaching`, `/about`, `/faq`, `/results` — exist so all of the copy has real, rankable URLs. They are fully server-rendered and statically prerendered, and they reuse the same copy from [lib/content.ts](lib/content.ts) rather than duplicating it.

Site-wide indexable text: **7,081 characters**, up from 824.

The footer link block on `/` is the crawl path into those pages — without it they would be reachable only via the sitemap.

### Metadata

- `metadataBase` set from `NEXT_PUBLIC_SITE_URL`, with a title template (`%s — COACHEDBYRUDHRA`)
- Per-page canonicals on every route
- Open Graph and Twitter cards on every page, including `og:image:alt` and `twitter:image`
- A dynamically generated 1200×630 branded OG image at `/opengraph-image`, built with `next/og` using system fonts (no font dependency)
- `en-IN` locale, `theme-color`, web manifest, icons
- Telephone auto-detection disabled so phone numbers aren't mangled by iOS

### Canonical host

The apex domain **308-redirects to `www`**, so the canonical origin is `https://www.coachedbyrudhra.com`. This is set in Vercel as `NEXT_PUBLIC_SITE_URL` (Production) and matched by the fallback in [lib/content.ts](lib/content.ts).

This matters: canonicals pointing at the redirecting apex would send every crawler through a redirect hop and dilute ranking signals.

### Structured data (JSON-LD)

Built in [lib/seo.ts](lib/seo.ts), emitted as a single `@graph` per page with nodes joined by `@id` so nothing is declared twice.

**Emitted on every page** (from the root layout):
- `ProfessionalService` — the business: name, description, logo, email, telephone, price range, INR currency, area served (India), Instagram, offer catalog built from the program pillars, and an `AggregateOffer` with `lowPrice: 10000`
- `WebSite`
- `Person` — Rudhra, as the coach entity

**Per page:**
| Page | Additional nodes |
|---|---|
| `/coaching` | `Service` (with price + audience), `WebPage`, `BreadcrumbList` |
| `/faq` | `FAQPage` — **rich-result eligible**, built from the same five Q&As shown on the page |
| `/about` | `WebPage`, `BreadcrumbList` |
| `/results` | `ImageGallery` with each transformation as an `ImageObject`, `WebPage`, `BreadcrumbList` |

**Deliberately omitted:** street address, geo coordinates, opening hours, ratings and review counts. None were supplied by the client, and structured data that claims more than the visible page shows is a penalty risk. Adding a real business address would unlock `LocalBusiness` rich results — that needs facts, not code.

### Sitemap and robots

`/sitemap.xml` lists all six public pages with priorities, change frequencies, and a build-time `lastmod`. `/about` and `/results` carry **image sitemap entries** for the coach portrait and the four transformations.

`/robots.txt` allows everything, disallows `/admin`, and declares the host and sitemap.

### Performance (Core Web Vitals)

The background videos previously used `preload="auto"` behind every page, putting multi-megabyte downloads in direct competition with text and the hero image at first paint. Now the poster paints immediately and the video mounts on idle. Reduced-motion users download nothing.

### Semantics

Exactly one `<h1>` per page, `<nav>` landmarks with `aria-label`, a visible breadcrumb trail matching the `BreadcrumbList` schema, `aria-current="page"` on the active crumb, decorative emoji marked `aria-hidden`, and the FAQ rendered as a `<dl>` so the question/answer pairing is explicit.

### After deploying

`NEXT_PUBLIC_SITE_URL` is inlined at **build time** and these pages are statically prerendered — changing it requires a redeploy to take effect.

The remaining step is submitting the sitemap in **Google Search Console**. New pages are not discovered quickly on their own.

---

## 10. Environment variables

All are set in Vercel under Project → Settings → Environment Variables, and mirrored in `.env.local` for development.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for metadata, sitemap, robots, schema. Falls back to `https://www.coachedbyrudhra.com`. **Build-time.** |
| `ADMIN_PASSWORD` | **Yes** | Admin login. Without it nobody can log in. Changing it revokes all sessions. |
| `ADMIN_USERNAME` | No | Adds a username field to the admin login |
| `FIREBASE_ADMIN_PROJECT_ID` | **Yes** | Service account — reading/writing applications |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | **Yes** | Service account |
| `FIREBASE_ADMIN_PRIVATE_KEY` | **Yes** | Service account. Vercel stores literal `\n`; the code converts them back to real newlines. |
| `NEXT_PUBLIC_FIREBASE_*` (6 vars) | No | Public web SDK config |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | For email | Outbound SMTP |
| `MAIL_FROM` | For email | From address on the custom domain |
| `MAIL_TO` | For email | Where new-application notifications go |
| `RESEND_API_KEY` | For inbox | Reading received emails in `/admin` |

Everything except `ADMIN_PASSWORD` and the Firebase Admin trio degrades gracefully — the site keeps working with the corresponding feature disabled and a clear notice in the admin panel.

> **Never commit secrets.** `.gitignore` already excludes `.env*`, `*firebase-adminsdk*.json` and `*-service-account*.json`. Note that `vercel env pull` writes every production secret to disk — delete that file when done.

---

## 11. Content and copy

[lib/content.ts](lib/content.ts) is the single source of truth for every piece of client-supplied copy and asset: site details, hero text, all 8 deck slides, the 4 "why" pillars, the 3 program pillars, who-it's-for, what-changes, the 5 FAQs, and the transformations with their alt text.

Two conventions worth preserving:

- **Nothing is fabricated.** Anything still awaited from the client is marked `PLACEHOLDER` and surfaced in the UI as an obvious stand-in, never as fact.
- **Transformations are never cropped.** Three are branded social posts with the result baked into the image, so they display whole. Their `alt` text mirrors what is visible, for screen-reader and SEO parity.

The coach bio is shared between the deck and `/about` via [components/sections.tsx](components/sections.tsx) so the two cannot disagree.

**Assets:** `/public/media/` (hero videos + poster), `/public/rudhra-image.jpg`, `/public/transformation-{1..4}.jpg`, `/public/icon.svg`.

---

## 12. Running and deploying

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

Deployment is automatic on push to `main` via Vercel. Pushing any other branch produces a preview deployment.

> **Note:** `NEXT_PUBLIC_SITE_URL` is scoped to Production only, so preview builds fall back to the value in `lib/content.ts`.

**Important for anyone editing this codebase:** this is Next.js 16, which has breaking changes from earlier versions. Per [AGENTS.md](AGENTS.md), read the relevant guide in `node_modules/next/dist/docs/` before writing code rather than relying on memory of older APIs.

---

## 13. Known limitations

Honest list of things that are working as built but may surprise you.

1. **The "NEW" badge is always shown.** Every application card displays it regardless of the stored `status` field. That field is written as `"new"` on submission but never read or updated, so there is currently **no way to mark an application as handled** from the panel. Tracking progress means working from the date, or deleting once actioned.

2. **Applications are capped at 200.** Older submissions beyond the latest 200 are not visible in the panel. There is no pagination or search.

3. **Deleting an application is permanent** and has no undo or soft-delete.

4. **Dismissed inbound emails cannot be restored** from the panel. The record lives in the `dismissed_inbound` Firestore collection and would have to be deleted there to bring an email back into view. The email itself is always still in Resend.

5. **Admin auth is a single shared password.** There are no individual accounts, no audit trail of who did what, and no rate limiting on login attempts. The session cookie's value is fixed for a given password, so anyone who obtains the cookie has access until the password changes. This is adequate for one operator; it is not a multi-user system.

6. **Assessment answers are discarded.** The six-step quiz is a conversion device only — nothing from it reaches Firestore or the application, so a prospect who completes the assessment but not the form leaves no record.

7. **The reply "from" address is hardcoded** to accept only `@coachedbyrudhra.com` addresses; any other received-for address falls back to `MAIL_FROM`. Changing domains means editing [app/admin/actions.ts](app/admin/actions.ts).

8. **`README.md` is still create-next-app boilerplate** and does not describe this project.
