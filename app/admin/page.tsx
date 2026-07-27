import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  isAdminAuthConfigured,
  isValidSession,
  requiresUsername,
} from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { listInboundEmails, type InboundEmail } from "@/lib/resend-inbound";
import { LoginForm } from "./login-form";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Reads cookies + Firestore + Resend at request time — never prerender.
export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  name?: string;
  phone?: string;
  summary?: string;
  createdAt?: string | null;
};

async function loadSubmissions(): Promise<{ rows: Submission[]; error?: string }> {
  const db = getAdminDb();
  if (!db) {
    return {
      rows: [],
      error:
        "Firestore admin credentials are not configured. Set FIREBASE_ADMIN_* env vars.",
    };
  }
  try {
    const snap = await db
      .collection("applications")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    const rows = snap.docs.map((doc) => {
      const d = doc.data();
      const created =
        d.createdAt && typeof d.createdAt.toDate === "function"
          ? d.createdAt.toDate()
          : null;
      return {
        id: doc.id,
        name: d.name,
        phone: d.phone,
        summary: d.summary,
        createdAt: created
          ? created.toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : null,
      } satisfies Submission;
    });
    return { rows };
  } catch (err) {
    console.error("Admin load failed", err);
    return {
      rows: [],
      error:
        "Could not read submissions. Check the service account and that Firestore is enabled.",
    };
  }
}

async function loadInbox(): Promise<{ emails: InboundEmail[]; error?: string }> {
  try {
    const emails = await listInboundEmails(50);
    if (emails === null) {
      return {
        emails: [],
        error: "Email reading isn't configured. Set RESEND_API_KEY.",
      };
    }
    return { emails };
  } catch (err) {
    console.error("Inbox load failed", err);
    return {
      emails: [],
      error: "Could not read received emails from Resend.",
    };
  }
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const jar = await cookies();
  const authed = isValidSession(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-cream px-4">
        <LoginForm
          configured={isAdminAuthConfigured()}
          requiresUsername={requiresUsername()}
        />
      </main>
    );
  }

  const view = (await searchParams).view === "inbox" ? "inbox" : "applications";

  return (
    <main className="min-h-dvh bg-cream px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-ink">
            {view === "inbox" ? "Received emails" : "Applications"}
          </h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-tile bg-card px-4 py-2.5 font-display text-sm tracking-wide text-ink-soft shadow-tile transition hover:text-rust"
            >
              Log out
            </button>
          </form>
        </div>

        {/* Tabs */}
        <nav className="mt-5 flex gap-2">
          <Tab href="/admin" active={view === "applications"}>
            Applications
          </Tab>
          <Tab href="/admin?view=inbox" active={view === "inbox"}>
            Received emails
          </Tab>
        </nav>

        <div className="mt-6">
          {view === "inbox" ? <Inbox /> : <Applications />}
        </div>
      </div>
    </main>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-tile px-4 py-2 font-display text-sm tracking-wide transition ${
        active
          ? "bg-rust text-white shadow-cta"
          : "bg-card text-ink-soft shadow-tile hover:text-rust"
      }`}
    >
      {children}
    </Link>
  );
}

async function Applications() {
  const { rows, error } = await loadSubmissions();

  if (error) {
    return (
      <div className="rounded-card border border-dashed border-tan bg-card p-6 text-sm text-ink-soft">
        {error}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-card bg-card p-8 text-center text-ink-soft shadow-card">
        No applications yet. They&apos;ll appear here the moment someone submits
        the form.
      </div>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-ink-soft">
        {rows.length} total{rows.length === 200 ? " (latest 200)" : ""}
      </p>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.id} className="rounded-card bg-card p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rust/10 pb-3">
              <div>
                <span className="font-display text-lg font-bold text-ink">
                  {row.name || "Unnamed"}
                </span>
                {row.phone && (
                  <a
                    href={`tel:${row.phone.replace(/\s/g, "")}`}
                    className="ml-3 text-sm text-rust hover:underline"
                  >
                    {row.phone}
                  </a>
                )}
              </div>
              <span className="text-xs text-ink-faint">{row.createdAt ?? "—"}</span>
            </div>
            <pre className="mt-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
              {row.summary || "(no details)"}
            </pre>
          </li>
        ))}
      </ul>
    </>
  );
}

async function Inbox() {
  const { emails, error } = await loadInbox();

  if (error) {
    return (
      <div className="rounded-card border border-dashed border-tan bg-card p-6 text-sm text-ink-soft">
        {error}
      </div>
    );
  }
  if (emails.length === 0) {
    return (
      <div className="rounded-card bg-card p-8 text-center text-ink-soft shadow-card">
        No received emails yet. Anything sent to your Resend inbound address will
        appear here.
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      {emails.map((e) => (
        <li key={e.id} className="rounded-card bg-card p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rust/10 pb-3">
            <div className="min-w-0">
              <span className="font-display text-lg font-bold text-ink">
                {e.subject}
              </span>
              <span className="mt-0.5 block text-sm text-ink-soft">
                From <span className="text-rust">{e.from || "unknown"}</span>
                {e.receivedFor.length > 0 && (
                  <span className="text-ink-faint"> → {e.receivedFor.join(", ")}</span>
                )}
              </span>
            </div>
            <span className="text-xs text-ink-faint">{fmtDate(e.createdAt)}</span>
          </div>
          {e.text ? (
            <pre className="mt-3 max-h-80 overflow-auto font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
              {e.text}
            </pre>
          ) : (
            <p className="mt-3 text-sm text-ink-faint italic">
              (No plain-text body — open in Resend to view the full message.)
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
