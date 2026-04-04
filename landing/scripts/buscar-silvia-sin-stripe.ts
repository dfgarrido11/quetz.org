import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function buscarSilvia() {
  console.log('🚨 URGENTE: Buscando a Silvia Acevedo...');

  try {
    // Buscar usuario por nombre o email que contenga "silvia"
    console.log('🔍 Buscando en todos los usuarios...');

    const todosUsuarios = await prisma.user.findMany({
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' }
        },
        adoptions: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📋 Total de usuarios en BD: ${todosUsuarios.length}`);
    console.log('\n👥 TODOS LOS USUARIOS:');

    todosUsuarios.forEach((user, i) => {
      console.log(`\n${i + 1}. 👤 ${user.name || 'Sin nombre'} (${user.email})`);
      console.log(`   📅 Creado: ${user.createdAt.toISOString()}`);
      console.log(`   🌳 Adopciones: ${user.adoptions.length}`);
      console.log(`   💳 Suscripciones: ${user.subscriptions.length}`);

      if (user.subscriptions.length > 0) {
        user.subscriptions.forEach((sub, j) => {
          console.log(`      💳 Sub ${j + 1}: ${sub.planName} - ${sub.status} - Stripe: ${sub.stripeSubscriptionId || 'N/A'}`);
        });
      }
    });

    // Buscar específicamente Silvia
    const silviaUsuarios = todosUsuarios.filter(user =>
      (user.name?.toLowerCase().includes('silvia') ||
       user.email?.toLowerCase().includes('silvia') ||
       user.name?.toLowerCase().includes('acevedo'))
    );

    if (silviaUsuarios.length > 0) {
      console.log('\n🎯 ENCONTRADOS USUARIOS QUE PODRÍAN SER SILVIA:');
      silviaUsuarios.forEach((user, i) => {
        console.log(`\n${i + 1}. 🚨 ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id}`);

        user.subscriptions.forEach((sub) => {
          if (sub.status === 'active') {
            console.log(`   🚫 SUSCRIPCIÓN ACTIVA: ${sub.planName}`);
            console.log(`      Stripe ID: ${sub.stripeSubscriptionId}`);
            console.log(`      Monto: €${sub.priceEurMonth}/mes`);
            console.log(`      ⚠️  REQUIERE CANCELACIÓN INMEDIATA`);
          }
        });
      });
    }

    // Mostrar TODAS las suscripciones activas (sin importar el nombre)
    const suscripcionesActivas = await prisma.subscription.findMany({
      where: {
        status: 'active'
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n💳 TODAS LAS SUSCRIPCIONES ACTIVAS (${suscripcionesActivas.length}):`);
    suscripcionesActivas.forEach((sub, i) => {
      console.log(`\n${i + 1}. 🚨 ACTIVA - ${sub.user.name} (${sub.user.email})`);
      console.log(`   Plan: ${sub.planName} - €${sub.priceEurMonth}/mes`);
      console.log(`   Stripe ID: ${sub.stripeSubscriptionId}`);
      console.log(`   Creada: ${sub.createdAt.toISOString()}`);
      console.log(`   ⚠️  SE COBRARÁ AUTOMÁTICAMENTE`);
    });

    if (suscripcionesActivas.length > 0) {
      console.log('\n🚨 ACCIÓN INMEDIATA REQUERIDA:');
      console.log('   Ve a tu dashboard de Stripe (dashboard.stripe.com)');
      console.log('   Busca y cancela manualmente estas suscripciones:');
      suscripcionesActivas.forEach((sub) => {
        console.log(`   - ${sub.stripeSubscriptionId} (${sub.user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

buscarSilvia();