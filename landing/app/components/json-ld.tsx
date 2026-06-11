/**
 * Reusable JSON-LD structured data component.
 * Renders schema.org markup as an application/ld+json script tag.
 * Server-component compatible: use in layouts or server pages.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
