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
import { questions } from "@/lib/application-questions";
import { LoginForm } from "./login-form";
import { ReplyForm } from "./reply-form";
import { ConfirmDelete } from "./confirm-delete";
import { logout, deleteApplication, dismissInboundEmail } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Reads cookies + Firestore + Resend at request time — never prerender.
export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  answers: Record<string, string>;
  createdAt: string | null;
};

/** Concise field labels for the admin card (the form labels are conversational). */
const SHORT_LABELS: Record<string, string> = {
  age: "Age",
  work: "Occupation",
  hours: "Work hours",
  why: "Why now",
  frustration: "Frustration (1–10)",
  meaning: "What it would mean",
  goal: "Primary goal",
  activity: "Activity level",
  injuries: "Injuries / conditions",
  access: "Training access",
  diet: "Diet",
  commitment: "Weekly commitment",
  investment: "Investment comfort",
  notes: "Anything else",
};
const FULL_WIDTH = new Set(["why", "meaning", "injuries", "notes"]);

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
      const answers: Record<string, string> = {};
      for (const q of questions) {
        answers[q.id] = typeof d[q.id] === "string" ? d[q.id] : "";
      }
      return {
        id: doc.id,
        answers,
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
    // Filter out any emails dismissed from the admin view.
    const db = getAdminDb();
    let dismissed = new Set<string>();
    if (db) {
      try {
        const snap = await db.collection("dismissed_inbound").get();
        dismissed = new Set(snap.docs.map((d) => d.id));
      } catch {
        /* ignore — show everything if we can't read dismissals */
      }
    }
    return { emails: emails.filter((e) => !dismissed.has(e.id)) };
  } catch (err) {
    console.error("Inbox load failed", err);
    return { emails: [], error: "Could not read received emails from Resend." };
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

        <nav className="mt-5 flex gap-2">
          <Tab href="/admin" active={view === "applications"}>
            Applications
          </Tab>
          <Tab href="/admin?view=inbox" active={view === "inbox"}>
            Received emails
          </Tab>
        </nav>

        <div className="mt-6">{view === "inbox" ? <Inbox /> : <Applications />}</div>
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

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-card p-8 text-center text-ink-soft shadow-card">
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-tan bg-card p-6 text-sm text-ink-soft">
      {children}
    </div>
  );
}

async function Applications() {
  const { rows, error } = await loadSubmissions();

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (rows.length === 0)
    return (
      <Empty>
        No applications yet. They&apos;ll appear here the moment someone submits
        the form.
      </Empty>
    );

  return (
    <>
      <p className="mb-4 text-sm text-ink-soft">
        {rows.length} total{rows.length === 200 ? " (latest 200)" : ""}
      </p>
      <ul className="space-y-4">
        {rows.map((row) => {
          const name = row.answers.name || "Unnamed";
          const phone = row.answers.phone;
          return (
            <li key={row.id} className="rounded-card bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-3 border-b border-rust/10 pb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-ink">
                      {name}
                    </h3>
                    <span className="rounded-full bg-rust/10 px-2 py-0.5 font-display text-[0.6rem] tracking-widest text-rust">
                      NEW
                    </span>
                  </div>
                  {phone && (
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="mt-0.5 inline-block text-sm text-rust hover:underline"
                    >
                      {phone}
                    </a>
                  )}
                </div>
                <div className="flex flex-none items-center gap-2">
                  <span className="hidden text-xs text-ink-faint sm:inline">
                    {row.createdAt ?? "—"}
                  </span>
                  <ConfirmDelete
                    action={deleteApplication.bind(null, row.id)}
                    title="Delete this application?"
                    description={`This permanently removes ${name} from the database. This can't be undone.`}
                  />
                </div>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {questions
                  .filter((q) => q.id !== "name" && q.id !== "phone")
                  .map((q) => {
                    const v = row.answers[q.id];
                    const display =
                      q.id === "frustration" && v ? `${v} / 10` : v;
                    return (
                      <div
                        key={q.id}
                        className={FULL_WIDTH.has(q.id) ? "sm:col-span-2" : ""}
                      >
                        <dt className="font-display text-[0.65rem] tracking-widest text-ink-faint uppercase">
                          {SHORT_LABELS[q.id] ?? q.label}
                        </dt>
                        <dd
                          className={`mt-1 text-sm leading-relaxed ${
                            v ? "text-ink" : "text-ink-faint italic"
                          }`}
                        >
                          {display || "—"}
                        </dd>
                      </div>
                    );
                  })}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}

async function Inbox() {
  const { emails, error } = await loadInbox();

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (emails.length === 0)
    return (
      <Empty>
        No received emails yet. Anything sent to your Resend inbound address will
        appear here.
      </Empty>
    );

  return (
    <ul className="space-y-4">
      {emails.map((e) => (
        <li key={e.id} className="rounded-card bg-card p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-3 border-b border-rust/10 pb-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold text-ink">
                {e.subject}
              </h3>
              <span className="mt-0.5 block text-sm text-ink-soft">
                From <span className="text-rust">{e.from || "unknown"}</span>
                {e.receivedFor.length > 0 && (
                  <span className="text-ink-faint">
                    {" "}
                    → {e.receivedFor.join(", ")}
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-none items-center gap-2">
              <span className="hidden text-xs text-ink-faint sm:inline">
                {fmtDate(e.createdAt)}
              </span>
              <ConfirmDelete
                action={dismissInboundEmail.bind(null, e.id)}
                title="Remove this email?"
                description="This removes it from your admin inbox. The original stays in Resend."
              />
            </div>
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
          <ReplyForm
            to={e.from}
            subject={e.subject}
            fromAddress={e.receivedFor[0] ?? ""}
            inReplyTo={e.messageId}
          />
        </li>
      ))}
    </ul>
  );
}
