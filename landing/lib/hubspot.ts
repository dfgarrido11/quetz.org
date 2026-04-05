// HubSpot CRM Integration for quetz.org
// Automatically sync leads from cold emails, contact forms, and website interactions

interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  website?: string;
  phone?: string;
  jobtitle?: string;
  city?: string;
  country?: string;
  lifecyclestage?: string;
  lead_source?: string;
  hs_lead_status?: string;
  industry?: string;
  // Custom properties for quetz.org
  quetz_plan_interest?: string;
  quetz_contact_reason?: string;
  quetz_company_size?: string;
  utm_source?: string;
  utm_campaign?: string;
}

interface HubSpotCompany {
  name: string;
  domain?: string;
  city?: string;
  country?: string;
  industry?: string;
  numberofemployees?: string;
  website?: string;
  // Custom properties
  quetz_csr_program?: string;
  quetz_sustainability_focus?: string;
  quetz_outreach_status?: string;
}

class HubSpotCRM {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ HubSpot API key not found. CRM features will be disabled.');
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' = 'GET', data?: any) {
    if (!this.apiKey) {
      throw new Error('HubSpot API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HubSpot API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ HubSpot API request failed:', error);
      throw error;
    }
  }

  /**
   * Create or update a contact in HubSpot
   */
  async upsertContact(contactData: HubSpotContact): Promise<any> {
    console.log('👤 Creating/updating HubSpot contact:', contactData.email);

    const properties: Record<string, string> = {};

    // Map contact data to HubSpot properties
    Object.entries(contactData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        properties[key] = String(value);
      }
    });

    // Always set some defaults
    properties.lifecyclestage = properties.lifecyclestage || 'lead';
    properties.lead_source = properties.lead_source || 'quetz_website';

    try {
      // Try to update existing contact first
      const updateResponse = await this.makeRequest(
        `/crm/v3/objects/contacts/${encodeURIComponent(contactData.email)}?idProperty=email`,
        'PATCH',
        { properties }
      );

      console.log('✅ Updated existing HubSpot contact:', contactData.email);
      return updateResponse;

    } catch (updateError) {
      // If update fails, create new contact
      try {
        const createResponse = await this.makeRequest(
          '/crm/v3/objects/contacts',
          'POST',
          { properties }
        );

        console.log('✅ Created new HubSpot contact:', contactData.email);
        return createResponse;

      } catch (createError) {
        console.error('❌ Failed to create/update contact:', createError);
        throw createError;
      }
    }
  }

  /**
   * Create or update a company in HubSpot
   */
  async upsertCompany(companyData: HubSpotCompany): Promise<any> {
    console.log('🏢 Creating/updating HubSpot company:', companyData.name);

    const properties: Record<string, string> = {};

    Object.entries(companyData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        properties[key] = String(value);
      }
    });

    try {
      // Try to find existing company by domain
      if (companyData.domain) {
        try {
          const searchResponse = await this.makeRequest(
            `/crm/v3/objects/companies/search`,
            'POST',
            {
              filterGroups: [{
                filters: [{
                  propertyName: 'domain',
                  operator: 'EQ',
                  value: companyData.domain
                }]
              }]
            }
          );

          if (searchResponse.results && searchResponse.results.length > 0) {
            // Update existing company
            const companyId = searchResponse.results[0].id;
            const updateResponse = await this.makeRequest(
              `/crm/v3/objects/companies/${companyId}`,
              'PATCH',
              { properties }
            );

            console.log('✅ Updated existing HubSpot company:', companyData.name);
            return updateResponse;
          }
        } catch (searchError) {
          console.log('ℹ️ Company search failed, will create new one');
        }
      }

      // Create new company
      const createResponse = await this.makeRequest(
        '/crm/v3/objects/companies',
        'POST',
        { properties }
      );

      console.log('✅ Created new HubSpot company:', companyData.name);
      return createResponse;

    } catch (error) {
      console.error('❌ Failed to create/update company:', error);
      throw error;
    }
  }

  /**
   * Track email interaction (sent, opened, clicked, replied)
   */
  async trackEmailInteraction(email: string, interactionType: 'sent' | 'opened' | 'clicked' | 'replied', campaignName?: string): Promise<void> {
    try {
      const properties: Record<string, string> = {
        [`quetz_email_${interactionType}_at`]: new Date().toISOString(),
      };

      if (campaignName) {
        properties.quetz_last_campaign = campaignName;
      }

      if (interactionType === 'replied') {
        properties.hs_lead_status = 'OPEN';
        properties.lifecyclestage = 'marketingqualifiedlead';
      } else if (interactionType === 'clicked') {
        properties.hs_lead_status = 'IN_PROGRESS';
      }

      await this.makeRequest(
        `/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`,
        'PATCH',
        { properties }
      );

      console.log(`✅ Tracked ${interactionType} for ${email}`);

    } catch (error) {
      console.error(`❌ Failed to track ${interactionType} for ${email}:`, error);
    }
  }

  /**
   * Sync cold email lead to HubSpot
   */
  async syncColdEmailLead(
    email: string,
    firstName: string,
    lastName: string,
    company: string,
    position: string,
    city?: string,
    industry?: string,
    campaignName?: string
  ): Promise<any> {
    console.log('📧 Syncing cold email lead to HubSpot:', email);

    // Create/update company first
    let companyResponse;
    try {
      companyResponse = await this.upsertCompany({
        name: company,
        city: city,
        industry: industry,
        quetz_outreach_status: 'contacted',
        quetz_csr_program: 'unknown'
      });
    } catch (error) {
      console.log('⚠️ Could not create company, proceeding with contact only');
    }

    // Create/update contact
    const contactData: HubSpotContact = {
      email,
      firstname: firstName,
      lastname: lastName,
      company: company,
      jobtitle: position,
      city: city,
      lifecyclestage: 'lead',
      lead_source: 'cold_email',
      hs_lead_status: 'NEW',
      industry: industry,
      quetz_contact_reason: 'csr_outreach',
      utm_source: 'cold_email',
      utm_campaign: campaignName || 'april_2026_csr_outreach'
    };

    const contactResponse = await this.upsertContact(contactData);

    // Associate contact with company if both were created
    if (companyResponse && contactResponse && companyResponse.id && contactResponse.id) {
      try {
        await this.makeRequest(
          `/crm/v3/objects/contacts/${contactResponse.id}/associations/companies/${companyResponse.id}/1`,
          'PUT'
        );
        console.log('✅ Associated contact with company in HubSpot');
      } catch (associationError) {
        console.log('⚠️ Could not associate contact with company');
      }
    }

    return contactResponse;
  }

  /**
   * Track website lead (from contact form, plan selection, etc.)
   */
  async trackWebsiteLead(
    email: string,
    source: 'contact_form' | 'plan_selection' | 'deck_download' | 'newsletter_signup',
    additionalData?: Record<string, any>
  ): Promise<any> {
    console.log('🌐 Tracking website lead:', email, source);

    const contactData: HubSpotContact = {
      email,
      firstname: additionalData?.firstName,
      lastname: additionalData?.lastName,
      company: additionalData?.company,
      phone: additionalData?.phone,
      lifecyclestage: 'lead',
      lead_source: 'website',
      hs_lead_status: source === 'contact_form' ? 'OPEN' : 'NEW',
      quetz_contact_reason: source,
      quetz_plan_interest: additionalData?.planType,
      utm_source: additionalData?.utm_source || 'website',
      utm_campaign: additionalData?.utm_campaign || 'organic'
    };

    return await this.upsertContact(contactData);
  }

  /**
   * Get contact by email
   */
  async getContact(email: string): Promise<any> {
    try {
      return await this.makeRequest(
        `/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`
      );
    } catch (error) {
      console.log(`ℹ️ Contact not found in HubSpot: ${email}`);
      return null;
    }
  }

  /**
   * Check if HubSpot is properly configured
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/crm/v3/objects/contacts?limit=1');
      console.log('✅ HubSpot connection test successful');
      return true;
    } catch (error) {
      console.error('❌ HubSpot connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const hubspotCRM = new HubSpotCRM();

// Helper functions for easy integration
export async function syncColdEmailToHubSpot(contactData: {
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
    await hubspotCRM.syncColdEmailLead(
      contactData.email,
      contactData.firstName,
      contactData.lastName,
      contactData.company,
      contactData.position,
      contactData.city,
      contactData.industry,
      contactData.campaignName
    );
  } catch (error) {
    console.error('❌ Failed to sync to HubSpot:', error);
    // Don't throw error - CRM sync shouldn't break email sending
  }
}

export async function trackWebsiteLeadInHubSpot(
  email: string,
  source: 'contact_form' | 'plan_selection' | 'deck_download' | 'newsletter_signup',
  additionalData?: Record<string, any>
): Promise<void> {
  try {
    await hubspotCRM.trackWebsiteLead(email, source, additionalData);
  } catch (error) {
    console.error('❌ Failed to track website lead:', error);
  }
}

export async function trackEmailInteraction(
  email: string,
  type: 'sent' | 'opened' | 'clicked' | 'replied',
  campaignName?: string
): Promise<void> {
  try {
    await hubspotCRM.trackEmailInteraction(email, type, campaignName);
  } catch (error) {
    console.error('❌ Failed to track email interaction:', error);
  }
}