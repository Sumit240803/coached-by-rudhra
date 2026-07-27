import Link from "next/link";
import type { ReactNode } from "react";
import { Background } from "@/components/background";
import { SiteFooter } from "@/components/site-footer";
import { Display, Eyebrow } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import type { Crumb } from "@/lib/seo";

/**
 * Shared chrome for the standalone content pages: background, visible
 * breadcrumb trail, a single `h1`, the page body, and the footer link block.
 *
 * These pages are fully server-rendered — no client state gates the copy — so
 * everything inside lands in the initial HTML.
 */
export function PageShell({
  crumbs,
  eyebrow,
  lead,
  accent,
  intro,
  jsonLd,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  lead: string;
  accent: string;
  intro?: ReactNode;
  jsonLd: object;
  children: ReactNode;
}) {
  return (
    <>
      <Background />
      <JsonLd data={jsonLd} />

      <div className="flex min-h-dvh flex-col">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto w-full max-w-3xl px-4 pt-6"
        >
          {/* The trail sits over the video montage, so it carries its own
              backdrop — at text-ink-faint it was unreadable on bright frames. */}
          <ol className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-cream/70 px-3 py-1.5 font-display text-xs tracking-widest text-ink-soft backdrop-blur-sm">
            <li>
              <Link href="/" className="transition hover:text-rust">
                Home
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-ink-faint">
                  /
                </span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="font-medium text-ink">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="transition hover:text-rust">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <main className="flex-1 px-4 pt-8 pb-4 sm:px-6">
          <header className="mx-auto max-w-3xl text-center">
            <Eyebrow>{eyebrow}</Eyebrow>
            <div className="mt-3">
              <Display lead={lead} accent={accent} />
            </div>
            {intro && (
              <p className="mx-auto mt-5 max-w-xl text-ink-soft">{intro}</p>
            )}
          </header>

          <div className="mt-10">{children}</div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
