"use client";

import { useEffect, useRef, useState } from "react";

const WIDGET_JS = "https://assets.calendly.com/assets/external/widget.js";
const WIDGET_CSS = "https://assets.calendly.com/assets/external/widget.css";

type CalendlyApi = {
  initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void;
};

declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

/** Loads Calendly's embed script once per document and resolves when it's ready. */
function loadWidget(): Promise<void> {
  if (window.Calendly) return Promise.resolve();

  if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${WIDGET_JS}"]`,
  );
  const script = existing ?? document.createElement("script");

  const ready = new Promise<void>((resolve, reject) => {
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("widget failed")));
  });

  if (!existing) {
    script.src = WIDGET_JS;
    script.async = true;
    document.head.appendChild(script);
  }

  return ready;
}

/** How long the embed gets before we give up and leave the plain link. */
const PAINT_TIMEOUT_MS = 12_000;

/**
 * Inline Calendly scheduler.
 *
 * The booking page is always reachable as a plain link regardless of what
 * happens here — this widget is the convenience, not the mechanism. So a
 * blocked script, an offline third party or a slow network degrades to the
 * fallback the parent renders underneath rather than to a dead end.
 *
 * Loading the script is not proof the calendar rendered: the iframe is
 * cross-origin, so the only honest signal is Calendly's own postMessage. Until
 * one arrives we hold the loading state, and if none arrives in time we remove
 * the embed entirely rather than leave an empty panel on the page.
 */
export function CalendlyInline({ url }: { url: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onMessage = (e: MessageEvent) => {
      if (!e.origin.endsWith("calendly.com")) return;
      const event = (e.data as { event?: string })?.event;
      if (typeof event === "string" && event.startsWith("calendly.")) {
        if (!cancelled) setState("ready");
      }
    };
    window.addEventListener("message", onMessage);

    loadWidget()
      .then(() => {
        if (cancelled || !host.current) return;
        // Guard against React re-running the effect and stacking iframes.
        host.current.innerHTML = "";
        window.Calendly?.initInlineWidget({ url, parentElement: host.current });
        timer = setTimeout(() => {
          if (!cancelled) setState((s) => (s === "ready" ? s : "failed"));
        }, PAINT_TIMEOUT_MS);
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });

    return () => {
      cancelled = true;
      window.removeEventListener("message", onMessage);
      if (timer) clearTimeout(timer);
    };
  }, [url]);

  if (state === "failed") return null;

  return (
    <div className="relative mt-6 overflow-hidden rounded-tile bg-card-warm">
      {state === "loading" && (
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-ink-soft">
          Loading Rudhra&apos;s calendar…
        </p>
      )}
      <div
        ref={host}
        className="h-170 w-full sm:h-180"
        aria-label="Booking calendar"
      />
    </div>
  );
}
