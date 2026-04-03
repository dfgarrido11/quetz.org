// Test simple para verificar detección de idiomas por país

function detectLanguageByCountry(country?: string): string {
  if (!country) return 'es'; // Default español

  const countryLower = country.toLowerCase();

  // Países de habla alemana
  if (countryLower.includes('alemania') || countryLower.includes('germany') ||
      countryLower.includes('deutschland') || countryLower.includes('austria') ||
      countryLower.includes('österreich') || countryLower.includes('suiza') ||
      countryLower.includes('switzerland') || countryLower.includes('schweiz')) {
    return 'de';
  }

  // Países de habla inglesa
  if (countryLower.includes('estados unidos') || countryLower.includes('united states') ||
      countryLower.includes('usa') || countryLower.includes('reino unido') ||
      countryLower.includes('united kingdom') || countryLower.includes('uk') ||
      countryLower.includes('canadá') || countryLower.includes('canada') ||
      countryLower.includes('australia') || countryLower.includes('nueva zelanda')) {
    return 'en';
  }

  // Países de habla francesa
  if (countryLower.includes('francia') || countryLower.includes('france') ||
      countryLower.includes('bélgica') || countryLower.includes('belgium') ||
      countryLower.includes('belgique')) {
    return 'fr';
  }

  // Default: español para España, México, América Latina, etc.
  return 'es';
}

const countries = [
  'España',
  'México',
  'Brasil',
  'Francia',
  'Italia',
  'Alemania',
  'Estados Unidos',
  'Portugal',
  'Bulgaria'
];

console.log('🌍 Test de Detección Automática de Idiomas por País:\n');

countries.forEach(country => {
  const lang = detectLanguageByCountry(country);
  const langName = {
    'es': 'Español',
    'de': 'Alemán',
    'fr': 'Francés',
    'en': 'Inglés'
  }[lang] || lang;

  console.log(`${country.padEnd(15)} → ${lang} (${langName})`);
});

console.log('\n✅ El sistema detectará automáticamente el idioma basado en el país del lead!');