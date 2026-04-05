// Monday April 6, 2026 - 9:00 AM CET Email Batch
// Sends first 10 cold emails to highest priority CSR contacts

import { sendScheduledEmail, loadCorporateContacts } from './cold-email-automation';

async function sendMondayBatch() {
  console.log('📅 MONDAY BATCH - April 6, 2026 at 9:00 AM CET');
  console.log('🎯 Sending cold emails to first 10 high-priority contacts...');

  try {
    const contacts = await loadCorporateContacts();

    // Sort by priority (high first) and take first 10
    const mondayContacts = contacts
      .filter(c => c.priority === 'high')
      .slice(0, 10);

    console.log(`📧 Sending to ${mondayContacts.length} contacts on Monday batch`);

    let successCount = 0;
    let errorCount = 0;

    for (const contact of mondayContacts) {
      console.log(`\n📤 Sending to: ${contact.first_name} at ${contact.company_name} (${contact.email})`);

      const result = await sendScheduledEmail(contact.email, 1);

      if (result.success) {
        console.log(`✅ Success: ${contact.email}`);
        successCount++;
      } else {
        console.log(`❌ Failed: ${contact.email} - ${result.error}`);
        errorCount++;
      }

      // Wait 2 seconds between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n📊 MONDAY BATCH RESULTS:');
    console.log(`   ✅ Successful sends: ${successCount}`);
    console.log(`   ❌ Failed sends: ${errorCount}`);
    console.log(`   📧 Total attempted: ${mondayContacts.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Monday batch completed successfully!');
      console.log('📅 Next batch: Tuesday April 7, 2026 at 9:00 AM CET');
    }

  } catch (error) {
    console.error('❌ Error in Monday batch:', error);
    process.exit(1);
  }
}

// Execute Monday batch
sendMondayBatch();