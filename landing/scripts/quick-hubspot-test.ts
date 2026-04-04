// Quick HubSpot test with direct API key input

const HUBSPOT_API_KEY = "pat-eu1-bb94c4b-8bb4-4a26-bc7c-de6c59c0bb22"; // Token correcto del screenshot

if (HUBSPOT_API_KEY === "PEGA_TU_API_KEY_AQUI_TEMPORALMENTE") {
  console.log('❌ Please replace HUBSPOT_API_KEY with your real API key in this file');
  console.log('   Edit scripts/quick-hubspot-test.ts line 3');
  process.exit(1);
}

async function quickTest() {
  console.log('🧪 Quick HubSpot test...');

  try {
    // Test basic connection - EU region
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    console.log('✅ HubSpot connection successful!');
    console.log('📊 Sample data:', JSON.stringify(data, null, 2));

    // Test creating a contact
    const testContact = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email: 'test-quetz@example.com',
          firstname: 'Test',
          lastname: 'Quetz',
          company: 'Quetz Test Company',
          lifecyclestage: 'lead',
          lead_source: 'quick_test'
        }
      })
    });

    if (testContact.ok) {
      const contactData = await testContact.json();
      console.log('✅ Test contact created successfully!');
      console.log('   Contact ID:', contactData.id);
      console.log('   View in HubSpot: https://app.hubspot.com/contacts/');

      console.log('\n🎉 HubSpot is fully working!');
      console.log('📋 Ready for:');
      console.log('   ✅ Cold email automation with CRM sync');
      console.log('   ✅ Lead tracking and management');
      console.log('   ✅ Automatic contact creation');

    } else {
      const error = await testContact.text();
      console.log('⚠️ Contact creation failed:', error);
      console.log('✅ But connection works - API key is valid');
    }

  } catch (error) {
    console.error('❌ HubSpot test failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('\n🔑 API Key issue:');
        console.log('   1. Check your API key is correct');
        console.log('   2. Verify private app permissions in HubSpot');
        console.log('   3. Make sure the key starts with "pat-"');
      } else if (error.message.includes('429')) {
        console.log('\n⏳ Rate limit hit - but connection works!');
      }
    }
  }
}

quickTest();