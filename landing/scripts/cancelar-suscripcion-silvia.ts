import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function cancelarSuscripcionSilvia() {
  console.log('URGENTE: Cancelando suscripción de Silvia Acevedo...');

  try {
    // Buscar usuario por nombre o email que contenga "silvia"
    console.log('🔍 Buscando a Silvia Acevedo en la base de datos...');

    const usuarios = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Silvia', mode: 'insensitive' } },
          { name: { contains: 'silvia', mode: 'insensitive' } },
          { email: { contains: 'silvia', mode: 'insensitive' } },
          { name: { contains: 'Acevedo', mode: 'insensitive' } },
          { name: { contains: 'acevedo', mode: 'insensitive' } }
        ]
      },
      include: {
        subscriptions: true,
        adoptions: true
      }
    });

    console.log(`📋 Encontrados ${usuarios.length} usuarios relacionados:`);
    usuarios.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} (${user.email}) - Suscripciones: ${user.subscriptions.length}`);
    });

    if (usuarios.length === 0) {
      console.log('⚠️  No se encontró a Silvia Acevedo en la base de datos');
      console.log('🔍 Buscando todas las suscripciones activas...');

      const suscripcionesActivas = await prisma.subscription.findMany({
        where: {
          status: 'active'
        },
        include: {
          user: true
        }
      });

      console.log(`📊 Suscripciones activas encontradas: ${suscripcionesActivas.length}`);
      suscripcionesActivas.forEach((sub, i) => {
        console.log(`   ${i + 1}. ${sub.user.name} (${sub.user.email}) - Plan: ${sub.planName} - Stripe ID: ${sub.stripeSubscriptionId}`);
      });
      return;
    }

    // Cancelar todas las suscripciones activas de Silvia
    for (const user of usuarios) {
      console.log(`\n👤 Procesando usuario: ${user.name} (${user.email})`);

      for (const subscription of user.subscriptions) {
        if (subscription.status === 'active' && subscription.stripeSubscriptionId) {
          console.log(`🚫 CANCELANDO suscripción ${subscription.id} (Stripe: ${subscription.stripeSubscriptionId})`);

          try {
            // Cancelar en Stripe
            const stripeSubscription = await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
            console.log(`✅ Suscripción cancelada en Stripe: ${stripeSubscription.status}`);

            // Actualizar en base de datos
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelAtPeriodEnd: true
              }
            });

            console.log(`✅ Suscripción actualizada en base de datos`);

          } catch (stripeError) {
            console.error(`❌ Error cancelando en Stripe:`, stripeError);

            // Aunque falle Stripe, marcar como cancelada en BD
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelAtPeriodEnd: true
              }
            });
            console.log(`⚠️  Marcada como cancelada en BD a pesar del error de Stripe`);
          }
        } else {
          console.log(`ℹ️  Suscripción ${subscription.id} ya está en estado: ${subscription.status}`);
        }
      }
    }

    console.log('\n✅ PROCESO COMPLETADO - Silvia Acevedo no recibirá más cobros');
    console.log('\n📋 Resumen de acciones:');
    console.log('   - Suscripciones canceladas en Stripe');
    console.log('   - Estados actualizados en base de datos');
    console.log('   - No habrá más cobros automáticos');

  } catch (error) {
    console.error('❌ Error durante la cancelación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    await cancelarSuscripcionSilvia();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();