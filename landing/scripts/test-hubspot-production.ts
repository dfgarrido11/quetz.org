// Test HubSpot connection via production API (Railway endpoint)
// This tests the actual production environment where the API key is stored

async function testHubSpotProduction() {
  console.log('🧪 Testing HubSpot via production endpoint...');

  try {
    // Test via Railway production endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'https://quetz.org';

    console.log(`🔗 Testing connection via: ${baseUrl}`);

    // Create a simple test API endpoint first
    const testResponse = await fetch(`${baseUrl}/api/test-hubspot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true,
        email: 'test@quetz.org',
        firstName: 'Test',
        lastName: 'User',
        company: 'Quetz Test'
      })
    });

    if (!testResponse.ok) {
      throw new Error(`HTTP ${testResponse.status}: ${await testResponse.text()}`);
    }

    const result = await testResponse.json();

    console.log('✅ HubSpot production test successful!');
    console.log('📊 Result:', result);

    console.log('\n🎉 Your HubSpot CRM is ready!');
    console.log('📋 Next steps:');
    console.log('   1. Cold emails will sync automatically on Monday/Tuesday');
    console.log('   2. Check your HubSpot dashboard: https://app.hubspot.com');
    console.log('   3. All leads will appear automatically');

  } catch (error) {
    console.error('❌ Production test failed:', error);

    console.log('\n⚠️ Alternative: Test with your local API key');
    console.log('   1. Edit .env file');
    console.log('   2. Replace "PEGA_AQUI_TU_API_KEY" with your real API key');
    console.log('   3. Run: npx tsx scripts/test-hubspot.ts');
  }
}

testHubSpotProduction();