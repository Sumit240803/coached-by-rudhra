import { NextResponse, after } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { buildSummary, questions } from "@/lib/application-questions";
import { sendApplicationNotification } from "@/lib/mailer";

// nodemailer + Admin SDK need the Node.js runtime (not Edge).
export const runtime = "nodejs";

const APPLICATIONS_COLLECTION = "applications";
const MAX_LEN = 4000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const incoming =
    body && typeof body === "object" && "answers" in body
      ? (body as { answers: Record<string, unknown> }).answers
      : null;

  if (!incoming || typeof incoming !== "object") {
    return NextResponse.json({ error: "Missing answers." }, { status: 400 });
  }

  // Whitelist to known question ids, coerce to trimmed strings, cap length.
  const answers: Record<string, string> = {};
  for (const q of questions) {
    const raw = incoming[q.id];
    const value = typeof raw === "string" ? raw.trim().slice(0, MAX_LEN) : "";

    // Option-based answers only ever come from a fixed set, so anything else is
    // a tampered payload — drop it rather than storing junk. Required questions
    // then fail the missing-answer check below.
    if (value && q.type === "choice") {
      answers[q.id] = q.options?.includes(value) ? value : "";
      continue;
    }
    if (value && q.type === "multi") {
      const picked = value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => q.options?.includes(part));
      // Re-emit in canonical option order, de-duplicated.
      answers[q.id] =
        q.options?.filter((opt) => picked.includes(opt)).join(", ") ?? "";
      continue;
    }
    if (value && q.type === "scale") {
      answers[q.id] = /^([1-9]|10)$/.test(value) ? value : "";
      continue;
    }

    answers[q.id] = value;
  }

  // Required fields (everything except the optional injuries question).
  const missing = questions.find((q) => !q.optional && !answers[q.id]);
  if (missing) {
    return NextResponse.json(
      { error: `Please answer: ${missing.label}` },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Server is not configured to accept applications yet." },
      { status: 503 },
    );
  }

  const summary = buildSummary(answers);

  // 1) Persist first — capturing the lead is the critical step.
  try {
    await db.collection(APPLICATIONS_COLLECTION).add({
      ...answers,
      summary,
      status: "new",
      source: "website",
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Firestore write failed", err);
    return NextResponse.json(
      { error: "Could not save your application. Please try again." },
      { status: 500 },
    );
  }

  // 2) Notify by email in the background — the applicant never waits on SMTP,
  //    and a mail failure can't affect the already-saved submission.
  //    `after()` keeps the function alive for this on Vercel.
  after(async () => {
    await sendApplicationNotification({
      name: answers.name,
      phone: answers.phone,
      rows: questions.map((q) => ({ label: q.label, value: answers[q.id] })),
    });
  });

  return NextResponse.json({ ok: true });
}
