import type { Metadata } from "next";
import Link from "next/link";
import { Background } from "@/components/background";
import { ApplicationForm } from "@/components/application-form";
import { Display, Eyebrow } from "@/components/ui";
import { site } from "@/lib/content";

const applyDescription =
  "Apply for 1:1 online personal training and nutrition coaching with Rudhra. A short application so your plan is built around your actual schedule. Free consultation, limited spots each month.";

export const metadata: Metadata = {
  title: "Apply for Coaching",
  description: applyDescription,
  alternates: { canonical: "/apply" },
  openGraph: {
    type: "website",
    title: "Apply for 1:1 Coaching — Free Consultation",
    description: applyDescription,
    url: "/apply",
    images: [
      { url: "/opengraph-image", alt: `${site.name} — Apply for Coaching` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply for 1:1 Coaching — Free Consultation",
    description: applyDescription,
  },
};

export default function ApplyPage() {
  return (
    <>
      <Background />
      <main className="flex min-h-dvh flex-col items-center px-4 py-12">
        <div className="mx-auto w-full max-w-lg text-center">
          <Eyebrow>Client Application</Eyebrow>
          <div className="mt-3">
            <Display lead="Thinking About Starting Isn't" accent="Being Ready." />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft">
            Mostly tap-to-answer, about two minutes. It helps Rudhra understand
            your schedule, goals, and mindset as a busy professional — so the
            plan actually fits your life, not the other way around.
          </p>
        </div>

        <div className="mt-8 w-full max-w-lg">
          <ApplicationForm />
        </div>

        <Link
          href="/"
          className="mt-8 text-sm text-ink-soft underline transition hover:text-rust"
        >
          ← Back to the site
        </Link>
      </main>
    </>
  );
}
