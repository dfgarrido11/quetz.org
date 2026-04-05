// Test HubSpot EU region with Portal ID

const HUBSPOT_TOKEN = "pat-eu1-bb94c4b-8bb4-4a26-bc7c-de6c59c0bb22";
const PORTAL_ID = "148190087"; // From URL in screenshot

async function testEUHubspot() {
  console.log('🌍 Testing HubSpot EU region with Portal ID...');

  try {
    // Test Method 1: Standard API
    console.log('📞 Method 1: Standard CRM API...');

    const response1 = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response1.ok) {
      console.log('✅ Method 1 SUCCESS - Standard API works!');
      const data = await response1.json();
      console.log('📊 Sample response:', data);

      // Test creating contact
      await testCreateContact();
      return;
    }

    console.log(`❌ Method 1 failed: ${response1.status}`);

    // Test Method 2: With Portal ID in path
    console.log('📞 Method 2: With Portal ID...');

    const response2 = await fetch(`https://api.hubapi.com/contacts/v1/lists/all/contacts/all?hapikey=${HUBSPOT_TOKEN}&count=1`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response2.ok) {
      console.log('✅ Method 2 SUCCESS - Portal ID method works!');
      const data = await response2.json();
      console.log('📊 Sample response:', data);
      return;
    }

    console.log(`❌ Method 2 failed: ${response2.status}`);

    // Test Method 3: Account info to verify token
    console.log('📞 Method 3: Account info...');

    const response3 = await fetch('https://api.hubapi.com/integrations/v1/me', {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response3.ok) {
      console.log('✅ Method 3 SUCCESS - Token is valid!');
      const data = await response3.json();
      console.log('📊 Account info:', data);

      console.log('\n🎯 Token is valid but contacts API might have different permissions');
      console.log('   Try adding more scopes in HubSpot app settings');
      return;
    }

    const errorData = await response3.text();
    console.log(`❌ All methods failed. Error:`, errorData);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testCreateContact() {
  console.log('🧪 Testing contact creation...');

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email: `test-${Date.now()}@quetz.org`,
          firstname: 'Quetz',
          lastname: 'Test',
          company: 'Test Company',
          lifecyclestage: 'lead',
          lead_source: 'api_test'
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🎉 SUCCESS! Contact created:', data.id);
      console.log(`   View in HubSpot: https://app.hubspot.com/contacts/${PORTAL_ID}/contact/${data.id}`);

      console.log('\n✅ HubSpot CRM is fully working!');
      console.log('🚀 Ready for cold email automation on Monday!');

    } else {
      const error = await response.text();
      console.log('❌ Contact creation failed:', error);
    }

  } catch (error) {
    console.error('❌ Contact creation error:', error);
  }
}

testEUHubspot();