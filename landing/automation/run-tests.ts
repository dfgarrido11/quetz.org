// Script para ejecutar tests sin dependencias de APIs externas
import QuetzTestingSuite from './testing-suite';

// Mockear las variables de entorno para testing
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_test_key_for_development';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';

async function runTests() {
  console.log('🧪 EJECUTANDO TESTS DE QUETZ AUTOMATION SYSTEM');
  console.log('=' .repeat(50));
  console.log('🚫 MODO DE TESTING - No se enviarán emails reales');
  console.log('=' .repeat(50));

  const testSuite = new QuetzTestingSuite();

  try {
    const allTestsPassed = await testSuite.runCompleteTestSuite();

    if (allTestsPassed) {
      console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
      console.log('✅ El sistema está listo para usar con clientes reales');
      console.log('🚀 Puedes configurar las APIs y empezar a generar leads');
      process.exit(0);
    } else {
      console.log('\n❌ ALGUNOS TESTS FALLARON');
      console.log('🔧 Revisa los errores arriba antes de usar en producción');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO EN TESTS:', error);
    console.log('🆘 Contacta al desarrollador (Claude) para soporte');
    process.exit(1);
  }
}

// Ejecutar tests
runTests();