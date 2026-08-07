/**
 * FAQ entry keys, shared by the rendered accordion and the FAQPage JSON-LD.
 *
 * Lives outside the component on purpose: faq-section.tsx is a client module,
 * and values imported from a client module into a server component arrive as
 * client references, so calling .map() on them throws at render time.
 */
export const FAQ_KEYS = ['1', '2', '3', '4', '5', '6'] as const;

export type FaqKey = (typeof FAQ_KEYS)[number];
