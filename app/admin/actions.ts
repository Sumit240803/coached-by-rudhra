"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  isAdminAuthConfigured,
  requiresUsername,
  sessionToken,
  verifyPassword,
  verifyUsername,
} from "@/lib/admin-auth";

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
