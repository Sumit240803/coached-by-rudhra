"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  isAdminAuthConfigured,
  isValidSession,
  requiresUsername,
  sessionToken,
  verifyPassword,
  verifyUsername,
} from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendReply } from "@/lib/mailer";

async function isAdmin() {
  const jar = await cookies();
  return isValidSession(jar.get(ADMIN_COOKIE)?.value);
}

export type ActionResult = { ok?: boolean; error?: string };

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAdminAuthConfigured()) {
    return { error: "Admin password is not configured yet." };
  }
  const user = String(formData.get("username") ?? "");
  const pw = String(formData.get("password") ?? "");
  const ok = verifyUsername(user) && verifyPassword(pw);
  if (!ok) {
    return {
      error: requiresUsername()
        ? "Incorrect username or password."
        : "Incorrect password.",
    };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: "Not authorized." };
  const db = getAdminDb();
  if (!db) return { error: "Not configured." };
  try {
    await db.collection("applications").doc(id).delete();
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("Delete application failed", err);
    return { error: "Could not delete the application." };
  }
}

/**
 * Resend has no delete API for inbound emails, so "delete" here means dismiss:
 * record the id and filter it out of the admin inbox view.
 */
export async function dismissInboundEmail(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: "Not authorized." };
  if (!id) return { error: "Missing id." };
  const db = getAdminDb();
  if (!db) return { error: "Not configured." };
  try {
    await db
      .collection("dismissed_inbound")
      .doc(id)
      .set({ dismissedAt: new Date().toISOString() });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("Dismiss inbound failed", err);
    return { error: "Could not remove the email." };
  }
}

export type ReplyState = { ok?: boolean; error?: string };

export async function replyToEmail(
  _prev: ReplyState,
  formData: FormData,
): Promise<ReplyState> {
  // Only a logged-in admin may send replies.
  const jar = await cookies();
  if (!isValidSession(jar.get(ADMIN_COOKIE)?.value)) {
    return { error: "Not authorized." };
  }

  const to = String(formData.get("to") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  let subject = String(formData.get("subject") ?? "").trim();
  const fromAddress = String(formData.get("fromAddress") ?? "").trim();
  const inReplyTo = String(formData.get("inReplyTo") ?? "").trim();

  if (!to || !body) return { error: "Nothing to send." };
  if (!subject) subject = "Re:";
  if (!/^re:/i.test(subject)) subject = `Re: ${subject}`;

  // Reply from the domain address the mail was received for, if valid.
  const from =
    fromAddress && fromAddress.endsWith("@coachedbyrudhra.com")
      ? `CoachedByRudhra <${fromAddress}>`
      : undefined;

  const res = await sendReply({ from, to, subject, body, inReplyTo });
  if (!res.sent) {
    return { error: res.error || "Could not send the reply." };
  }
  return { ok: true };
}
