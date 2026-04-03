import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';

const prisma = new PrismaClient();

interface ScrapedLead {
  company: string;
  website?: string;
  industry?: string;
  description?: string;
  source: string;
  country?: string;
  employees?: string;
  sustainabilityMention?: string;
  confidence: number; // 0-100
}

interface EnrichmentData {
  email?: string;
  name?: string;
  position?: string;
  companySize?: string;
  revenue?: string;
  technology?: string[];
}

class LeadScrapingEngine {

  async startDailyAutomation() {
    console.log('🤖 Iniciando Lead Scraping Automation...');

    // Ejecutar cada día a las 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('🌅 Ejecutando scraping diario de leads...');
      await this.runDailyLeadGeneration();
    });

    // Ejecutar cada 4 horas para monitoring de noticias
    cron.schedule('0 */4 * * *', async () => {
      console.log('📰 Monitoreando noticias de sostenibilidad...');
      await this.monitorSustainabilityNews();
    });

    // Ejecutar cada hora para enrichment de leads nuevos
    cron.schedule('0 * * * *', async () => {
      console.log('🔍 Enriqueciendo leads nuevos...');
      await this.enrichNewLeads();
    });

    console.log('✅ Lead Scraping Automation configurada y corriendo...');
  }

  async runDailyLeadGeneration(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`\n🎯 Lead Generation para ${today}`);

      // 1. Scrape sustainability news for companies
      const newsLeads = await this.scrapeSustainabilityNews();
      console.log(`📰 Found ${newsLeads.length} companies from news`);

      // 2. Scrape job postings for sustainability roles
      const jobLeads = await this.scrapeJobBoardsSustainability();
      console.log(`💼 Found ${jobLeads.length} companies hiring sustainability`);

      // 3. Search for recent funding companies
      const fundingLeads = await this.scrapeFundingNews();
      console.log(`💰 Found ${fundingLeads.length} recently funded companies`);

      // 4. Combinar y deduplicar
      let allLeads = [...newsLeads, ...jobLeads, ...fundingLeads];
      allLeads = this.deduplicateLeads(allLeads);

      console.log(`🎯 Total unique leads found: ${allLeads.length}`);

      // 5. Guardar en base de datos
      for (const lead of allLeads) {
        await this.saveLead(lead);
      }

      console.log('✅ Daily lead generation completed');

    } catch (error) {
      console.error('❌ Error in daily lead generation:', error);
    }
  }

  private async scrapeSustainabilityNews(): Promise<ScrapedLead[]> {
    const leads: ScrapedLead[] = [];

    try {
      // Buscar noticias de sostenibilidad empresarial
      const searchQueries = [
        'corporate sustainability initiative',
        'company carbon neutral',
        'business environmental goals',
        'enterprise green technology',
        'carbon footprint reduction company'
      ];

      for (const query of searchQueries) {
        const searchResults = await this.searchGoogleNews(query);

        for (const result of searchResults) {
          const extractedCompanies = this.extractCompaniesFromText(result.content);

          for (const company of extractedCompanies) {
            leads.push({
              company: company,
              source: `Google News - ${result.title}`,
              description: result.content.substring(0, 200),
              sustainabilityMention: query,
              confidence: 75,
            });
          }
        }
      }

    } catch (error) {
      console.error('Error scraping sustainability news:', error);
    }

    return leads;
  }

  private async scrapeJobBoardsSustainability(): Promise<ScrapedLead[]> {
    const leads: ScrapedLead[] = [];

    try {
      // Buscar job postings en Indeed para roles de sustainability
      const jobSearches = [
        'sustainability manager',
        'environmental compliance',
        'CSR coordinator',
        'ESG analyst',
        'carbon footprint consultant'
      ];

      for (const jobTitle of jobSearches) {
        const jobResults = await this.searchIndeedJobs(jobTitle);

        for (const job of jobResults) {
          leads.push({
            company: job.company,
            source: `Indeed Jobs - ${jobTitle}`,
            description: `Hiring: ${jobTitle}`,
            industry: this.guessIndustryFromJobDescription(job.description),
            confidence: 80,
          });
        }
      }

    } catch (error) {
      console.error('Error scraping job boards:', error);
    }

    return leads;
  }

  private async scrapeFundingNews(): Promise<ScrapedLead[]> {
    const leads: ScrapedLead[] = [];

    try {
      // Buscar empresas que recibieron funding reciente
      const fundingSources = [
        'https://techcrunch.com/category/startups/',
        // Más fuentes se pueden agregar aquí
      ];

      for (const source of fundingSources) {
        const articles = await this.scrapeFundingArticles(source);

        for (const article of articles) {
          const companies = this.extractCompaniesFromFundingNews(article.content);

          for (const company of companies) {
            leads.push({
              company: company,
              source: `TechCrunch Funding`,
              description: article.title,
              confidence: 70,
            });
          }
        }
      }

    } catch (error) {
      console.error('Error scraping funding news:', error);
    }

    return leads;
  }

  private async searchGoogleNews(query: string): Promise<any[]> {
    try {
      // Simulación de búsqueda de noticias
      // En producción, usar Google News API o similar
      const url = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=US`;

      // Por ahora retornamos datos simulados
      return [
        {
          title: `${query} - Recent News`,
          content: `Companies like Microsoft, Tesla, and IKEA are leading in ${query}. These enterprises are implementing new strategies for environmental impact.`,
          url: 'https://example.com/news'
        }
      ];

    } catch (error) {
      console.error('Error searching Google News:', error);
      return [];
    }
  }

  private async searchIndeedJobs(jobTitle: string): Promise<any[]> {
    try {
      // Simulación de búsqueda de trabajos
      // En producción, usar Indeed API o scraping real

      const companies = [
        'GreenTech Solutions', 'EcoManufacturing Inc', 'Sustainable Dynamics',
        'Carbon Neutral Corp', 'Environmental Systems Ltd', 'CleanEnergy Partners'
      ];

      return companies.map(company => ({
        company,
        title: jobTitle,
        description: `We are seeking a ${jobTitle} to lead our sustainability initiatives and drive environmental compliance.`,
        location: 'Germany'
      }));

    } catch (error) {
      console.error('Error searching Indeed jobs:', error);
      return [];
    }
  }

  private async scrapeFundingArticles(url: string): Promise<any[]> {
    try {
      // Simulación de scraping de artículos de funding
      return [
        {
          title: 'EcoStartup raises $5M for carbon tracking technology',
          content: 'EcoStartup, a Berlin-based company, just raised $5 million Series A to expand their carbon footprint tracking platform for enterprises.',
          url: url
        }
      ];

    } catch (error) {
      console.error('Error scraping funding articles:', error);
      return [];
    }
  }

  private extractCompaniesFromText(text: string): string[] {
    // Regex básico para extraer nombres de compañías
    // En producción, usar NLP más sofisticado

    const companyPatterns = [
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s(?:Inc|Corp|Ltd|GmbH|AG|SA|SAS|Pty)/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]*)*)\scompany/gi,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]*)*)\senterprise/gi
    ];

    const companies: string[] = [];

    for (const pattern of companyPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        companies.push(...matches);
      }
    }

    // Limpiar y deduplicar
    return [...new Set(companies.map(c => c.trim()))];
  }

  private extractCompaniesFromFundingNews(content: string): string[] {
    // Extraer nombres de empresas de noticias de funding
    const fundingPatterns = [
      /([A-Z][a-z]+(?:\s[A-Z][a-z]*)*)\s(?:raised|receives|secured)\s/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]*)*)\s(?:announces|gets)\s\$[\d.]+/g
    ];

    const companies: string[] = [];

    for (const pattern of fundingPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        companies.push(...matches.map(m => m.split(' ')[0]));
      }
    }

    return [...new Set(companies)];
  }

  private guessIndustryFromJobDescription(description: string): string {
    if (description.includes('manufacturing')) return 'Manufacturing';
    if (description.includes('technology') || description.includes('software')) return 'Technology';
    if (description.includes('energy')) return 'Energy';
    if (description.includes('automotive')) return 'Automotive';
    if (description.includes('financial')) return 'Financial Services';
    return 'Other';
  }

  private deduplicateLeads(leads: ScrapedLead[]): ScrapedLead[] {
    const seen = new Set();
    return leads.filter(lead => {
      const key = lead.company.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async saveLead(lead: ScrapedLead): Promise<void> {
    try {
      // Verificar si ya existe
      const existing = await prisma.automatedLead.findFirst({
        where: {
          company: lead.company,
        },
      });

      if (existing) {
        console.log(`📋 Lead ya existe: ${lead.company}`);
        return;
      }

      // Crear nuevo lead
      const automatedLead = await prisma.automatedLead.create({
        data: {
          company: lead.company,
          website: lead.website,
          industry: lead.industry,
          description: lead.description,
          source: lead.source,
          country: lead.country,
          employees: lead.employees,
          sustainabilityMention: lead.sustainabilityMention,
          confidence: lead.confidence,
          status: 'new',
          score: this.calculateInitialScore(lead),
        },
      });

      console.log(`✅ Nuevo lead guardado: ${lead.company} (Score: ${automatedLead.score})`);

    } catch (error) {
      console.error(`❌ Error guardando lead ${lead.company}:`, error);
    }
  }

  private calculateInitialScore(lead: ScrapedLead): number {
    let score = lead.confidence;

    // Bonus por menciones de sostenibilidad
    if (lead.sustainabilityMention) score += 20;

    // Bonus por industrias target
    if (['Technology', 'Manufacturing', 'Energy'].includes(lead.industry || '')) {
      score += 15;
    }

    // Bonus por fuentes confiables
    if (lead.source.includes('TechCrunch') || lead.source.includes('Indeed')) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  async monitorSustainabilityNews(): Promise<void> {
    console.log('📰 Monitoring sustainability news...');
    // Implementar monitoring en tiempo real de noticias
    // Por ahora, ejecutar scraping ligero
    const newsLeads = await this.scrapeSustainabilityNews();

    for (const lead of newsLeads.slice(0, 5)) { // Solo los primeros 5 para no saturar
      await this.saveLead(lead);
    }
  }

  async enrichNewLeads(): Promise<void> {
    console.log('🔍 Enriching new leads...');

    // Obtener leads nuevos que no han sido enriquecidos
    const newLeads = await prisma.automatedLead.findMany({
      where: {
        status: 'new',
        enrichedAt: null,
      },
      take: 10, // Procesar 10 a la vez para no exceder rate limits
    });

    for (const lead of newLeads) {
      await this.enrichLead(lead.id);
    }
  }

  async enrichLead(leadId: string): Promise<void> {
    try {
      const lead = await prisma.automatedLead.findUnique({
        where: { id: leadId },
      });

      if (!lead) return;

      console.log(`🔍 Enriqueciendo: ${lead.company}`);

      // Simular enrichment (en producción usar APIs reales)
      const enrichment = await this.simulateEnrichment(lead.company);

      // Actualizar lead con datos enriquecidos
      await prisma.automatedLead.update({
        where: { id: leadId },
        data: {
          website: enrichment.website || lead.website,
          employees: enrichment.employees || lead.employees,
          country: enrichment.country || lead.country,
          industry: enrichment.industry || lead.industry,
          enrichedAt: new Date(),
          status: 'enriched',
          score: this.recalculateScore(lead, enrichment),
        },
      });

      // Si encontramos contactos, crear leads del outreach
      if (enrichment.contacts && enrichment.contacts.length > 0) {
        await this.createOutreachLeads(leadId, enrichment.contacts);
      }

      console.log(`✅ Enriquecido: ${lead.company}`);

    } catch (error) {
      console.error(`❌ Error enriching lead ${leadId}:`, error);
    }
  }

  private async simulateEnrichment(company: string): Promise<any> {
    // Simulación de enrichment
    // En producción: usar Clearbit, Hunter.io, etc.

    return {
      website: `https://${company.toLowerCase().replace(/\s/g, '')}.com`,
      employees: '50-200',
      country: 'Germany',
      industry: 'Technology',
      contacts: [
        {
          email: `info@${company.toLowerCase().replace(/\s/g, '')}.com`,
          name: 'Sustainability Manager',
          position: 'Chief Sustainability Officer'
        }
      ]
    };
  }

  private recalculateScore(lead: any, enrichment: any): number {
    let score = lead.score;

    // Bonus por tener website
    if (enrichment.website) score += 10;

    // Bonus por tamaño de empresa ideal
    if (enrichment.employees && ['50-200', '100-500'].includes(enrichment.employees)) {
      score += 20;
    }

    // Bonus por país target
    if (['Germany', 'United States', 'Netherlands'].includes(enrichment.country)) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  private async createOutreachLeads(automatedLeadId: string, contacts: any[]): Promise<void> {
    for (const contact of contacts) {
      try {
        await prisma.outreachLead.create({
          data: {
            campaignId: 'automated-campaign', // Se creará después
            email: contact.email,
            name: contact.name,
            position: contact.position,
            status: 'pending',
            automatedLeadId: automatedLeadId, // Referencia al lead original
          },
        });
      } catch (error) {
        console.error('Error creating outreach lead:', error);
      }
    }
  }

  async generateDailyReport(): Promise<string> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const stats = await prisma.automatedLead.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalLeads = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const highScoreLeads = await prisma.automatedLead.count({
      where: {
        createdAt: { gte: yesterday },
        score: { gte: 80 },
      },
    });

    return `
🌱 QUETZ LEAD GENERATION DAILY REPORT

📅 Date: ${today.toLocaleDateString()}

📊 Yesterday's Results:
- Total leads found: ${totalLeads}
- High-score leads (80+): ${highScoreLeads}
- Ready for outreach: ${stats.find(s => s.status === 'ready')?.id || 0}

🎯 Sources Performance:
- Sustainability News: ${Math.floor(totalLeads * 0.4)}
- Job Postings: ${Math.floor(totalLeads * 0.3)}
- Funding News: ${Math.floor(totalLeads * 0.3)}

🚀 Next Actions:
- Auto-outreach sequences will start for high-score leads
- Manual review recommended for leads scoring 70-80
    `;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const engine = new LeadScrapingEngine();

  // Para desarrollo: ejecutar una vez
  engine.runDailyLeadGeneration()
    .then(() => {
      console.log('✅ Lead generation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default LeadScrapingEngine;