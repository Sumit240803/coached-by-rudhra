import type { Metadata } from "next";
import Link from "next/link";
import { Background } from "@/components/background";
import { Card, Display, Eyebrow, LinkButton } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Application received",
  description: "Thanks for applying — Rudhra will be in touch soon.",
  robots: { index: false, follow: false },
};

export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const raw = (await searchParams).name ?? "";
  const firstName = raw.trim().split(/[,\s]/)[0]?.slice(0, 40) ?? "";

  return (
    <>
      <Background />
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/15 text-4xl">
            ✅
          </div>

          <div className="mt-5">
            <Eyebrow>You&apos;re In The Queue</Eyebrow>
          </div>
          <div className="mt-3">
            <Display lead="Application" accent="Received." />
          </div>

          <p className="mx-auto mt-4 max-w-md text-ink-soft">
            Thanks{firstName ? `, ${firstName}` : ""}. Rudhra personally reviews
            every application and will reach out to you soon. Spots for 1:1
            coaching are limited each month, so keep an eye on your phone.
          </p>

          <div className="mt-6 rounded-tile bg-card-warm p-4 text-sm text-ink-soft">
            Need to reach us in the meantime? Email{" "}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-rust hover:underline"
            >
              {site.supportEmail}
            </a>
          </div>

          <div className="mt-6 space-y-3">
            <LinkButton
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow {site.handle} →
            </LinkButton>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block text-sm text-ink-soft underline transition hover:text-rust"
          >
            ← Back to home
          </Link>
        </Card>
      </main>
    </>
  );
}
