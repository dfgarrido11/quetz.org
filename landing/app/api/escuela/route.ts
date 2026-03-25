export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'es';
    
    // Get school project data
    const school = await prisma.schoolProject.findUnique({
      where: { id: 'zacapa' },
    });

    if (!school) {
      return NextResponse.json(
        { success: false, error: 'School project not found' },
        { status: 404 }
      );
    }

    // Calculate dynamic additions from donations
    const schoolDonations = await prisma.donation.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { 
        status: { in: ['paid', 'completed'] },
        purpose: 'school',
      },
    });

    const dynamicFunding = schoolDonations._sum.amount || 0;
    const totalRaised = school.raisedEur + dynamicFunding;
    const progress = Math.min((totalRaised / school.goalEur) * 100, 100);

    // Localized descriptions
    const descriptions: Record<string, string> = {
      es: 'La escuela se construirá en la aldea de Jumuzna, Zacapa. Actualmente estamos en la fase de compra del terreno. Tu donación se destina directamente a los materiales y la mano de obra local.',
      de: 'Die Schule wird im Dorf Jumuzna, Zacapa, gebaut. Derzeit befinden wir uns in der Phase des Grundstückskaufs. Ihre Spende geht direkt an Materialien und lokale Arbeitskräfte.',
      en: 'The school will be built in the village of Jumuzna, Zacapa. We are currently in the land acquisition phase. Your donation goes directly to materials and local labor.',
      fr: 'L\'école sera construite dans le village de Jumuzna, Zacapa. Nous sommes actuellement en phase d\'acquisition du terrain. Votre don va directement aux matériaux et à la main-d\'\u0153uvre locale.',
      ar: 'ستُبنى المدرسة في قرية خوموزنا، زاكابا. نحن حالياً في مرحلة شراء الأرض. تذهب تبرعاتك مباشرة إلى المواد والعمالة المحلية.',
    };

    const phaseNames: Record<string, Record<string, string>> = {
      terreno: { es: 'Compra del terreno', de: 'Grundstückskauf', en: 'Land acquisition', fr: 'Acquisition du terrain', ar: 'شراء الأرض' },
      cimientos: { es: 'Cimientos', de: 'Fundament', en: 'Foundation', fr: 'Fondations', ar: 'الأساسات' },
      paredes: { es: 'Paredes', de: 'Wände', en: 'Walls', fr: 'Murs', ar: 'الجدران' },
      techo: { es: 'Techo', de: 'Dach', en: 'Roof', fr: 'Toit', ar: 'السقف' },
      terminada: { es: 'Terminada', de: 'Fertig', en: 'Completed', fr: 'Terminée', ar: 'مكتملة' },
    };

    return NextResponse.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        description: descriptions[lang] || descriptions.es,
        location: 'Aldea Jumuzna, Zacapa, Guatemala',
        students: 120,
        classrooms: 4,
        
        funding: {
          goalEur: school.goalEur,
          raisedEur: Math.round(totalRaised * 100) / 100,
          progress: Math.round(progress * 100) / 100,
          donationsCount: schoolDonations._count.id,
        },
        
        phase: {
          code: school.phase,
          name: phaseNames[school.phase]?.[lang] || phaseNames[school.phase]?.es || school.phase,
        },
        
        history: school.history || [],
        
        // Donation examples
        donationExamples: [
          { amount: 10, description: lang === 'es' ? 'Material escolar para 2 niños' : '10€ = school supplies for 2 children' },
          { amount: 20, description: lang === 'es' ? 'Material para un pupitre' : '20€ = materials for one desk' },
          { amount: 50, description: lang === 'es' ? 'Un metro cuadrado de techo' : '50€ = one square meter of roof' },
          { amount: 100, description: lang === 'es' ? 'Una ventana completa' : '100€ = one complete window' },
        ],
      },
      meta: {
        lastUpdated: school.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching school data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch school data' },
      { status: 500 }
    );
  }
}
