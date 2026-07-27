/**
 * Minimal password gate for the admin panel ("normal password auth for now").
 *
 * A single shared password is set via ADMIN_PASSWORD. On login we set an
 * httpOnly cookie holding an HMAC of a fixed string keyed by the password, so
 * the cookie value can't be forged without knowing the password, and the
 * password itself never lands in the browser.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "cbr_admin";

function password() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function username() {
  return process.env.ADMIN_USERNAME ?? "";
}

export function isAdminAuthConfigured() {
  return password().length > 0;
}

/** A username field is shown/required only when ADMIN_USERNAME is set. */
export function requiresUsername() {
  return username().length > 0;
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(input: string) {
  if (!isAdminAuthConfigured()) return false;
  return safeEqual(input, password());
}

export function verifyUsername(input: string) {
  if (!requiresUsername()) return true;
  return safeEqual(input, username());
}

/** Opaque session value stored in the cookie. */
export function sessionToken() {
  return createHmac("sha256", password())
    .update("cbr-admin-session-v1")
    .digest("hex");
}

export function isValidSession(token: string | undefined) {
  if (!token || !isAdminAuthConfigured()) return false;
  return safeEqual(token, sessionToken());
}
