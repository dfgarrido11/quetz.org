import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HubSpotContact {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  country?: string;
  leadSource?: string;
  leadScore?: number;
  sustainabilityInterest?: string;
}

interface HubSpotDeal {
  dealName: string;
  amount: number;
  dealStage: string;
  contactId: string;
  companyId?: string;
  closeDate?: string;
  dealType?: string;
}

class CRMIntegration {
  private hubspotApiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor() {
    this.hubspotApiKey = process.env.HUBSPOT_API_KEY || '';

    if (!this.hubspotApiKey) {
      console.warn('⚠️ HUBSPOT_API_KEY not configured. CRM sync disabled.');
    }
  }

  async syncLeadToCRM(automatedLeadId: string): Promise<boolean> {
    if (!this.hubspotApiKey) return false;

    try {
      // Get lead from database
      const lead = await prisma.automatedLead.findUnique({
        where: { id: automatedLeadId },
        include: { outreachLeads: true }
      });

      if (!lead) {
        console.error(`Lead ${automatedLeadId} not found`);
        return false;
      }

      // Create or update contact in HubSpot
      const contactData: HubSpotContact = {
        email: lead.emailsFound[0] || `contact@${lead.domain}`,
        company: lead.company,
        country: lead.country || '',
        leadSource: lead.source,
        leadScore: lead.score,
        sustainabilityInterest: lead.sustainabilityMention || 'Yes'
      };

      const hubspotContactId = await this.createOrUpdateContact(contactData);

      if (hubspotContactId) {
        // Create company if doesn't exist
        const hubspotCompanyId = await this.createOrUpdateCompany({
          name: lead.company,
          domain: lead.domain || '',
          industry: lead.industry || '',
          employees: lead.employees || '',
          country: lead.country || ''
        });

        // Create deal if lead is qualified
        if (lead.score >= 70) {
          await this.createDeal({
            dealName: `${lead.company} - Reforestación Corporativa`,
            amount: 1250, // Average deal size
            dealStage: 'appointmentscheduled',
            contactId: hubspotContactId,
            companyId: hubspotCompanyId,
            dealType: 'Corporate Sustainability'
          });
        }

        // Update our database with HubSpot IDs
        await prisma.automatedLead.update({
          where: { id: automatedLeadId },
          data: {
            // Store HubSpot IDs in enrichment data
            enrichmentData: {
              create: {
                source: 'HubSpot',
                data: {
                  contactId: hubspotContactId,
                  companyId: hubspotCompanyId,
                  syncedAt: new Date().toISOString()
                }
              }
            }
          }
        });

        console.log(`✅ Synced lead ${lead.company} to HubSpot CRM`);
        return true;
      }

    } catch (error) {
      console.error(`❌ Error syncing lead to CRM:`, error);
    }

    return false;
  }

  private async createOrUpdateContact(contact: HubSpotContact): Promise<string | null> {
    try {
      // Check if contact exists
      const searchResponse = await axios.post(
        `${this.baseUrl}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: contact.email
            }]
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (searchResponse.data.results.length > 0) {
        // Update existing contact
        const contactId = searchResponse.data.results[0].id;

        await axios.patch(
          `${this.baseUrl}/crm/v3/objects/contacts/${contactId}`,
          {
            properties: this.mapContactToHubSpot(contact)
          },
          {
            headers: {
              'Authorization': `Bearer ${this.hubspotApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`📝 Updated existing HubSpot contact: ${contact.email}`);
        return contactId;

      } else {
        // Create new contact
        const createResponse = await axios.post(
          `${this.baseUrl}/crm/v3/objects/contacts`,
          {
            properties: this.mapContactToHubSpot(contact)
          },
          {
            headers: {
              'Authorization': `Bearer ${this.hubspotApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`➕ Created new HubSpot contact: ${contact.email}`);
        return createResponse.data.id;
      }

    } catch (error) {
      console.error('Error with HubSpot contact:', error);
      return null;
    }
  }

  private async createOrUpdateCompany(company: {
    name: string;
    domain: string;
    industry: string;
    employees: string;
    country: string;
  }): Promise<string | null> {
    try {
      // Check if company exists
      const searchResponse = await axios.post(
        `${this.baseUrl}/crm/v3/objects/companies/search`,
        {
          filterGroups: [{
            filters: [{
              propertyName: 'name',
              operator: 'EQ',
              value: company.name
            }]
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (searchResponse.data.results.length > 0) {
        return searchResponse.data.results[0].id;
      } else {
        // Create new company
        const createResponse = await axios.post(
          `${this.baseUrl}/crm/v3/objects/companies`,
          {
            properties: {
              name: company.name,
              domain: company.domain,
              industry: company.industry,
              numberofemployees: company.employees,
              country: company.country
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.hubspotApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`🏢 Created new HubSpot company: ${company.name}`);
        return createResponse.data.id;
      }

    } catch (error) {
      console.error('Error with HubSpot company:', error);
      return null;
    }
  }

  private async createDeal(deal: HubSpotDeal): Promise<string | null> {
    try {
      const createResponse = await axios.post(
        `${this.baseUrl}/crm/v3/objects/deals`,
        {
          properties: {
            dealname: deal.dealName,
            amount: deal.amount,
            dealstage: deal.dealStage,
            dealtype: deal.dealType,
            closedate: deal.closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          associations: [
            {
              to: { id: deal.contactId },
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
            },
            ...(deal.companyId ? [{
              to: { id: deal.companyId },
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }]
            }] : [])
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`💰 Created new HubSpot deal: ${deal.dealName}`);
      return createResponse.data.id;

    } catch (error) {
      console.error('Error creating HubSpot deal:', error);
      return null;
    }
  }

  private mapContactToHubSpot(contact: HubSpotContact): Record<string, any> {
    return {
      email: contact.email,
      firstname: contact.firstName || '',
      lastname: contact.lastName || '',
      company: contact.company || '',
      jobtitle: contact.jobTitle || '',
      phone: contact.phone || '',
      country: contact.country || '',
      hs_lead_status: contact.leadScore && contact.leadScore >= 70 ? 'NEW' : 'OPEN',
      lifecyclestage: 'lead',
      // Custom properties for Quetz
      quetz_lead_score: contact.leadScore?.toString() || '0',
      quetz_lead_source: contact.leadSource || '',
      quetz_sustainability_interest: contact.sustainabilityInterest || '',
      quetz_sync_date: new Date().toISOString()
    };
  }

  async updateDealStage(dealId: string, newStage: string, amount?: number): Promise<boolean> {
    if (!this.hubspotApiKey) return false;

    try {
      const updateData: any = {
        dealstage: newStage
      };

      if (amount) {
        updateData.amount = amount;
      }

      await axios.patch(
        `${this.baseUrl}/crm/v3/objects/deals/${dealId}`,
        { properties: updateData },
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Updated HubSpot deal ${dealId} to stage: ${newStage}`);
      return true;

    } catch (error) {
      console.error('Error updating deal stage:', error);
      return false;
    }
  }

  async getBugBugExistingContacts(): Promise<any[]> {
    if (!this.hubspotApiKey) return [];

    try {
      const response = await axios.get(
        `${this.baseUrl}/crm/v3/objects/contacts`,
        {
          headers: {
            'Authorization': `Bearer ${this.hubspotApiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            properties: 'email,firstname,lastname,company,jobtitle,hs_lead_status,quetz_lead_score'
          }
        }
      );

      return response.data.results || [];

    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error);
      return [];
    }
  }

  async syncAllQualifiedLeads(): Promise<void> {
    console.log('🔄 Syncing all qualified leads to HubSpot CRM...');

    const qualifiedLeads = await prisma.automatedLead.findMany({
      where: {
        score: { gte: 70 },
        status: { in: ['enriched', 'qualified'] }
      },
      take: 50 // Process in batches
    });

    let synced = 0;
    let failed = 0;

    for (const lead of qualifiedLeads) {
      const success = await this.syncLeadToCRM(lead.id);
      if (success) {
        synced++;
      } else {
        failed++;
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ CRM sync completed: ${synced} synced, ${failed} failed`);
  }
}

// Create singleton instance
const crmIntegration = new CRMIntegration();

export default crmIntegration;