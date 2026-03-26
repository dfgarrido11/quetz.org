export const dynamic = "force-dynamic";



import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get base stats (seeded values)
    const baseStats = await prisma.stats.findUnique({
      where: { id: 'main' },
    });

    // Get school project data
    const school = await prisma.schoolProject.findUnique({
      where: { id: 'zacapa' },
    });

    // Calculate dynamic additions from actual adoptions
    const adoptionAggregates = await prisma.adoption.aggregate({
      _sum: { 
        amount: true,
        quantity: true,
        socialFundAmount: true,
      },
      where: {
        status: { in: ['paid', 'active', 'completed'] },
      },
    });

    // Calculate dynamic additions from actual donations
    const donationAggregates = await prisma.donation.aggregate({
      _sum: { amount: true },
      where: { 
        status: { in: ['paid', 'completed'] },
      },
    });

    const schoolDonations = await prisma.donation.aggregate({
      _sum: { amount: true },
      where: { 
        status: { in: ['paid', 'completed'] },
        purpose: 'school',
      },
    });

    // Count planted trees (those with plantedAt date)
    const plantedCount = await prisma.adoption.aggregate({
      _sum: { quantity: true },
      where: {
        plantedAt: { not: null },
      },
    });

    // Count active farmers
    const activeFarmers = await prisma.farmer.count({
      where: { active: true },
    });

    // Combine base stats with dynamic data
    const dynamicAdoptionIncome = adoptionAggregates._sum.amount || 0;
    const dynamicDonationIncome = donationAggregates._sum.amount || 0;
    const dynamicAdoptedTrees = adoptionAggregates._sum.quantity || 0;
    const dynamicPlantedTrees = plantedCount._sum.quantity || 0;
    const dynamicSchoolFunding = schoolDonations._sum.amount || 0;
    const dynamicSocialFund = (adoptionAggregates._sum.socialFundAmount || 0) + (dynamicDonationIncome * 0.8);

    // Total stats = base + dynamic
    const totalIncome = (baseStats?.totalIncome || 0) + dynamicAdoptionIncome + dynamicDonationIncome;
    const socialFund = (baseStats?.socialFund || 0) + dynamicSocialFund;
    const treesAdopted = (baseStats?.treesAdopted || 0) + dynamicAdoptedTrees;
    const treesPlanted = (baseStats?.treesPlanted || 0) + dynamicPlantedTrees;
    const familiesHelped = baseStats?.familiesHelped || activeFarmers || 0;
    const co2CapturedKg = (baseStats?.co2CapturedKg || 0) + (dynamicPlantedTrees * 25); // avg 25kg per tree
    const schoolFunding = (school?.raisedEur || 0) + dynamicSchoolFunding;
    const schoolGoal = school?.goalEur || 50000;
    const schoolProgress = Math.min((schoolFunding / schoolGoal) * 100, 100);
    const schoolPhase = school?.phase || 'terreno';

    // Update cached stats
    await prisma.stats.upsert({
      where: { id: 'main' },
      update: {
        totalIncome,
        socialFund,
        treesAdopted,
        treesPlanted,
        familiesHelped,
        co2CapturedKg,
        schoolFunding,
        schoolProgress,
      },
      create: {
        id: 'main',
        totalIncome,
        socialFund,
        treesAdopted,
        treesPlanted,
        familiesHelped,
        co2CapturedKg,
        schoolFunding,
        schoolProgress,
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalIncome,
        socialFund,
        treesAdopted,
        treesPlanted,
        familiesHelped,
        co2CapturedKg,
      },
      school: {
        name: school?.name || 'Escuela Jumuzna',
        phase: schoolPhase,
        goalEur: schoolGoal,
        raisedEur: schoolFunding,
        progress: Math.round(schoolProgress * 100) / 100,
        history: school?.history || [],
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        activeFarmers,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      success: false,
      stats: {
        totalIncome: 5420.20,
        socialFund: 1626.06,
        treesAdopted: 847,
        treesPlanted: 623,
        familiesHelped: 23,
        co2CapturedKg: 15575,
      },
      school: {
        name: 'Escuela Jumuzna',
        phase: 'terreno',
        goalEur: 50000,
        raisedEur: 5420.20,
        progress: 10.84,
        history: [],
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        activeFarmers: 4,
      },
    });
  }
}
