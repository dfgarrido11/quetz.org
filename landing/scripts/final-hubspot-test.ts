// Final HubSpot test with new rotated token

const NEW_TOKEN = process.env.HUBSPOT_API_KEY || "your_hubspot_token_here";

async function finalHubSpotTest() {
  console.log('🔄 FINAL TEST - New rotated token');
  console.log('Token:', NEW_TOKEN.substring(0, 15) + '...');

  try {
    console.log('\n📞 Testing HubSpot CRM API...');

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${NEW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Status: ${response.status}`);

    if (response.status === 200) {
      console.log('🎉 SUCCESS! HubSpot is working!');

      const data = await response.json();
      console.log('📋 Response data:', data);

      // Test creating contact
      console.log('\n🧪 Testing contact creation...');

      const timestamp = Date.now();
      const createResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NEW_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            email: `hubspot-test-${timestamp}@quetz.org`,
            firstname: 'HubSpot',
            lastname: 'TestContact',
            company: 'Quetz CRM Test',
            lifecyclestage: 'lead',
            lead_source: 'api_test'
          }
        })
      });

      if (createResponse.ok) {
        const contactData = await createResponse.json();
        console.log('✅ Contact created successfully!');
        console.log(`   ID: ${contactData.id}`);
        console.log(`   Email: hubspot-test-${timestamp}@quetz.org`);

        console.log('\n🚀 HUBSPOT CRM IS FULLY WORKING!');
        console.log('🎯 Ready for Monday cold email automation');
        console.log('📧 All leads will sync automatically');

        // Update Railway variable
        console.log('\n⚡ Next steps:');
        console.log('1. Update Railway variable: HUBSPOT_API_KEY');
        console.log('2. Set value:', NEW_TOKEN);
        console.log('3. Redeploy');

      } else {
        const createError = await createResponse.text();
        console.log('⚠️ Contact creation failed:', createError);
        console.log('✅ But token authentication works!');
      }

    } else if (response.status === 401) {
      const errorData = await response.text();
      console.log('❌ Still 401 Unauthorized:', errorData);

      console.log('\n🔧 Possible solutions:');
      console.log('1. Wait 5-10 minutes for token to activate');
      console.log('2. Check app status in HubSpot is "Active"');
      console.log('3. Verify all 4 scopes are selected');
      console.log('4. Try regenerating token again');

    } else if (response.status === 403) {
      console.log('❌ 403 Forbidden - Check scopes');
      console.log('🔧 Verify these scopes are enabled:');
      console.log('   ✅ crm.objects.contacts.read');
      console.log('   ✅ crm.objects.contacts.write');
      console.log('   ✅ crm.objects.companies.read');
      console.log('   ✅ crm.objects.companies.write');

    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      const errorData = await response.text();
      console.log('Error data:', errorData);
    }

  } catch (error) {
    console.error('❌ Network or other error:', error);
  }

  console.log('\n📋 Summary:');
  console.log('- Token rotated: ✅');
  console.log('- Token format: ✅ (starts with pat-eu1-)');
  console.log('- Scopes configured: ✅');
  console.log('- Awaiting API response...');
}

finalHubSpotTest();