/**
 * Email notifications via nodemailer over SMTP.
 *
 * Configured entirely from env so any provider works (Google Workspace, Zoho,
 * Resend SMTP, Brevo, Mailgun, SES, …). The `from` address uses the custom
 * domain via MAIL_FROM. Everything is optional — if SMTP isn't configured yet,
 * sending is skipped so submissions still save.
 */
import "server-only";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

/** From address on the custom domain, e.g. "CoachedByRudhra <apply@yourdomain.com>". */
const from = process.env.MAIL_FROM;
/** Where new-application notifications are delivered (Rudhra's inbox). */
const to = process.env.MAIL_TO;

export const isMailConfigured = Boolean(host && user && pass && from && to);

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!isMailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user, pass },
      // Fail fast if the SMTP server is unreachable instead of hanging.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type EmailRow = { label: string; value: string };

/**
 * Professional, dark/light-aware HTML for the notification email. Base inline
 * styles render the light theme everywhere; the `prefers-color-scheme: dark`
 * block re-themes it (with !important) for clients that support it.
 */
function renderApplicationEmail(input: {
  name: string;
  phone: string;
  rows: EmailRow[];
}) {
  const { name, phone, rows } = input;
  const telHref = "tel:" + String(phone || "").replace(/[^\d+]/g, "");
  const waHref = "https://wa.me/" + String(phone || "").replace(/[^\d]/g, "");

  const rowsHtml = rows
    .map(
      (r, i) => `
      <tr>
        <td class="qcell" style="padding:14px 0 ${i === rows.length - 1 ? "0" : "14px"};${i === rows.length - 1 ? "" : "border-bottom:1px solid #efe6da;"}">
          <div class="qlabel" style="font-size:12px;line-height:1.4;color:#8a7768;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;">${esc(r.label)}</div>
          <div class="qvalue" style="font-size:15px;line-height:1.5;color:#2b1d16;${r.value ? "" : "color:#b4a596;font-style:italic;"}">${r.value ? esc(r.value) : "—"}</div>
        </td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>New coaching application</title>
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { margin:0; padding:0; width:100%; background:#f2eae0; }
  a { text-decoration:none; }
  @media (prefers-color-scheme: dark) {
    .email-bg   { background:#171110 !important; }
    .email-card { background:#241b16 !important; box-shadow:none !important; }
    .heading    { color:#f5efe8 !important; }
    .eyebrow    { color:#d9a288 !important; }
    .subtle     { color:#b8a99d !important; }
    .qlabel     { color:#a8988b !important; }
    .qvalue     { color:#f0e8e0 !important; }
    .qcell      { border-color:#3a2c24 !important; }
    .panel      { background:#2e231d !important; }
    .accent     { color:#e8926a !important; }
    .divider    { border-color:#3a2c24 !important; }
    .footer     { color:#8a7a6d !important; }
  }
</style>
</head>
<body class="email-bg" style="margin:0;padding:0;background:#f2eae0;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">New application from ${esc(name)} — ${esc(phone)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-bg" style="background:#f2eae0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr><td style="height:5px;background:#b0522f;border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td class="email-card" style="background:#ffffff;border-radius:0 0 16px 16px;padding:32px;box-shadow:0 12px 40px rgba(43,29,22,.12);">
              <div class="eyebrow" style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#b0522f;font-weight:700;">CoachedByRudhra</div>
              <h1 class="heading" style="margin:6px 0 4px;font-size:24px;line-height:1.2;color:#2b1d16;font-weight:800;">New coaching application</h1>
              <p class="subtle" style="margin:0 0 20px;font-size:14px;color:#6b5a50;">Someone just completed the form on your site.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="panel" style="background:#faf6f1;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div class="qlabel" style="font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#8a7768;">Name</div>
                    <div class="heading" style="font-size:18px;font-weight:700;color:#2b1d16;margin:2px 0 12px;">${esc(name) || "—"}</div>
                    <div class="qlabel" style="font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#8a7768;">Phone / WhatsApp</div>
                    <div style="margin-top:2px;">
                      <a href="${telHref}" class="accent" style="font-size:18px;font-weight:700;color:#b0522f;">${esc(phone) || "—"}</a>
                    </div>
                    <div style="margin-top:14px;">
                      <a href="${waHref}" style="display:inline-block;background:#25a35a;color:#ffffff;font-size:14px;font-weight:600;padding:9px 16px;border-radius:9px;">Message on WhatsApp</a>
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                ${rowsHtml}
              </table>

              <hr class="divider" style="border:none;border-top:1px solid #efe6da;margin:24px 0 16px;">
              <p class="footer" style="margin:0;font-size:12px;color:#a19086;line-height:1.5;">
                Sent automatically from the CoachedByRudhra website · coachedbyrudhra.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends the coach a "new application" notification. Best-effort: returns a
 * result so a mail failure never loses a lead.
 */
export async function sendApplicationNotification(input: {
  name: string;
  phone: string;
  rows: EmailRow[];
}): Promise<{ sent: boolean; skipped?: boolean; error?: string }> {
  const tx = getTransporter();
  if (!tx) return { sent: false, skipped: true };

  const { name, phone, rows } = input;
  const subject = `New coaching application — ${name || "Unnamed"}`;
  const text = [
    `New application from the website.`,
    ``,
    ...rows.map((r) => `${r.label}\n${r.value || "—"}`),
  ].join("\n\n");

  try {
    await tx.sendMail({
      from,
      to,
      subject,
      text,
      html: renderApplicationEmail({ name, phone, rows }),
    });
    return { sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("Email send failed", error);
    return { sent: false, error };
  }
}
