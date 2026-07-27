import Link from "next/link";
import { site } from "@/lib/content";

/**
 * Site-wide footer.
 *
 * Beyond the obvious navigation value this is the crawl path into every content
 * page: the homepage is an interactive deck whose slides live in client state,
 * so without a server-rendered link block the content pages would be orphaned
 * from `/` and reachable only via the sitemap.
 */

export const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Rudhra" },
  { href: "/coaching", label: "Coaching & Pricing" },
  { href: "/results", label: "Client Results" },
  { href: "/faq", label: "FAQ" },
  { href: "/apply", label: "Apply" },
] as const;

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`w-full px-4 pt-10 pb-8 ${className}`}>
      <nav aria-label="Footer" className="mx-auto max-w-3xl">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {footerLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-display text-xs tracking-widest text-ink-soft transition hover:text-rust"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-xs tracking-widest text-ink-soft transition hover:text-rust"
            >
              Instagram
            </Link>
          </li>
        </ul>

        <p className="mt-5 text-center text-xs text-ink-faint">
          1:1 online personal training &amp; nutrition coaching across India ·{" "}
          <a
            href={`mailto:${site.supportEmail}`}
            className="transition hover:text-rust"
          >
            {site.supportEmail}
          </a>
        </p>
      </nav>
    </footer>
  );
}
