import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Tree catalog with multilingual data
const trees = [
  {
    species: 'cafe',
    nameEs: 'Café', nameDe: 'Kaffee', nameEn: 'Coffee', nameFr: 'Café', nameAr: 'قهوة',
    descEs: 'El oro de las montañas mayas. Cada taza cuenta una historia de esfuerzo y tradición.',
    descDe: 'Das Gold der Maya-Berge. Jede Tasse erzählt eine Geschichte von Mühe und Tradition.',
    descEn: 'The gold of the Mayan mountains. Each cup tells a story of effort and tradition.',
    descFr: 'L\'or des montagnes mayas. Chaque tasse raconte une histoire d\'effort et de tradition.',
    descAr: 'ذهب جبال المايا. كل كوب يروي قصة جهد وتقاليد.',
    impactEs: 'Genera ingresos para una familia durante un año.',
    impactDe: 'Generiert Einkommen für eine Familie für ein Jahr.',
    impactEn: 'Generates income for a family for one year.',
    impactFr: 'Génère des revenus pour une famille pendant un an.',
    impactAr: 'يولد دخلاً لعائلة واحدة لمدة عام.',
    impactCo2Kg: 22, impactFamilies: 0.15, priceBaseEur: 25,
    image: '/trees/cafe.jpg',
  },
  {
    species: 'aguacate',
    nameEs: 'Aguacate', nameDe: 'Avocado', nameEn: 'Avocado', nameFr: 'Avocat', nameAr: 'أفوكادو',
    descEs: 'El fruto que alimenta generaciones. Nutrición y economía para familias locales.',
    descDe: 'Die Frucht, die Generationen ernährt. Ernährung und Wirtschaft für lokale Familien.',
    descEn: 'The fruit that feeds generations. Nutrition and economy for local families.',
    descFr: 'Le fruit qui nourrit les générations. Nutrition et économie pour les familles locales.',
    descAr: 'الفاكهة التي تغذي الأجيال. التغذية والاقتصاد للعائلات المحلية.',
    impactEs: 'Produce hasta 200 frutos al año para consumo y venta.',
    impactDe: 'Produziert bis zu 200 Früchte pro Jahr für Konsum und Verkauf.',
    impactEn: 'Produces up to 200 fruits per year for consumption and sale.',
    impactFr: 'Produit jusqu\'à 200 fruits par an pour la consommation et la vente.',
    impactAr: 'ينتج ما يصل إلى 200 ثمرة سنوياً للاستهلاك والبيع.',
    impactCo2Kg: 30, impactFamilies: 0.12, priceBaseEur: 25,
    image: '/trees/aguacate.jpg',
  },
  {
    species: 'caoba',
    nameEs: 'Caoba', nameDe: 'Mahagoni', nameEn: 'Mahogany', nameFr: 'Acajou', nameAr: 'الماهوغوني',
    descEs: 'La nobleza de la selva. Un legado que perdura por generaciones.',
    descDe: 'Der Adel des Dschungels. Ein Vermächtnis, das Generationen überdauert.',
    descEn: 'The nobility of the jungle. A legacy that endures for generations.',
    descFr: 'La noblesse de la jungle. Un héritage qui perdure pendant des générations.',
    descAr: 'نبل الغابة. إرث يدوم لأجيال.',
    impactEs: 'Captura 50 kg de CO₂ en sus primeros 10 años.',
    impactDe: 'Fängt 50 kg CO₂ in den ersten 10 Jahren ein.',
    impactEn: 'Captures 50 kg of CO₂ in its first 10 years.',
    impactFr: 'Capture 50 kg de CO₂ dans ses 10 premières années.',
    impactAr: 'يلتقط 50 كجم من ثاني أكسيد الكربون في أول 10 سنوات.',
    impactCo2Kg: 50, impactFamilies: 0.05, priceBaseEur: 30,
    image: '/trees/caoba.jpg',
  },
  {
    species: 'rambutan',
    nameEs: 'Rambután', nameDe: 'Rambutan', nameEn: 'Rambutan', nameFr: 'Ramboutan', nameAr: 'رامبوتان',
    descEs: 'El dragón frutal de la Costa Sur. Exótico, dulce y generador de ingresos todo el año.',
    descDe: 'Die Drachenfrucht der Südküste. Exotisch, süß und das ganze Jahr über einkommensgenerierend.',
    descEn: 'The fruit dragon of the South Coast. Exotic, sweet and income-generating year-round.',
    descFr: 'Le dragon fruitier de la côte sud. Exotique, sucré et générateur de revenus toute l\'année.',
    descAr: 'تنين الفاكهة في الساحل الجنوبي. غريب وحلو ومولد للدخل على مدار العام.',
    impactEs: 'Fruta exótica con mercado premium todo el año.',
    impactDe: 'Exotische Frucht mit Premium-Markt das ganze Jahr über.',
    impactEn: 'Exotic fruit with premium market year-round.',
    impactFr: 'Fruit exotique avec marché premium toute l\'année.',
    impactAr: 'فاكهة غريبة بسوق متميز على مدار العام.',
    impactCo2Kg: 20, impactFamilies: 0.1, priceBaseEur: 25,
    image: '/trees/rambutan.jpg',
  },
  {
    species: 'cacao',
    nameEs: 'Cacao', nameDe: 'Kakao', nameEn: 'Cacao', nameFr: 'Cacao', nameAr: 'كاكاو',
    descEs: 'El manjar de los dioses. La semilla sagrada maya que endulza el mundo con propósito.',
    descDe: 'Die Speise der Götter. Der heilige Maya-Samen, der die Welt mit Sinn versüßt.',
    descEn: 'The food of the gods. The sacred Mayan seed that sweetens the world with purpose.',
    descFr: 'Le mets des dieux. La graine sacrée maya qui adoucit le monde avec un but.',
    descAr: 'طعام الآلهة. البذرة المقدسة للمايا التي تحلي العالم بهدف.',
    impactEs: 'Produce chocolate artesanal de comercio justo.',
    impactDe: 'Produziert handwerkliche Fair-Trade-Schokolade.',
    impactEn: 'Produces artisanal fair trade chocolate.',
    impactFr: 'Produit du chocolat artisanal de commerce équitable.',
    impactAr: 'ينتج شوكولاتة حرفية من التجارة العادلة.',
    impactCo2Kg: 25, impactFamilies: 0.12, priceBaseEur: 25,
    image: '/trees/cacao.jpg',
  },
  {
    species: 'cedro',
    nameEs: 'Cedro', nameDe: 'Zeder', nameEn: 'Cedar', nameFr: 'Cèdre', nameAr: 'أرز',
    descEs: 'El guardián del bosque. Aroma ancestral y madera que protege la biodiversidad.',
    descDe: 'Der Wächter des Waldes. Uralter Duft und Holz, das die Biodiversität schützt.',
    descEn: 'The guardian of the forest. Ancestral aroma and wood that protects biodiversity.',
    descFr: 'Le gardien de la forêt. Arôme ancestral et bois qui protège la biodiversité.',
    descAr: 'حارس الغابة. رائحة أسلافية وخشب يحمي التنوع البيولوجي.',
    impactEs: 'Refugio para más de 20 especies de aves locales.',
    impactDe: 'Zuflucht für mehr als 20 lokale Vogelarten.',
    impactEn: 'Refuge for more than 20 local bird species.',
    impactFr: 'Refuge pour plus de 20 espèces d\'oiseaux locales.',
    impactAr: 'ملجأ لأكثر من 20 نوعاً من الطيور المحلية.',
    impactCo2Kg: 45, impactFamilies: 0.08, priceBaseEur: 28,
    image: '/trees/cedro.jpg',
  },
  {
    species: 'naranja',
    nameEs: 'Naranja', nameDe: 'Orange', nameEn: 'Orange', nameFr: 'Orange', nameAr: 'برتقال',
    descEs: 'Dulce resistencia en tierras secas. Vitaminas y esperanza para toda la comunidad.',
    descDe: 'Süßer Widerstand in trockenen Ländern. Vitamine und Hoffnung für die ganze Gemeinschaft.',
    descEn: 'Sweet resistance in dry lands. Vitamins and hope for the whole community.',
    descFr: 'Douce résistance dans les terres arides. Vitamines et espoir pour toute la communauté.',
    descAr: 'مقاومة حلوة في الأراضي الجافة. فيتامينات وأمل للمجتمع بأكمله.',
    impactEs: 'Vitamina C para 50 familias durante la cosecha.',
    impactDe: 'Vitamin C für 50 Familien während der Ernte.',
    impactEn: 'Vitamin C for 50 families during harvest.',
    impactFr: 'Vitamine C pour 50 familles pendant la récolte.',
    impactAr: 'فيتامين سي لـ 50 عائلة خلال موسم الحصاد.',
    impactCo2Kg: 18, impactFamilies: 0.1, priceBaseEur: 22,
    image: '/trees/naranja.jpg',
  },
  {
    species: 'limon',
    nameEs: 'Limón', nameDe: 'Zitrone', nameEn: 'Lemon', nameFr: 'Citron', nameAr: 'ليمون',
    descEs: 'Frescura entre piedras. Versatilidad cítrica de uso diario e ingreso constante.',
    descDe: 'Frische zwischen Steinen. Zitrische Vielseitigkeit für den täglichen Gebrauch und konstantes Einkommen.',
    descEn: 'Freshness among stones. Citric versatility for daily use and constant income.',
    descFr: 'Fraîcheur parmi les pierres. Polyvalence citronnée pour un usage quotidien et un revenu constant.',
    descAr: 'انتعاش بين الصخور. تنوع حمضي للاستخدام اليومي ودخل ثابت.',
    impactEs: 'Produce frutos 3 veces al año, ingreso constante.',
    impactDe: 'Produziert 3 Mal im Jahr Früchte, konstantes Einkommen.',
    impactEn: 'Produces fruit 3 times a year, constant income.',
    impactFr: 'Produit des fruits 3 fois par an, revenu constant.',
    impactAr: 'ينتج ثماراً 3 مرات في السنة، دخل ثابت.',
    impactCo2Kg: 15, impactFamilies: 0.1, priceBaseEur: 22,
    image: '/trees/limon.jpg',
  },
  {
    species: 'cactus',
    nameEs: 'Cactus', nameDe: 'Kaktus', nameEn: 'Cactus', nameFr: 'Cactus', nameAr: 'صبار',
    descEs: 'El guerrero del desierto. Resiliente como Zacapa, sobrevive y prospera donde otros no pueden.',
    descDe: 'Der Wüstenkrieger. Widerstandsfähig wie Zacapa, überlebt und gedeiht, wo andere es nicht können.',
    descEn: 'The desert warrior. Resilient like Zacapa, survives and thrives where others cannot.',
    descFr: 'Le guerrier du désert. Résilient comme Zacapa, survit et prospère là où d\'autres ne le peuvent pas.',
    descAr: 'محارب الصحراء. مرن مثل زاكابا، يعيش ويزدهر حيث لا يستطيع الآخرون.',
    impactEs: 'Ayuda a restaurar 1 m² de tierra árida.',
    impactDe: 'Hilft, 1 m² trockenes Land wiederherzustellen.',
    impactEn: 'Helps restore 1 m² of arid land.',
    impactFr: 'Aide à restaurer 1 m² de terre aride.',
    impactAr: 'يساعد في استعادة 1 م² من الأراضي القاحلة.',
    impactCo2Kg: 8, impactFamilies: 0.05, priceBaseEur: 15,
    image: '/trees/cactus.jpg',
  },
];

// Farmers with their stories
const farmers = [
  {
    id: 'farmer-1',
    name: 'Don José García',
    photoUrl: '/photos/farmer-jose.jpg',
    location: 'Aldea Jumuzna, Zacapa',
    storyEs: 'José lleva 35 años cultivando la tierra de Zacapa. "Mi padre me enseñó a respetar cada árbol", dice mientras señala los cafetales que cuida. Con QUETZ, ahora puede dar trabajo a sus dos hijos y planea construir un cuarto extra en su casa.',
    storyDe: 'José bewirtschaftet seit 35 Jahren das Land von Zacapa. "Mein Vater hat mir beigebracht, jeden Baum zu respektieren", sagt er und zeigt auf die Kaffeeplantagen, die er pflegt. Mit QUETZ kann er jetzt seinen beiden Söhnen Arbeit geben und plant, einen zusätzlichen Raum in seinem Haus zu bauen.',
    storyEn: 'José has been cultivating the land of Zacapa for 35 years. "My father taught me to respect every tree," he says while pointing to the coffee plants he tends. With QUETZ, he can now give work to his two sons and plans to build an extra room in his house.',
    storyFr: 'José cultive la terre de Zacapa depuis 35 ans. "Mon père m\'a appris à respecter chaque arbre", dit-il en montrant les caféiers qu\'il entretient. Avec QUETZ, il peut maintenant donner du travail à ses deux fils et prévoit de construire une pièce supplémentaire dans sa maison.',
    storyAr: 'يزرع خوسيه أرض زاكابا منذ 35 عاماً. "علمني والدي احترام كل شجرة"، يقول وهو يشير إلى شجيرات القهوة التي يعتني بها. مع QUETZ، يمكنه الآن توفير عمل لابنيه ويخطط لبناء غرفة إضافية في منزله.',
    payments: [
      { date: '2025-12-01', amountEur: 180, concept: 'Mantenimiento árboles diciembre' },
      { date: '2026-01-01', amountEur: 195, concept: 'Mantenimiento árboles enero' },
      { date: '2026-02-01', amountEur: 210, concept: 'Mantenimiento árboles febrero' },
    ],
  },
  {
    id: 'farmer-2',
    name: 'Doña María Hernández',
    photoUrl: '/photos/farmer-maria.jpg',
    location: 'San Diego, Zacapa',
    storyEs: 'María es madre de cuatro hijos y la primera mujer agricultora de su comunidad en unirse a QUETZ. "Antes dependíamos del maíz, ahora diversificamos con cacao y aguacate". Sus hijos van a la escuela gracias al ingreso estable que genera.',
    storyDe: 'María ist Mutter von vier Kindern und die erste Bäuerin in ihrer Gemeinde, die sich QUETZ angeschlossen hat. "Früher waren wir vom Mais abhängig, jetzt diversifizieren wir mit Kakao und Avocado". Ihre Kinder gehen dank des stabilen Einkommens, das sie erwirtschaftet, zur Schule.',
    storyEn: 'María is a mother of four children and the first female farmer in her community to join QUETZ. "Before we depended on corn, now we diversify with cacao and avocado." Her children go to school thanks to the stable income she generates.',
    storyFr: 'María est mère de quatre enfants et la première agricultrice de sa communauté à rejoindre QUETZ. "Avant, nous dépendions du maïs, maintenant nous diversifions avec le cacao et l\'avocat". Ses enfants vont à l\'école grâce au revenu stable qu\'elle génère.',
    storyAr: 'ماريا أم لأربعة أطفال وأول مزارعة في مجتمعها تنضم إلى QUETZ. "كنا نعتمد على الذرة من قبل، والآن ننوع بالكاكاو والأفوكادو". يذهب أطفالها إلى المدرسة بفضل الدخل الثابت الذي تولده.',
    payments: [
      { date: '2025-11-15', amountEur: 150, concept: 'Plantación nuevos árboles' },
      { date: '2025-12-15', amountEur: 165, concept: 'Mantenimiento diciembre' },
      { date: '2026-01-15', amountEur: 175, concept: 'Mantenimiento enero' },
    ],
  },
  {
    id: 'farmer-3',
    name: 'Don Carlos López',
    photoUrl: '/photos/farmer-carlos.jpg',
    location: 'Teculután, Zacapa',
    storyEs: 'Carlos es experto en caoba y cedro. A sus 58 años, transmite sus conocimientos a los jóvenes de la aldea. "Cada árbol que planto es un mensaje para mis nietos: cuiden esta tierra". QUETZ le permite enseñar mientras trabaja.',
    storyDe: 'Carlos ist Experte für Mahagoni und Zeder. Mit 58 Jahren gibt er sein Wissen an die Jugend des Dorfes weiter. "Jeder Baum, den ich pflanze, ist eine Botschaft an meine Enkel: Kümmert euch um dieses Land." QUETZ ermöglicht es ihm, zu lehren, während er arbeitet.',
    storyEn: 'Carlos is an expert in mahogany and cedar. At 58, he passes on his knowledge to the youth of the village. "Every tree I plant is a message to my grandchildren: take care of this land." QUETZ allows him to teach while he works.',
    storyFr: 'Carlos est un expert en acajou et cèdre. À 58 ans, il transmet ses connaissances aux jeunes du village. "Chaque arbre que je plante est un message pour mes petits-enfants: prenez soin de cette terre." QUETZ lui permet d\'enseigner tout en travaillant.',
    storyAr: 'كارلوس خبير في الماهوجني والأرز. في عمر 58 عاماً، ينقل معرفته لشباب القرية. "كل شجرة أزرعها هي رسالة لأحفادي: اعتنوا بهذه الأرض." QUETZ يسمح له بالتعليم أثناء العمل.',
    payments: [
      { date: '2025-12-01', amountEur: 200, concept: 'Mantenimiento árboles maderables' },
      { date: '2026-01-01', amountEur: 220, concept: 'Capacitación jóvenes' },
      { date: '2026-02-01', amountEur: 200, concept: 'Mantenimiento febrero' },
    ],
  },
  {
    id: 'farmer-4',
    name: 'Familia Morales',
    photoUrl: '/photos/farmer-morales.jpg',
    location: 'Río Hondo, Zacapa',
    storyEs: 'Los Morales son tres generaciones trabajando juntas: el abuelo Pedro, su hijo Miguel y su nieto Kevin. Cuidan 120 árboles de rambután y naranja. "Es hermoso ver a mi nieto aprender lo que mi padre me enseñó a mí", dice Miguel.',
    storyDe: 'Die Morales sind drei Generationen, die zusammenarbeiten: Großvater Pedro, sein Sohn Miguel und sein Enkel Kevin. Sie pflegen 120 Rambutan- und Orangenbäume. "Es ist schön zu sehen, wie mein Enkel lernt, was mein Vater mir beigebracht hat", sagt Miguel.',
    storyEn: 'The Morales are three generations working together: grandfather Pedro, his son Miguel, and grandson Kevin. They care for 120 rambutan and orange trees. "It\'s beautiful to see my grandson learn what my father taught me," says Miguel.',
    storyFr: 'Les Morales sont trois générations travaillant ensemble: le grand-père Pedro, son fils Miguel et son petit-fils Kevin. Ils s\'occupent de 120 arbres de ramboutan et d\'orange. "C\'est beau de voir mon petit-fils apprendre ce que mon père m\'a enseigné", dit Miguel.',
    storyAr: 'عائلة موراليس هي ثلاثة أجيال تعمل معاً: الجد بيدرو وابنه ميغيل وحفيده كيفن. يعتنون بـ 120 شجرة رامبوتان وبرتقال. "من الجميل رؤية حفيدي يتعلم ما علمني إياه والدي"، يقول ميغيل.',
    payments: [
      { date: '2025-11-01', amountEur: 280, concept: 'Cosecha rambután' },
      { date: '2025-12-01', amountEur: 250, concept: 'Mantenimiento general' },
      { date: '2026-01-01', amountEur: 260, concept: 'Preparación temporada' },
    ],
  },
];

// Initial school project data
const schoolProject = {
  id: 'zacapa',
  name: 'Escuela Jumuzna',
  description: 'La escuela se construirá en la aldea de Jumuzna, Zacapa. Actualmente estamos en la fase de compra del terreno. Tu donación se destina directamente a los materiales y la mano de obra local.',
  goalEur: 50000,
  raisedEur: 5420.20,
  phase: 'terreno',
  history: [
    { date: '2025-09-15', text: 'Inicio del proyecto. Identificación del terreno.', photoUrl: null },
    { date: '2025-11-01', text: 'Primeras donaciones recibidas. Negociación con propietarios.', photoUrl: '/photos/school-planning.jpg' },
    { date: '2026-01-15', text: 'Avance en recaudación: superamos los €5,000.', photoUrl: null },
  ],
};

// Initial stats (synchronized with school funding)
const initialStats = {
  id: 'main',
  totalIncome: 5420.20,
  socialFund: 1626.06,
  treesAdopted: 847,
  treesPlanted: 623,
  familiesHelped: 23,
  co2CapturedKg: 15575,
  schoolFunding: 5420.20,
  schoolProgress: 10.84, // 5420.20 / 50000 * 100
};

async function main() {
  console.log('🌱 Seeding database...');

  // Seed trees with multilingual data
  for (const tree of trees) {
    await prisma.tree.upsert({
      where: { species: tree.species },
      update: {
        nameEs: tree.nameEs, nameDe: tree.nameDe, nameEn: tree.nameEn, nameFr: tree.nameFr, nameAr: tree.nameAr,
        descEs: tree.descEs, descDe: tree.descDe, descEn: tree.descEn, descFr: tree.descFr, descAr: tree.descAr,
        impactEs: tree.impactEs, impactDe: tree.impactDe, impactEn: tree.impactEn, impactFr: tree.impactFr, impactAr: tree.impactAr,
        impactCo2Kg: tree.impactCo2Kg, impactFamilies: tree.impactFamilies, priceBaseEur: tree.priceBaseEur,
        image: tree.image,
      },
      create: tree,
    });
  }
  console.log('✅ Trees seeded (9 species, 5 languages)');

  // Seed farmers
  for (const farmer of farmers) {
    await prisma.farmer.upsert({
      where: { id: farmer.id },
      update: {
        name: farmer.name, photoUrl: farmer.photoUrl, location: farmer.location,
        storyEs: farmer.storyEs, storyDe: farmer.storyDe, storyEn: farmer.storyEn, storyFr: farmer.storyFr, storyAr: farmer.storyAr,
        payments: farmer.payments,
      },
      create: farmer,
    });
  }
  console.log('✅ Farmers seeded (4 families)');

  // Seed school project
  await prisma.schoolProject.upsert({
    where: { id: schoolProject.id },
    update: schoolProject,
    create: schoolProject,
  });
  console.log('✅ School project seeded');

  // Seed initial stats
  await prisma.stats.upsert({
    where: { id: initialStats.id },
    update: initialStats,
    create: initialStats,
  });
  console.log('✅ Stats seeded');

  // Seed test users
  const testPassword = await bcrypt.hash('johndoe123', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      passwordHash: testPassword,
      country: 'Guatemala',
    },
  });

  const testPassword2 = await bcrypt.hash('quetz123', 12);
  await prisma.user.upsert({
    where: { email: 'test@quetz.com' },
    update: { passwordHash: testPassword2 },
    create: {
      email: 'test@quetz.com',
      name: 'Usuario Test',
      passwordHash: testPassword2,
      country: 'Guatemala',
    },
  });
  const testPassword3 = await bcrypt.hash('testquetz123', 12);
  await prisma.user.upsert({
    where: { email: 'testuser@quetz.com' },
    update: { passwordHash: testPassword3 },
    create: {
      email: 'testuser@quetz.com',
      name: 'Test User',
      passwordHash: testPassword3,
      country: 'Guatemala',
    },
  });
  console.log('✅ Test users seeded');

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
