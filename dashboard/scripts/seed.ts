import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TREE_IMAGES_LIST = [
  'https://thumbs.dreamstime.com/b/hand-nurturing-young-green-plant-fertile-soil-close-up-human-gently-placing-small-seedling-dark-under-natural-375374626.jpg',
  'https://cdn.shopify.com/s/files/1/0771/9331/4578/files/Tree-Planting-Sprout.jpg',
  'https://thumbs.dreamstime.com/b/bright-sunlight-illuminates-small-green-sprout-emerging-rich-earth-small-sprout-breaks-soil-bathed-warm-409678935.jpg',
  'https://thumbs.dreamstime.com/b/green-sprout-plant-fertile-soil-against-blurred-background-grass-young-greenery-365028055.jpg',
  'https://pbs.twimg.com/media/GpNhr0UWQAAM8rc.jpg',
  'https://m.media-amazon.com/images/I/61RzZizilXL.jpg',
  'https://thursd.com/storage/media/74225/Smalll-and-growing-palm-tree.jpg',
  'https://i.pinimg.com/736x/81/55/82/815582cdaada47961b343438fb24aa7c.jpg',
  'http://growbilliontrees.com/cdn/shop/articles/mahoganhy-tree.png?v=1740845598',
  'https://www.rainforest-alliance.org/wp-content/uploads/2021/06/kapok-tree-profile-1.jpg.optimal.jpg',
  'https://www.moonvalleynurseries.com/_next/image?url=https%3A%2F%2Fcdn.mvncorp.dev%2Fmedia%2Fproducts%2Fimages%2FPalo_Blanco_MVN.png&w=3840&q=50',
  'https://www.moonvalleynurseries.com/_next/image?url=https%3A%2F%2Fcdn.mvncorp.dev%2Fmedia%2Fproducts%2Fimages%2FSago_Palm_MVN2.png&w=3840&q=50',
];

const GUARDIAN_IMAGES = [
  'https://t4.ftcdn.net/jpg/15/71/27/93/360_F_1571279357_qLklFv4yrWehNJLNpJWhKtPpmRYSFvfo.jpg',
  'https://www.mayanhands.org/cdn/shop/articles/Sandra_Xinico_Batz_square_1600x.jpg?v=1527016989',
  'https://thumbs.dreamstime.com/b/el-anciano-27655319.jpg',
];

const SCENE_IMAGES = [
  'https://natureconservancy-h.assetsadobe.com/is/image/content/dam/tnc/nature/en/photos/t/n/tnc_75423798_Full.jpg?crop=737%2C0%2C2525%2C1389&wid=1300&hei=715&scl=1.9426573426573426',
  'https://thumbs.dreamstime.com/b/landscape-rain-forest-national-park-tikal-guatemala-sunset-beatiful-57529663.jpg',
  'https://discovery.sndimg.com/content/dam/images/discovery/fullset/2021/11/16/GettyImages-1204031983.jpg.rend.hgtvcom.1280.1280.suffix/1637087450013.jpeg',
];

async function main() {
  console.log('Seeding database...');

  // Create badges
  const badges = [
    { name: 'Primer Árbol', description: 'Plantaste tu primer árbol', icon: 'sprout', criteria: 'first_tree' },
    { name: '100kg CO2 Capturado', description: 'Tus árboles han capturado 100kg de CO2', icon: 'wind', criteria: 'co2_100kg' },
    { name: 'Primera Aula Construida', description: 'Contribuiste a construir tu primera aula escolar', icon: 'school', criteria: 'first_classroom' },
    { name: '1 Año de Suscripción', description: 'Llevas un año apoyando la reforestación', icon: 'calendar', criteria: 'one_year' },
    { name: 'Embajador Quetz', description: 'Referiste a 5+ personas a la causa', icon: 'award', criteria: 'ambassador' },
    { name: '5 Árboles Plantados', description: 'Tienes 5 árboles creciendo en Zacapa', icon: 'trees', criteria: 'five_trees' },
    { name: 'Guardián Conectado', description: 'Enviaste tu primer mensaje a tu guardián', icon: 'message-circle', criteria: 'first_message' },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: {},
      create: b,
    });
  }

  // Create guardians
  const guardian1 = await prisma.guardian.upsert({
    where: { id: 'guardian-1' },
    update: {},
    create: {
      id: 'guardian-1',
      name: 'Carlos Hernández López',
      photoUrl: GUARDIAN_IMAGES[0],
      location: 'Aldea El Jícaro, Zacapa, Guatemala',
      bio: 'Carlos nació y creció en la aldea El Jícaro, en el corazón del valle de Zacapa. Desde niño, su abuelo le enseñó a respetar la tierra y los árboles que dan vida al río Motagua. Hoy, a sus 42 años, Carlos es uno de los guardianes más experimentados de Quetz.org, cuidando más de 200 árboles en su parcela familiar.\n\nCada mañana, antes del amanecer, Carlos recorre los senderos entre las hileras de ceibas, caobas y cedros que ha plantado junto a las familias suscriptoras. Conoce cada árbol por su nombre y puede identificar cuándo uno necesita más agua o protección contra el viento. Su dedicación ha transformado lo que era tierra árida en un bosque joven que ya alberga tucanes y monos aulladores.\n\nCarlos sueña con que sus hijos hereden un Zacapa verde y próspero. "Cada árbol que plantamos es una promesa para el futuro", dice con orgullo mientras limpia las malezas alrededor de los brotes más jóvenes.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
  });

  const guardian2 = await prisma.guardian.upsert({
    where: { id: 'guardian-2' },
    update: {},
    create: {
      id: 'guardian-2',
      name: 'María Elena Xocop Chub',
      photoUrl: GUARDIAN_IMAGES[1],
      location: 'Comunidad Río Hondo, Zacapa, Guatemala',
      bio: 'María Elena es una mujer maya q\'eqchi\' que llegó a Zacapa hace 15 años buscando una vida mejor para sus tres hijos. Con el programa de Quetz.org encontró no solo un sustento económico, sino un propósito que la llena de alegría: ser guardiana del bosque.\n\nCon manos firmes y una sonrisa contagiosa, María Elena cuida de los árboles como si fueran sus propios hijos. Ha aprendido técnicas de reforestación sostenible y ahora enseña a otras mujeres de su comunidad. Gracias a los suscriptores de Quetz.org, pudo terminar de construir el aula donde sus hijos menores estudian.\n\nElla dice que los árboles le han devuelto la esperanza. "Cuando veo crecer un árbol que alguien en Europa financió, siento que el mundo es más pequeño y más unido de lo que pensamos."',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
  });

  const guardian3 = await prisma.guardian.upsert({
    where: { id: 'guardian-3' },
    update: {},
    create: {
      id: 'guardian-3',
      name: 'Don Pedro Mejía Castillo',
      photoUrl: GUARDIAN_IMAGES[2],
      location: 'Aldea La Fragua, Zacapa, Guatemala',
      bio: 'Don Pedro tiene 68 años y ha dedicado toda su vida a la agricultura en el valle de Zacapa. Cuando los suelos se agotaron y muchos vecinos emigraron a la ciudad, él decidió quedarse y luchar por su tierra. Al unirse a Quetz.org como guardián, descubrió que la reforestación era la clave para regenerar los suelos.\n\nCon la sabiduría de décadas trabajando la tierra, Don Pedro selecciona cuidadosamente las especies nativas que mejor se adaptan a cada terreno. Sus árboles tienen la tasa de supervivencia más alta del programa: 97%. Los otros guardianes lo buscan para pedir consejo.\n\n"Los árboles son la memoria de la tierra", dice Don Pedro mientras señala un cedro que plantó hace tres años y que ya mide cuatro metros. "Cada uno que plantamos es un recuerdo que dejamos para los que vienen después."',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
  });

  // Create guardian updates
  const updates = [
    { guardianId: 'guardian-1', content: '¡Hoy fue un gran día! Los árboles de la parcela norte ya miden más de 2 metros. Los tucanes han empezado a visitarnos todas las mañanas. 🌳🐦', photoUrl: SCENE_IMAGES[0] },
    { guardianId: 'guardian-1', content: 'Terminamos de instalar el sistema de riego por goteo en la nueva sección. Esto ayudará mucho a los brotes jóvenes durante la temporada seca.', photoUrl: SCENE_IMAGES[2] },
    { guardianId: 'guardian-2', content: 'Las niñas y niños de la escuela vinieron hoy a plantar sus propios arbolitos. ¡Fue una mañana hermosa llena de risas y tierra! 🌱👧👦', photoUrl: SCENE_IMAGES[2] },
    { guardianId: 'guardian-2', content: 'Compartiendo fotos del amanecer en el bosque joven. Cada día el paisaje es más verde y se siente más fresco el aire.', photoUrl: SCENE_IMAGES[1] },
    { guardianId: 'guardian-3', content: 'Los cedros que plantamos el año pasado ya están dando sombra suficiente para proteger los brotes nuevos. La naturaleza es sabia. 🌿', photoUrl: SCENE_IMAGES[0] },
  ];

  for (const u of updates) {
    await prisma.guardianUpdate.create({ data: u });
  }

  // Create test user (required)
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      id: 'user-test',
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'Juan García Morales',
      subscriptionStart: new Date('2024-06-15'),
      subscriptionTier: 'premium',
    },
  });

  // Create demo users
  const demoPassword = await bcrypt.hash('demo12345', 10);
  const user2 = await prisma.user.upsert({
    where: { email: 'ana@ejemplo.com' },
    update: {},
    create: {
      id: 'user-2',
      email: 'ana@ejemplo.com',
      password: demoPassword,
      name: 'Ana López Mendoza',
      subscriptionStart: new Date('2024-03-10'),
      subscriptionTier: 'standard',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'carlos@ejemplo.com' },
    update: {},
    create: {
      id: 'user-3',
      email: 'carlos@ejemplo.com',
      password: demoPassword,
      name: 'Carlos Ramírez Soto',
      subscriptionStart: new Date('2025-01-05'),
      subscriptionTier: 'standard',
    },
  });

  // Assign guardians to users
  await prisma.userGuardianAssignment.upsert({
    where: { userId: testUser.id },
    update: {},
    create: { userId: testUser.id, guardianId: guardian1.id },
  });
  await prisma.userGuardianAssignment.upsert({
    where: { userId: user2.id },
    update: {},
    create: { userId: user2.id, guardianId: guardian2.id },
  });
  await prisma.userGuardianAssignment.upsert({
    where: { userId: user3.id },
    update: {},
    create: { userId: user3.id, guardianId: guardian3.id },
  });

  // Trees for test user
  const treeSpecies = ['Ceiba', 'Caoba', 'Cedro', 'Palo Blanco', 'Matilisguate', 'Conacaste'];
  const treeNames = ['Esperanza', 'Vida Nueva', 'Raíces Fuertes', 'Sol de Zacapa', 'Guardián Verde', 'Lluvia de Estrellas', 'Amanecer', 'Tierra Fértil', 'Viento del Sur', 'Camino Verde', 'Río Motagua', 'Montaña Sagrada'];
  const stages = ['seed', 'sprout', 'sapling', 'mature'];
  // Each tree gets a unique photo from TREE_IMAGES_LIST

  const baseCoords = { lat: 14.9720, lng: -89.5228 };

  // Create 12 trees for test user
  for (let i = 0; i < 12; i++) {
    const stageIndex = Math.min(Math.floor(i / 3), 3);
    const stage = stages[stageIndex];
    const monthsAgo = 24 - (i * 2);
    const plantedDate = new Date();
    plantedDate.setMonth(plantedDate.getMonth() - monthsAgo);
    const co2 = parseFloat((monthsAgo * 0.8 + Math.random() * 2).toFixed(2));
    const lat = (baseCoords.lat + (Math.random() * 0.02 - 0.01)).toFixed(6);
    const lng = (baseCoords.lng + (Math.random() * 0.02 - 0.01)).toFixed(6);

    await prisma.tree.upsert({
      where: { id: `tree-${i + 1}` },
      update: {},
      create: {
        id: `tree-${i + 1}`,
        userId: testUser.id,
        name: treeNames[i],
        plantedDate,
        locationGps: `${lat}, ${lng}`,
        photoUrl: TREE_IMAGES_LIST[i % TREE_IMAGES_LIST.length],
        growthStage: stage,
        co2Captured: co2,
        species: treeSpecies[i % treeSpecies.length],
      },
    });
  }

  // Trees for user2
  for (let i = 0; i < 5; i++) {
    const stage = stages[Math.min(i, 3)];
    const monthsAgo = 10 - i * 2;
    const plantedDate = new Date();
    plantedDate.setMonth(plantedDate.getMonth() - monthsAgo);
    const lat = (baseCoords.lat + (Math.random() * 0.02 - 0.01)).toFixed(6);
    const lng = (baseCoords.lng + (Math.random() * 0.02 - 0.01)).toFixed(6);

    await prisma.tree.upsert({
      where: { id: `tree-u2-${i + 1}` },
      update: {},
      create: {
        id: `tree-u2-${i + 1}`,
        userId: user2.id,
        name: `Árbol ${i + 1} de Ana`,
        plantedDate,
        locationGps: `${lat}, ${lng}`,
        photoUrl: TREE_IMAGES_LIST[(i + 4) % TREE_IMAGES_LIST.length],
        growthStage: stage,
        co2Captured: parseFloat((monthsAgo * 0.6).toFixed(2)),
        species: treeSpecies[i % treeSpecies.length],
      },
    });
  }

  // Impact metrics
  await prisma.impactMetrics.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      totalTrees: 12,
      totalCo2Tons: 2.4,
      schoolSqm: 15.5,
      childrenBenefited: 8,
    },
  });
  await prisma.impactMetrics.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      totalTrees: 5,
      totalCo2Tons: 0.8,
      schoolSqm: 6.2,
      childrenBenefited: 3,
    },
  });
  await prisma.impactMetrics.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      totalTrees: 2,
      totalCo2Tons: 0.2,
      schoolSqm: 2.0,
      childrenBenefited: 1,
    },
  });

  // Assign badges to test user
  const allBadges = await prisma.badge.findMany();
  const earnedBadgeNames = ['Primer Árbol', '100kg CO2 Capturado', 'Primera Aula Construida', '1 Año de Suscripción', '5 Árboles Plantados', 'Guardián Conectado'];
  for (const badge of allBadges) {
    if (earnedBadgeNames.includes(badge.name)) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: testUser.id, badgeId: badge.id } },
        update: {},
        create: { userId: testUser.id, badgeId: badge.id },
      });
    }
  }
  // Ana gets 3 badges
  const anaBadges = ['Primer Árbol', '5 Árboles Plantados', 'Guardián Conectado'];
  for (const badge of allBadges) {
    if (anaBadges.includes(badge.name)) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user2.id, badgeId: badge.id } },
        update: {},
        create: { userId: user2.id, badgeId: badge.id },
      });
    }
  }

  // Messages between test user and guardian (using a system user approach)
  // We'll store guardian messages with a guardian prefix in senderId
  // Actually, Message model requires User relations, so guardian messages need a user proxy
  // Let's create a guardian proxy user
  const guardianProxy = await prisma.user.upsert({
    where: { email: 'guardian-system@quetz.org' },
    update: {},
    create: {
      id: 'guardian-proxy',
      email: 'guardian-system@quetz.org',
      password: await bcrypt.hash('system-no-login-' + Date.now(), 10),
      name: 'Sistema Guardián',
    },
  });

  const messages = [
    { senderId: testUser.id, receiverId: guardianProxy.id, content: '¡Hola Carlos! ¿Cómo están mis árboles? Me encantaría saber cómo va Esperanza.', isFromGuardian: false, createdAt: new Date('2025-11-01T10:00:00') },
    { senderId: guardianProxy.id, receiverId: testUser.id, content: '¡Hola Juan! Tus árboles están creciendo muy bien. Esperanza ya mide casi un metro y tiene hojas nuevas muy verdes. Te mando una foto pronto. 🌱', isFromGuardian: true, createdAt: new Date('2025-11-01T14:30:00') },
    { senderId: testUser.id, receiverId: guardianProxy.id, content: '¡Qué alegría! ¿Y la temporada de lluvias les ha ayudado?', isFromGuardian: false, createdAt: new Date('2025-11-02T09:15:00') },
    { senderId: guardianProxy.id, receiverId: testUser.id, content: 'Sí, las lluvias han sido muy buenas este año. Los cedros especialmente están creciendo muy rápido. Ayer medí Sol de Zacapa y ya tiene 1.5 metros. ¡Es impresionante!', isFromGuardian: true, createdAt: new Date('2025-11-02T16:00:00') },
    { senderId: testUser.id, receiverId: guardianProxy.id, content: 'Eso me hace muy feliz. Gracias por cuidarlos tan bien, Carlos. Espero poder visitar Zacapa algún día.', isFromGuardian: false, createdAt: new Date('2025-11-05T11:00:00') },
    { senderId: guardianProxy.id, receiverId: testUser.id, content: '¡Aquí siempre serás bienvenido, Juan! Sería un honor mostrarte el bosque que estamos construyendo juntos. Tu apoyo ha cambiado la vida de mi familia y de toda la comunidad. 🙏🌳', isFromGuardian: true, createdAt: new Date('2025-11-05T18:20:00') },
    { senderId: testUser.id, receiverId: guardianProxy.id, content: '¿Cómo va la construcción de la escuela? Vi que ya empezaron con los cimientos.', isFromGuardian: false, createdAt: new Date('2025-12-10T08:45:00') },
    { senderId: guardianProxy.id, receiverId: testUser.id, content: '¡Va muy bien! Ya terminamos las paredes del aula nueva. Los niños están emocionados porque podrán tener clase en un salón propio el próximo mes. Gracias a suscriptores como tú, esto es posible. 🏫', isFromGuardian: true, createdAt: new Date('2025-12-10T15:30:00') },
  ];

  for (const m of messages) {
    await prisma.message.create({ data: m });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
