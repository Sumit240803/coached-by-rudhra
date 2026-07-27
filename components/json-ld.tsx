/**
 * Emits a JSON-LD `@graph` payload. Server-rendered so crawlers that don't
 * execute JavaScript still receive the structured data.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is inserted verbatim; `<` is escaped so a stray
      // "</script>" inside any copy string can never break out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
