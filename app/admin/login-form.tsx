"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({
  configured,
  requiresUsername,
}: {
  configured: boolean;
  requiresUsername: boolean;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <div className="w-full max-w-sm rounded-card bg-card p-8 shadow-card">
      <h1 className="font-display text-2xl font-bold text-ink">Admin</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Enter the password to view applications.
      </p>

      {!configured && (
        <p className="mt-4 rounded-tile border border-dashed border-tan bg-card-warm px-3 py-2 text-sm text-ink-soft">
          Set <code className="text-rust">ADMIN_PASSWORD</code> to enable login.
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-3">
        {requiresUsername && (
          <input
            type="text"
            name="username"
            autoFocus
            autoComplete="username"
            placeholder="Username"
            className="w-full rounded-tile border border-rust/20 bg-card-warm px-4 py-3 text-base outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/20"
          />
        )}
        <input
          type="password"
          name="password"
          autoFocus={!requiresUsername}
          autoComplete="current-password"
          placeholder="Password"
          className="w-full rounded-tile border border-rust/20 bg-card-warm px-4 py-3 text-base outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/20"
        />
        {state.error && (
          <p className="mt-2 text-sm text-rust">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending || !configured}
          className="mt-4 w-full rounded-tile bg-rust px-6 py-3.5 font-display font-semibold tracking-wide text-white shadow-cta transition hover:bg-rust-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
