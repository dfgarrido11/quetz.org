export interface Testimonial {
  id: string;
  /** The quote, in the language it was actually given in. */
  quote: string;
  name: string;
  /** e.g. "Baumpatin seit 2025, Köln" */
  role: string;
  /** Optional headshot in /public. Falls back to an initial when absent. */
  photoUrl?: string;
}

/**
 * TODO-DANIEL: pegar aquí 2-3 testimonios REALES de adoptantes.
 *
 * Necesito de cada persona:
 *   - la cita textual (en su idioma)
 *   - nombre y ciudad tal y como quiera aparecer
 *   - consentimiento por escrito para publicarlo (DSGVO Art. 6(1)(a))
 *   - opcionalmente una foto (con consentimiento aparte para la imagen)
 *
 * Ejemplo:
 *   { id: 'anna-k', quote: 'Ich habe meiner Mutter einen Baum geschenkt …',
 *     name: 'Anna K.', role: 'Baumpatin seit 2025, Köln' }
 *
 * IMPORTANTE: la sección entera no se renderiza mientras este array esté
 * vacío. Es intencionado. Publicar testimonios inventados sería publicidad
 * engañosa (§ 5 UWG) y es exactamente el tipo de afirmación no verificable
 * que el jurado KUER ya criticó. Mejor no tener sección que tenerla falsa.
 */
export const TESTIMONIALS: Testimonial[] = [];

export function hasTestimonials(): boolean {
  return TESTIMONIALS.length > 0;
}
