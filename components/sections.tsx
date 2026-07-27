/**
 * Content blocks shared between the interactive deck and the standalone,
 * server-rendered content pages. Copy lives in exactly one place so the deck and
 * the indexable pages can never disagree.
 */

export function CoachBio() {
  return (
    <div className="space-y-4 text-ink-soft">
      <p>
        <strong className="text-ink">COACHEDBYRUDHRA</strong> was built for
        people exactly like you: driven professionals — men and women — who take
        their work seriously and want to take their health just as seriously,
        without turning their life upside down to do it.
      </p>
      <p>
        Every program is <strong className="text-rust">1:1</strong>. Every plan
        is built around your actual schedule, your energy levels, your travel
        days, and your goals — not a generic template pulled off the internet.
      </p>
      <p>
        This isn&apos;t about becoming a gym person. It&apos;s about becoming a
        stronger, sharper, more energized version of yourself — on a plan you can
        actually sustain.
      </p>
    </div>
  );
}
