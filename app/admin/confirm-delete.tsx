"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "./actions";

export function ConfirmDelete({
  action,
  title,
  description,
}: {
  /** A server action (bound with its id) that performs the delete. */
  action: () => Promise<ActionResult>;
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onConfirm() {
    setError("");
    startTransition(async () => {
      const res = await action();
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Delete"
        title="Delete"
        className="rounded-lg p-2 text-ink-faint transition hover:bg-rust/10 hover:text-rust"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => !pending && setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-card bg-card p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{description}</p>
            {error && <p className="mt-3 text-sm text-rust">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-tile bg-card-warm px-4 py-2.5 font-display text-sm tracking-wide text-ink-soft transition hover:text-ink disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="rounded-tile bg-rust px-5 py-2.5 font-display text-sm tracking-wide text-white shadow-cta transition hover:bg-rust-dark disabled:opacity-40"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
