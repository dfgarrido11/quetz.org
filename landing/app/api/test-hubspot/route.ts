import { NextRequest, NextResponse } from 'next/server';
import { hubspotCRM } from '@/lib/hubspot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🧪 Testing HubSpot connection via API route...');

    // Test basic connection
    const isConnected = await hubspotCRM.testConnection();

    if (!isConnected) {
      return NextResponse.json(
        { error: 'HubSpot connection failed', success: false },
        { status: 500 }
      );
    }

    console.log('✅ HubSpot connection successful');

    // Test creating a contact if test data provided
    if (body.test && body.email) {
      console.log('🧪 Creating test contact...');

      const testContact = await hubspotCRM.upsertContact({
        email: body.email,
        firstname: body.firstName || 'Test',
        lastname: body.lastName || 'User',
        company: body.company || 'Quetz Test Company',
        lead_source: 'api_test',
        quetz_contact_reason: 'api_testing'
      });

      console.log('✅ Test contact created:', testContact.id);

      return NextResponse.json({
        success: true,
        message: 'HubSpot connection and contact creation successful',
        contactId: testContact.id,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'HubSpot connection successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ HubSpot test API error:', error);

    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}