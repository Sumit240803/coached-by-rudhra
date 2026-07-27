# Email (Resend + nodemailer)

## Sending — new-application notifications

When someone completes the form, `POST /api/apply`:

1. Saves the submission to Firestore (Admin SDK), then
2. Sends a **notification email to Rudhra** in the background (`after()`), so the
   applicant never waits on SMTP. Best-effort: a mail failure never loses a lead.

The email is a **professional, dark/light-aware** HTML template (see
`lib/mailer.ts`) showing the applicant's name, a click-to-call phone, a "Message
on WhatsApp" button, and every answer.

> The form collects a phone/WhatsApp number, not an email — so this notifies
> **you**, not the applicant. (Add an email field later to also confirm to them.)

### Sending env (via Resend SMTP)

| Var | Value |
| --- | --- |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_PORT` | `465` (implicit TLS) |
| `SMTP_USER` | `resend` |
| `SMTP_PASS` | your Resend API key (`re_…`) — **secret** |
| `MAIL_FROM` | `CoachedByRudhra <apply@coachedbyrudhra.com>` (custom domain) |
| `MAIL_TO` | `coachedbyrudhra@gmail.com` (where notifications land) |

Sending requires a **verified domain** in Resend. `coachedbyrudhra.com` is
verified (SPF/DKIM), so `apply@coachedbyrudhra.com` is a valid `From`.

## Receiving — inbound emails in `/admin`

The **Received emails** tab in `/admin` reads inbound emails **live from the
Resend API** (`GET /emails/inbound`, enriched per-message) — no webhook, no
extra storage, always in sync with Resend.

| Var | Value |
| --- | --- |
| `RESEND_API_KEY` | your Resend API key (`re_…`) — **secret** |

For emails to arrive, `coachedbyrudhra.com` must have **receiving enabled** with
Resend's **MX records** in place (already done — the domain shows
`receiving: enabled`). Any message sent to your inbound address then appears
under **Received emails**, newest first, with sender, subject, date, and body.

## Vercel

All of the above are set in Vercel **Production**. They're **secrets** (except
none are public) — never commit them. A redeploy is needed for changes to take
effect. Outbound SMTP works from Vercel's runtime (it's only blocked in some
local/sandbox networks).
