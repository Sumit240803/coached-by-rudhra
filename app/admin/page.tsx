import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  isAdminAuthConfigured,
  isValidSession,
  requiresUsername,
} from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { LoginForm } from "./login-form";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Reads cookies + Firestore at request time — never prerender.
export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  name?: string;
  phone?: string;
  summary?: string;
  status?: string;
  source?: string;
  createdAt?: string | null;
};

async function loadSubmissions(): Promise<
  { rows: Submission[]; error?: string }
> {
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
        status: d.status,
        source: d.source,
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

export default async function AdminPage() {
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

  const { rows, error } = await loadSubmissions();

  return (
    <main className="min-h-dvh bg-cream px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">
              Applications
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {error ? "—" : `${rows.length} total`}
              {rows.length === 200 ? " (showing latest 200)" : ""}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-tile bg-card px-4 py-2.5 font-display text-sm tracking-wide text-ink-soft shadow-tile transition hover:text-rust"
            >
              Log out
            </button>
          </form>
        </div>

        {error ? (
          <div className="mt-8 rounded-card border border-dashed border-tan bg-card p-6 text-sm text-ink-soft">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-card bg-card p-8 text-center text-ink-soft shadow-card">
            No applications yet. They&apos;ll appear here the moment someone
            submits the form.
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-card bg-card p-5 shadow-card sm:p-6"
              >
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
                  <span className="text-xs text-ink-faint">
                    {row.createdAt ?? "—"}
                  </span>
                </div>
                <pre className="mt-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                  {row.summary || "(no details)"}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
