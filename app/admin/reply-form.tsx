"use client";

import { useActionState, useState } from "react";
import { replyToEmail, type ReplyState } from "./actions";

export function ReplyForm({
  to,
  subject,
  fromAddress,
  inReplyTo,
}: {
  to: string;
  subject: string;
  fromAddress: string;
  inReplyTo: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ReplyState, FormData>(
    replyToEmail,
    {},
  );

  if (state.ok) {
    return (
      <p className="mt-4 text-sm font-medium text-whatsapp">
        ✓ Reply sent to {to}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-tile bg-rust px-4 py-2 font-display text-sm tracking-wide text-white shadow-cta transition hover:bg-rust-dark"
      >
        ↩ Reply
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 border-t border-rust/10 pt-4">
      <input type="hidden" name="to" value={to} />
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="fromAddress" value={fromAddress} />
      <input type="hidden" name="inReplyTo" value={inReplyTo} />

      <p className="mb-2 text-xs text-ink-soft">
        Replying to <span className="text-rust">{to}</span>
        {fromAddress ? ` from ${fromAddress}` : ""}
      </p>
      <textarea
        name="body"
        rows={4}
        required
        autoFocus
        placeholder="Write your reply…"
        className="w-full resize-y rounded-tile border border-rust/20 bg-card-warm px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink-faint focus:border-rust focus:ring-2 focus:ring-rust/20"
      />
      {state.error && (
        <p className="mt-2 text-sm text-rust">{state.error}</p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-tile bg-rust px-5 py-2.5 font-display text-sm tracking-wide text-white shadow-cta transition hover:bg-rust-dark disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send reply"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="rounded-tile bg-card-warm px-4 py-2.5 font-display text-sm tracking-wide text-ink-soft transition hover:text-rust disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
