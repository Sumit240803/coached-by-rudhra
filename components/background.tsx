"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { media } from "@/lib/content";

/**
 * Full-bleed training montage behind every stage.
 *
 * The gradient sits underneath unconditionally so the page still reads correctly
 * before the video loads, if a file is missing, or if the browser blocks
 * autoplay. When several clips are supplied we advance to the next one each time
 * one ends, so the loop stays varied rather than repeating an 11-second cut.
 *
 * Loading strategy: the poster is a real (optimised) image that paints
 * immediately, and the <video> is only mounted once the browser goes idle. The
 * clips previously used preload="auto", which put multi-megabyte downloads in
 * competition with the text and hero image for bandwidth on first paint — a
 * direct LCP cost on a page whose largest element is that text. Nothing about
 * the finished visual changes; only when the bytes are fetched.
 */
export function Background() {
  const clips = media.heroVideos;
  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Reduced-motion users never see the video, so never spend their data on it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    const start = () => setShowVideo(true);

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 3000 });
    } else {
      timerId = setTimeout(start, 1500);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-cream">
      <div className="absolute inset-0 bg-linear-to-br from-cream via-cream-deep to-rust-soft/40" />

      <Image
        src={media.heroPoster}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        priority
        className="object-cover opacity-95"
      />

      {showVideo && (
        <video
          key={clips[index]}
          className="absolute inset-0 h-full w-full object-cover opacity-95 motion-reduce:hidden"
          autoPlay
          muted
          playsInline
          preload="none"
          loop={clips.length === 1}
          poster={media.heroPoster}
          onEnded={() => setIndex((i) => (i + 1) % clips.length)}
          aria-hidden="true"
        >
          <source src={clips[index]} type="video/mp4" />
        </video>
      )}

      {/* Light blur keeps the footage clearly visible. A thin flat veil plus a
          cream glow concentrated behind the centred text keeps the dark headline
          and grey subtext legible on both the bright and dark frames of the clip,
          while the video still breathes at the edges. */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-cream/15" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_42%,var(--color-cream),transparent_75%)] opacity-80" />
      <div className="absolute inset-0 bg-linear-to-t from-cream/70 via-transparent to-cream/30" />
    </div>
  );
}
