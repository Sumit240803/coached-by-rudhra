"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  isAdminAuthConfigured,
  isValidSession,
  requiresUsername,
  sessionToken,
  verifyPassword,
  verifyUsername,
} from "@/lib/admin-auth";
import { sendReply } from "@/lib/mailer";

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
