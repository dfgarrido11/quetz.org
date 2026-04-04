// Test HubSpot with Client Secret

const TOKEN = process.env.HUBSPOT_API_KEY || "your_hubspot_token_here";
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || "your_client_secret_here";
const APP_ID = "35805545"; // From URL

async function testWithClientSecret() {
  console.log('🔐 Testing HubSpot with Client Secret...');

  try {
    // Method 1: Authorization header with token
    console.log('📞 Method 1: Token in Authorization header...');

    const response1 = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Response 1: ${response1.status}`);

    if (response1.ok) {
      console.log('✅ SUCCESS with Authorization header!');
      const data = await response1.json();
      console.log('📊 Data:', data);

      // Test creating contact
      await testCreateContact();
      return;
    }

    // Method 2: Query parameter
    console.log('📞 Method 2: Token as query parameter...');

    const response2 = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts?limit=1&hapikey=${TOKEN}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`Response 2: ${response2.status}`);

    if (response2.ok) {
      console.log('✅ SUCCESS with query parameter!');
      const data = await response2.json();
      console.log('📊 Data:', data);
      return;
    }

    // Method 3: With client credentials
    console.log('📞 Method 3: OAuth with client credentials...');

    const authResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': APP_ID,
        'client_secret': CLIENT_SECRET,
        'scope': 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.companies.read crm.objects.companies.write'
      })
    });

    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ SUCCESS with OAuth flow!');
      console.log('🔑 Access token received:', authData.access_token);

      // Use the OAuth token for contacts
      const contactsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        console.log('📊 Contacts data:', contactsData);
      }

      return;
    }

    // Method 4: Account info for debugging
    console.log('📞 Method 4: Account info endpoint...');

    const accountResponse = await fetch('https://api.hubapi.com/integrations/v1/me', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (accountResponse.ok) {
      console.log('✅ Account info works - token is valid!');
      const accountData = await accountResponse.json();
      console.log('📊 Account:', accountData);
    } else {
      const errorText = await accountResponse.text();
      console.log('❌ Account info failed:', errorText);
    }

    // All methods failed
    console.log('❌ All methods failed. The token might need activation time.');
    console.log('⏰ Try waiting 5-10 minutes and test again.');
    console.log('🔧 Or check if app needs manual activation in HubSpot.');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

async function testCreateContact() {
  console.log('\n🧪 Testing contact creation...');

  try {
    const timestamp = Date.now();
    const testContact = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email: `test-${timestamp}@quetz.org`,
          firstname: 'Quetz',
          lastname: 'TestContact',
          company: 'Quetz CRM Test',
          lifecyclestage: 'lead',
          lead_source: 'api_test',
          leadsource: 'API Test'
        }
      })
    });

    if (testContact.ok) {
      const contactData = await testContact.json();
      console.log('🎉 CONTACT CREATED SUCCESSFULLY!');
      console.log(`   Contact ID: ${contactData.id}`);
      console.log(`   Email: test-${timestamp}@quetz.org`);
      console.log(`   View in HubSpot: https://app.hubspot.com/contacts/148190087/contact/${contactData.id}`);

      console.log('\n🚀 HubSpot CRM integration is WORKING!');
      console.log('✅ Ready for Monday cold email automation');
      console.log('✅ All contacts will sync automatically');

    } else {
      const error = await testContact.text();
      console.log('❌ Contact creation failed:', error);
    }

  } catch (error) {
    console.error('❌ Contact creation error:', error);
  }
}

testWithClientSecret();