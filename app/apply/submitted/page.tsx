import type { Metadata } from "next";
import Link from "next/link";
import { Background } from "@/components/background";
import { CalendlyInline } from "@/components/calendly";
import { Card, Display, Eyebrow, LinkButton } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book your call",
  description: "Your application is in — now pick a time to speak to Rudhra.",
  robots: { index: false, follow: false },
};

/**
 * Prefills the applicant's first name so they don't retype what they just
 * told us, and tints the widget to match the site accent (ignored by Calendly
 * on plans without embed customisation, which costs us nothing).
 */
function bookingUrl(firstName: string) {
  const url = new URL(site.calendly);
  if (firstName) url.searchParams.set("name", firstName);
  url.searchParams.set("primary_color", "17120f");
  return url.toString();
}

export default async function SubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const raw = (await searchParams).name ?? "";
  const firstName = raw.trim().split(/[,\s]/)[0]?.slice(0, 40) ?? "";
  const booking = bookingUrl(firstName);

  return (
    <>
      <Background />
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp/15 text-4xl">
            ✅
          </div>

          <div className="mt-5">
            <Eyebrow>Application Received</Eyebrow>
          </div>
          <div className="mt-3">
            <Display lead="One Last" accent="Step." />
          </div>

          <p className="mx-auto mt-4 max-w-md text-ink-soft">
            {firstName ? `Thanks, ${firstName}. ` : "Thanks. "}
            Rudhra has your answers. Now pick a time for your free consultation,
            and he&apos;ll come to the call having already read them.
          </p>

          <CalendlyInline url={booking} />

          {/* The widget is the convenience; this link is the mechanism, and it
              works whether or not a third-party script loads. */}
          <div className="mt-6">
            <LinkButton
              href={booking}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book your free call →
            </LinkButton>
            <p className="mt-3 text-sm text-ink-soft">
              Opens Rudhra&apos;s booking page in a new tab.
            </p>
          </div>

          <div className="mt-6 rounded-tile bg-card-warm p-4 text-sm text-ink-soft">
            Nothing on the calendar suits your week? Email{" "}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-rust hover:underline"
            >
              {site.supportEmail}
            </a>{" "}
            and we&apos;ll find a slot around it.
          </div>

          {/* Secondary links stay quiet — booking is the only job on this page. */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-ink-soft">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition hover:text-rust"
            >
              Follow {site.handle}
            </a>
            <span aria-hidden="true">·</span>
            <Link href="/" className="underline transition hover:text-rust">
              Back to home
            </Link>
          </div>
        </Card>
      </main>
    </>
  );
}
