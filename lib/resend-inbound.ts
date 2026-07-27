/**
 * Reads inbound (received) emails from the Resend API for the admin panel.
 * Server-only; uses RESEND_API_KEY. No webhook needed — Resend is the source
 * of truth and we read it live.
 */
import "server-only";

const KEY = process.env.RESEND_API_KEY;
const BASE = "https://api.resend.com";

export const isResendConfigured = Boolean(KEY);

export type InboundEmail = {
  id: string;
  from: string;
  to: string[];
  receivedFor: string[];
  subject: string;
  createdAt: string;
  text: string;
  html: string;
};

async function resendGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend GET ${path} → ${res.status}`);
  return res.json();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalize(e: any, id: string): InboundEmail {
  return {
    id,
    from: e.from ?? "",
    to: Array.isArray(e.to) ? e.to : e.to ? [e.to] : [],
    receivedFor: Array.isArray(e.received_for) ? e.received_for : [],
    subject: e.subject ?? "(no subject)",
    createdAt: e.created_at ?? "",
    text: e.text ?? "",
    html: e.html ?? "",
  };
}

/**
 * Lists recent received emails, enriched with body content (best-effort per
 * message). Returns `null` if Resend isn't configured; throws on API failure
 * so the caller can show an error state.
 */
export async function listInboundEmails(limit = 30): Promise<InboundEmail[] | null> {
  if (!KEY) return null;

  const list = await resendGet("/emails/inbound");
  const items: any[] = Array.isArray(list?.data) ? list.data : [];

  const enriched = await Promise.all(
    items.slice(0, limit).map(async (it) => {
      const id = it.id ?? it.email_id ?? "";
      if (!id) return normalize(it, id);
      try {
        const full = await resendGet(`/emails/inbound/${id}`);
        return normalize(full?.data ?? full, id);
      } catch {
        // Fall back to the list metadata if the body fetch fails.
        return normalize(it, id);
      }
    }),
  );

  return enriched;
}
