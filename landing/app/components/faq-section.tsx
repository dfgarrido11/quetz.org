'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { FAQ_KEYS } from '@/lib/faq';

/**
 * Native <details>/<summary> accordion.
 *
 * The previous version only mounted the answer while `openIndex === index`,
 * so the answers existed in the DOM *only* after a click on a hydrated page.
 * Server-rendered HTML contained the questions and nothing else — which is
 * what both crawlers and any visitor with broken/slow hydration saw.
 *
 * <details> needs no JavaScript at all: answers are always in the HTML,
 * expand on click, and are keyboard accessible for free. `name` makes modern
 * browsers close the other panels (progressive enhancement — older browsers
 * simply allow several open at once).
 */
export default function FaqSection() {
  const { t, isRTL } = useLanguage();

  const faqs = FAQ_KEYS.map((key) => ({
    q: t(`faq.q${key}`),
    a: t(`faq.a${key}`),
  }));

  return (
    <section id="faq" className={`py-20 sm:py-24 bg-quetz-cream ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-quetz-green/10 mb-4">
            <HelpCircle className="w-8 h-8 text-quetz-green" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('faq.title')}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              name="quetz-faq"
              className="group bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors ${
                  isRTL ? 'flex-row-reverse text-right' : ''
                }`}
              >
                <span className="font-semibold text-gray-900">{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className={`px-5 pb-5 text-gray-600 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
