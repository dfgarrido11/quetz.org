'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { TESTIMONIALS } from '@/lib/testimonials';

/**
 * Renders nothing until real, consented testimonials exist in lib/testimonials.ts.
 * See the note there: shipping placeholder quotes would be misleading
 * advertising (§ 5 UWG), so the structure ships empty rather than fake.
 */
export default function TestimonialsSection() {
  const { t, isRTL } = useLanguage();

  if (TESTIMONIALS.length === 0) return null;

  return (
    <section id="testimonios" className={`py-20 sm:py-24 bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-quetz-green/10 mb-4">
            <Quote className="w-8 h-8 text-quetz-green" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('testimonials.title')}</h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600">{t('testimonials.subtitle')}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col rounded-xl bg-quetz-cream p-6 shadow-sm"
            >
              <Quote className="w-6 h-6 text-quetz-green/50 mb-3" aria-hidden="true" />
              <blockquote className={`flex-1 text-gray-700 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                {item.quote}
              </blockquote>
              <figcaption className={`mt-5 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-quetz-green/15 font-semibold text-quetz-green">
                    {item.name.charAt(0)}
                  </span>
                )}
                <span className={isRTL ? 'text-right' : ''}>
                  <span className="block font-semibold text-gray-900">{item.name}</span>
                  <span className="block text-sm text-gray-600">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
