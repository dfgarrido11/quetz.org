import { hubspotCRM } from '../lib/hubspot';

async function testHubSpot() {
  console.log('🧪 Testing HubSpot connection...');

  try {
    // Test connection
    const isConnected = await hubspotCRM.testConnection();

    if (!isConnected) {
      console.error('❌ HubSpot connection failed');
      process.exit(1);
    }

    console.log('✅ HubSpot connection successful!');

    // Test creating a contact
    console.log('🧪 Testing contact creation...');

    const testContact = await hubspotCRM.upsertContact({
      email: 'test@quetz.org',
      firstname: 'Test',
      lastname: 'User',
      company: 'Quetz Test Company',
      lead_source: 'api_test',
      quetz_contact_reason: 'testing'
    });

    console.log('✅ Test contact created:', testContact.id);

    console.log('\n🎉 HubSpot integration is working correctly!');
    console.log('📋 You can now:');
    console.log('   1. Send cold emails with automatic CRM sync');
    console.log('   2. Track email interactions');
    console.log('   3. View leads in your HubSpot dashboard');

    // HubSpot dashboard link
    console.log(`\n🔗 Your HubSpot dashboard: https://app.hubspot.com/contacts/`);

  } catch (error) {
    console.error('❌ HubSpot test failed:', error);

    if (error instanceof Error && error.message.includes('401')) {
      console.log('\n🔑 API Key issue. Check that:');
      console.log('   1. Your API key is correct in .env file');
      console.log('   2. The private app has the right permissions');
      console.log('   3. You saved the .env file properly');
    }

    process.exit(1);
  }
}

testHubSpot();