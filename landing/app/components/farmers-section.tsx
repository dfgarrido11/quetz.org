'use client';

import { Users, Coins, Sprout, MapPin, Repeat, Camera, FileSignature } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { formatCurrency, formatNumber } from '@/lib/translations';
import { ALLOCATION_ORDER, allocationPercent, FARMER_ECONOMICS, type AllocationKey } from '@/lib/allocation';
import { Language } from '@/lib/translations';

/**
 * "How the farmers actually benefit" — answers the KUER.NRW jury's direct
 * criticism that the site never says what reaches the people doing the work.
 *
 * Deliberately renders without framer-motion: the numbers here are the whole
 * point of the section, so they must survive a failed hydration.
 */

const ALLOCATION_BAR_COLOURS: Record<AllocationKey, string> = {
  planting: 'bg-quetz-green',
  school: 'bg-amber-500',
  operations: 'bg-slate-400',
  reserve: 'bg-slate-300',
};

const CO2_GUARANTEES = [
  { key: 'land', icon: FileSignature },
  { key: 'species', icon: Sprout },
  { key: 'replant', icon: Repeat },
  { key: 'monitor', icon: Camera },
] as const;

/** Substitutes {placeholders} so each language keeps its own sentence order. */
function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.split(`{${key}}`).join(value),
    template
  );
}

/**
 * "18,90–27,00 €" / "€18.90–€27.00" — one range, formatted per locale rather
 * than gluing two independently formatted amounts together.
 */
function formatMoneyRange(min: number, max: number, language: Language): string {
  if (language === 'en') {
    return `${formatCurrency(min, language)}–${formatCurrency(max, language)}`;
  }
  const minPlain = min.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${minPlain}–${formatCurrency(max, language)}`;
}

export default function FarmersSection() {
  const { t, isRTL, language } = useLanguage();

  const {
    payPerTreePlantedEur,
    schoolFundPerTreePlantedEur,
    carePerTreePerYearEur,
    familiesEmployed,
    singleTreePriceEur,
  } = FARMER_ECONOMICS;

  const money = (value: number): string => formatCurrency(value, language);
  const careRange = formatMoneyRange(carePerTreePerYearEur.min, carePerTreePerYearEur.max, language);

  const stats = [
    {
      id: 'families',
      icon: Users,
      value: formatNumber(familiesEmployed, language),
      label: t('farmers.stat.families'),
      hint: t('farmers.stat.familiesHint'),
    },
    {
      id: 'planting',
      icon: Coins,
      value: money(payPerTreePlantedEur),
      label: t('farmers.stat.perTree'),
      hint: fill(t('farmers.stat.perTreeHint'), {
        price: formatCurrency(singleTreePriceEur, language, false),
        wage: money(payPerTreePlantedEur),
        school: money(schoolFundPerTreePlantedEur),
      }),
    },
    {
      id: 'care',
      icon: Sprout,
      value: careRange,
      label: t('farmers.stat.care'),
      hint: fill(t('farmers.stat.careHint'), {
        range: careRange,
        share: `${allocationPercent('planting')}%`,
      }),
    },
  ];

  return (
    <section id="agricultores" className={`py-20 sm:py-28 bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-quetz-green/10 mb-4">
            <Users className="w-8 h-8 text-quetz-green" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            {t('farmers.title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('farmers.subtitle')}
          </p>
        </div>

        {/* What reaches the families */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-3 mb-12">
          {stats.map(({ id, icon: Icon, value, label, hint }) => (
            <div key={id} className="bg-quetz-cream rounded-xl p-6 text-center">
              <Icon className="w-6 h-6 text-quetz-green mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</div>
              <div className="mt-1 font-medium text-gray-800">{label}</div>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{hint}</p>
            </div>
          ))}
        </div>

        {/* Where each euro goes */}
        <div className="bg-quetz-cream rounded-2xl p-6 sm:p-8 mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
            {t('farmers.allocation.title')}
          </h3>
          <p className="mt-3 text-center">
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
              {t('farmers.allocation.asOf')}
            </span>
          </p>
          <p className="mt-3 text-sm sm:text-base text-gray-600 text-center max-w-2xl mx-auto">
            {t('farmers.allocation.subtitle')}
          </p>

          <div className={`mt-6 flex h-5 w-full overflow-hidden rounded-full bg-white ${isRTL ? 'flex-row-reverse' : ''}`}>
            {ALLOCATION_ORDER.map((key) => (
              <div
                key={key}
                className={ALLOCATION_BAR_COLOURS[key]}
                style={{ width: `${allocationPercent(key)}%` }}
                title={`${allocationPercent(key)}% — ${t(`farmers.alloc.${key}.label`)}`}
              />
            ))}
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {ALLOCATION_ORDER.map((key) => (
              <div key={key} className={`flex gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <span className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${ALLOCATION_BAR_COLOURS[key]}`} />
                <div>
                  <dt className="font-semibold text-gray-900">
                    {allocationPercent(key)}% · {t(`farmers.alloc.${key}.label`)}
                  </dt>
                  <dd className="text-sm text-gray-600 leading-relaxed">
                    {t(`farmers.alloc.${key}.desc`)}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-xs sm:text-sm text-gray-500 text-center">
            {t('farmers.allocation.note')}
          </p>
        </div>

        {/* How the carbon stays in the ground */}
        <div className="rounded-2xl border border-gray-200 p-6 sm:p-8">
          <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MapPin className="w-6 h-6 text-quetz-green flex-shrink-0" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{t('farmers.co2.title')}</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{t('farmers.co2.intro')}</p>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {CO2_GUARANTEES.map(({ key, icon: Icon }) => (
              <li key={key} className={`flex gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <Icon className="w-5 h-5 text-quetz-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{t(`farmers.co2.${key}.title`)}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{t(`farmers.co2.${key}.desc`)}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-900 leading-relaxed">
            {t('farmers.co2.disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
