// Simple CRM fallback using local database
// This ensures cold emails work even without external CRM

interface SimpleCRMContact {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  city?: string;
  industry?: string;
  source: string;
  status: 'new' | 'contacted' | 'responded' | 'qualified' | 'closed';
  lastContact?: Date;
  notes?: string;
  campaignName?: string;
  createdAt: Date;
  updatedAt: Date;
}

class SimpleCRM {
  /**
   * Add contact to local CRM (using our Prisma database)
   */
  async addContact(contactData: SimpleCRMContact): Promise<any> {
    console.log('📝 Adding contact to Simple CRM:', contactData.email);

    try {
      // Use our existing database structure
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Create contact in our existing structure
      const contact = await prisma.$executeRaw`
        INSERT INTO cold_email_contacts (
          first_name, last_name, email, company_name, position, city, industry,
          sequence_type, priority, status, created_at, updated_at
        ) VALUES (
          ${contactData.firstName}, ${contactData.lastName}, ${contactData.email},
          ${contactData.company}, ${contactData.position || ''}, ${contactData.city || ''},
          ${contactData.industry || ''}, 'csr_manager', 'high', 'contacted',
          NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          last_email_sent_at = NOW(),
          updated_at = NOW()
      `;

      console.log('✅ Contact added to Simple CRM');
      await prisma.$disconnect();

      return { success: true, id: Date.now() };

    } catch (error) {
      console.error('❌ Simple CRM error:', error);
      return { success: false, error };
    }
  }

  /**
   * Track email interaction in simple CRM
   */
  async trackEmailInteraction(
    email: string,
    type: 'sent' | 'opened' | 'clicked' | 'replied',
    campaignName?: string
  ): Promise<void> {
    console.log(`📧 Tracking ${type} for ${email} in Simple CRM`);

    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      await prisma.$executeRaw`
        UPDATE cold_email_contacts
        SET
          last_email_sent_at = NOW(),
          status = CASE
            WHEN ${type} = 'replied' THEN 'responded'
            WHEN ${type} = 'clicked' THEN 'qualified'
            ELSE 'contacted'
          END,
          updated_at = NOW()
        WHERE email = ${email}
      `;

      console.log(`✅ Tracked ${type} interaction`);
      await prisma.$disconnect();

    } catch (error) {
      console.error(`❌ Failed to track ${type}:`, error);
    }
  }

  /**
   * Get all contacts for dashboard
   */
  async getContacts(): Promise<any[]> {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const contacts = await prisma.$queryRaw<any[]>`
        SELECT * FROM cold_email_contacts
        ORDER BY created_at DESC
        LIMIT 100
      `;

      await prisma.$disconnect();
      return contacts;

    } catch (error) {
      console.error('❌ Failed to get contacts:', error);
      return [];
    }
  }
}

// Export singleton
export const simpleCRM = new SimpleCRM();

// Helper functions matching HubSpot interface
export async function syncToSimpleCRM(contactData: {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  city?: string;
  industry?: string;
  campaignName?: string;
}): Promise<void> {
  try {
    await simpleCRM.addContact({
      ...contactData,
      source: 'cold_email',
      status: 'contacted',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Failed to sync to Simple CRM:', error);
  }
}

export async function trackSimpleEmailInteraction(
  email: string,
  type: 'sent' | 'opened' | 'clicked' | 'replied',
  campaignName?: string
): Promise<void> {
  try {
    await simpleCRM.trackEmailInteraction(email, type, campaignName);
  } catch (error) {
    console.error('❌ Failed to track in Simple CRM:', error);
  }
}