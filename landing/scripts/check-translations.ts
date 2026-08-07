/**
 * Guards the 5-language translation table against drift.
 *
 * Fails if any language is missing a key that German has, or holds a blank
 * string. Run with: npm run check:i18n
 */
import { translations, languages, type Language } from '../lib/translations';

const REFERENCE: Language = 'de';

function main(): void {
  const referenceKeys = Object.keys(translations[REFERENCE]);
  let failures = 0;

  for (const { code } of languages) {
    const table = translations[code];
    const missing = referenceKeys.filter((key) => !(key in table));
    const blank = Object.keys(table).filter((key) => !String(table[key] ?? '').trim());

    const status = missing.length === 0 && blank.length === 0 ? 'ok' : 'FAIL';
    console.log(`${code}: ${Object.keys(table).length} keys — ${status}`);

    if (missing.length > 0) {
      failures += missing.length;
      console.log(`  missing vs ${REFERENCE} (${missing.length}): ${missing.join(', ')}`);
    }
    if (blank.length > 0) {
      failures += blank.length;
      console.log(`  blank (${blank.length}): ${blank.join(', ')}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} translation problem(s) found.`);
    process.exitCode = 1;
    return;
  }
  console.log('\nAll languages complete.');
}

main();
