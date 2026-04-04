// Tuesday April 7, 2026 - 9:00 AM CET Email Batch
// Sends remaining cold emails to medium/high priority CSR contacts

import { sendScheduledEmail, loadCorporateContacts } from './cold-email-automation';

async function sendTuesdayBatch() {
  console.log('📅 TUESDAY BATCH - April 7, 2026 at 9:00 AM CET');
  console.log('🎯 Sending cold emails to remaining contacts...');

  try {
    const contacts = await loadCorporateContacts();

    // Sort by priority and take from contact 11 onwards
    const tuesdayContacts = contacts
      .filter(c => c.priority === 'high' || c.priority === 'medium')
      .slice(10); // Start from 11th contact

    console.log(`📧 Sending to ${tuesdayContacts.length} contacts on Tuesday batch`);

    let successCount = 0;
    let errorCount = 0;

    for (const contact of tuesdayContacts) {
      console.log(`\n📤 Sending to: ${contact.first_name} at ${contact.company_name} (${contact.email})`);

      const result = await sendScheduledEmail(contact.email, 1);

      if (result.success) {
        console.log(`✅ Success: ${contact.email}`);
        successCount++;
      } else {
        console.log(`❌ Failed: ${contact.email} - ${result.error}`);
        errorCount++;
      }

      // Wait 3 seconds between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n📊 TUESDAY BATCH RESULTS:');
    console.log(`   ✅ Successful sends: ${successCount}`);
    console.log(`   ❌ Failed sends: ${errorCount}`);
    console.log(`   📧 Total attempted: ${tuesdayContacts.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Tuesday batch completed successfully!');
      console.log('📋 Check responses in HubSpot CRM');
      console.log('📊 Monitor open rates in Resend dashboard');
      console.log('📞 Follow up on any replies manually');
    }

  } catch (error) {
    console.error('❌ Error in Tuesday batch:', error);
    process.exit(1);
  }
}

// Execute Tuesday batch
sendTuesdayBatch();