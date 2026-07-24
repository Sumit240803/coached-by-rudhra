import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 text-tan">
      <span className="h-px w-6 bg-tan/60" />
      <span className="font-display text-xs font-medium tracking-[0.25em]">
        {children}
      </span>
      <span className="h-px w-6 bg-tan/60" />
    </div>
  );
}

export function Display({
  lead,
  accent,
  className = "",
}: {
  lead?: ReactNode;
  accent?: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`font-display text-4xl leading-[0.95] font-bold text-ink sm:text-5xl md:text-6xl ${className}`}
    >
      {lead}
      {lead && accent ? " " : null}
      {accent ? <span className="text-rust">{accent}</span> : null}
    </h1>
  );
}

const buttonBase =
  "inline-flex w-full items-center justify-center gap-2 rounded-tile px-6 py-4 font-display text-lg font-semibold tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  className = "",
  tone = "rust",
  ...props
}: ComponentProps<"button"> & { tone?: "rust" | "whatsapp" | "ghost" }) {
  const tones = {
    rust: "bg-rust text-white shadow-cta hover:bg-rust-dark",
    whatsapp: "bg-whatsapp text-white hover:brightness-95",
    ghost: "bg-card-warm text-ink ring-1 ring-rust/25 hover:ring-rust/60",
  };
  return (
    <button className={`${buttonBase} ${tones[tone]} ${className}`} {...props} />
  );
}

export function LinkButton({
  className = "",
  tone = "rust",
  ...props
}: ComponentProps<typeof Link> & { tone?: "rust" | "whatsapp" }) {
  const tones = {
    rust: "bg-rust text-white shadow-cta hover:bg-rust-dark",
    whatsapp: "bg-whatsapp text-white hover:brightness-95",
  };
  return (
    <Link className={`${buttonBase} ${tones[tone]} ${className}`} {...props} />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card bg-card/95 p-6 shadow-card backdrop-blur-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Marks copy the client still owes us, so it can never be mistaken for real. */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-dashed border-tan bg-card-warm px-2 py-0.5 text-sm text-ink-soft italic">
      {children}
    </span>
  );
}
