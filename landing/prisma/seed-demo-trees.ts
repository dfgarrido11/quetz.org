/**
 * Seed script: Demo trees with GPS coordinates in Zacapa, Guatemala
 * Run: npx ts-node -P tsconfig.json prisma/seed-demo-trees.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_TREES = [
  {
    species: "cafe",
    nameEs: "Cafeto",
    nameDe: "Kaffeestrauch",
    nameEn: "Coffee Tree",
    nameFr: "Caféier",
    nameAr: "شجرة القهوة",
    descEs: "El cafeto es la especie más cultivada en la región de Zacapa. Produce el café Arabica de altura que da sustento a cientos de familias en las laderas de la Sierra de las Minas.",
    descDe: "Der Kaffeestrauch ist die am häufigsten angebaute Pflanzenart in der Region Zacapa. Er produziert hochwertigen Arabica-Kaffee, der Hunderten von Familien an den Hängen der Sierra de las Minas den Lebensunterhalt sichert.",
    descEn: "The coffee tree is the most cultivated species in the Zacapa region. It produces high-altitude Arabica coffee that sustains hundreds of families on the slopes of the Sierra de las Minas.",
    descFr: "Le caféier est l'espèce la plus cultivée dans la région de Zacapa. Il produit du café Arabica de haute altitude qui fait vivre des centaines de familles sur les pentes de la Sierra de las Minas.",
    impactEs: "Cada árbol produce ~2 kg de café al año, generando ingresos directos para la familia guardiana.",
    impactDe: "Jeder Baum produziert ~2 kg Kaffee pro Jahr und generiert direkte Einnahmen für die Hüterfamilie.",
    impactEn: "Each tree produces ~2 kg of coffee per year, generating direct income for the guardian family.",
    impactFr: "Chaque arbre produit ~2 kg de café par an, générant des revenus directs pour la famille gardienne.",
    impactCo2Kg: 22.0,
    impactFamilies: 0.1,
    priceBaseEur: 25.0,
    image: "/images/trees/cafe.jpg",
    active: true,
    latitude: 14.9712,
    longitude: -89.8634,
    plotArea: "Sektor A — Finca Jumuzna, Zacapa",
  },
  {
    species: "aguacate",
    nameEs: "Aguacate",
    nameDe: "Avocadobaum",
    nameEn: "Avocado Tree",
    nameFr: "Avocatier",
    nameAr: "شجرة الأفوكادو",
    descEs: "El aguacate Hass cultivado en Zacapa es reconocido por su sabor excepcional. Los árboles generan ingresos significativos y nutren la biodiversidad local con su densa copa.",
    descDe: "Die in Zacapa angebaute Hass-Avocado ist für ihren außergewöhnlichen Geschmack bekannt. Die Bäume generieren erhebliche Einnahmen und nähren die lokale Biodiversität mit ihrem dichten Blätterdach.",
    descEn: "Hass avocado grown in Zacapa is recognized for its exceptional flavor. The trees generate significant income and nurture local biodiversity with their dense canopy.",
    descFr: "L'avocat Hass cultivé à Zacapa est reconnu pour sa saveur exceptionnelle. Les arbres génèrent des revenus significatifs et nourrissent la biodiversité locale avec leur dense canopée.",
    impactEs: "Produce hasta 200 aguacates por temporada, con mercado directo en Ciudad de Guatemala.",
    impactDe: "Produziert bis zu 200 Avocados pro Saison mit direktem Markt in Guatemala-Stadt.",
    impactEn: "Produces up to 200 avocados per season, with direct market in Guatemala City.",
    impactFr: "Produit jusqu'à 200 avocats par saison, avec marché direct à Guatemala City.",
    impactCo2Kg: 35.0,
    impactFamilies: 0.15,
    priceBaseEur: 30.0,
    image: "/images/trees/aguacate.jpg",
    active: true,
    latitude: 14.9698,
    longitude: -89.8651,
    plotArea: "Sektor B — Finca Jumuzna, Zacapa",
  },
  {
    species: "caoba",
    nameEs: "Caoba",
    nameDe: "Mahagonibaum",
    nameEn: "Mahogany Tree",
    nameFr: "Acajou",
    nameAr: "شجرة الماهوغاني",
    descEs: "La caoba es un árbol nativo de Guatemala declarado patrimonio natural. De crecimiento lento pero extraordinariamente valioso, cada árbol es una inversión en el futuro del bosque tropical.",
    descDe: "Mahagoni ist ein in Guatemala heimischer Baum, der als Naturerbe eingestuft ist. Langsam wachsend, aber außerordentlich wertvoll, ist jeder Baum eine Investition in die Zukunft des tropischen Waldes.",
    descEn: "Mahogany is a tree native to Guatemala declared a natural heritage. Slow-growing but extraordinarily valuable, each tree is an investment in the future of the tropical forest.",
    descFr: "L'acajou est un arbre originaire du Guatemala déclaré patrimoine naturel. À croissance lente mais extraordinairement précieux, chaque arbre est un investissement dans l'avenir de la forêt tropicale.",
    impactEs: "Árbol centenario que secuestra más de 500 kg de CO₂ durante su vida útil.",
    impactDe: "Jahrhundertealter Baum, der mehr als 500 kg CO₂ über seine Lebensdauer bindet.",
    impactEn: "Centennial tree that sequesters over 500 kg of CO₂ during its lifetime.",
    impactFr: "Arbre centenaire qui séquestre plus de 500 kg de CO₂ au cours de sa vie.",
    impactCo2Kg: 18.0,
    impactFamilies: 0.08,
    priceBaseEur: 40.0,
    image: "/images/trees/caoba.jpg",
    active: true,
    latitude: 14.9725,
    longitude: -89.8618,
    plotArea: "Sektor C — Reserva Natural Zacapa",
  },
  {
    species: "limon",
    nameEs: "Limonero",
    nameDe: "Zitronenbaum",
    nameEn: "Lemon Tree",
    nameFr: "Citronnier",
    nameAr: "شجرة الليمون",
    descEs: "El limonero persa es una de las especies más productivas de la región. Los frutos se exportan a mercados europeos y las hojas se usan en medicina tradicional guatemalteca.",
    descDe: "Der persische Zitronenbaum ist eine der produktivsten Arten der Region. Die Früchte werden in europäische Märkte exportiert und die Blätter werden in der guatemaltekischen Volksmedizin verwendet.",
    descEn: "The Persian lemon tree is one of the most productive species in the region. The fruits are exported to European markets and the leaves are used in traditional Guatemalan medicine.",
    descFr: "Le citronnier persan est l'une des espèces les plus productives de la région. Les fruits sont exportés vers les marchés européens et les feuilles sont utilisées en médecine traditionnelle guatémaltèque.",
    impactEs: "Un árbol adulto produce hasta 600 limones por año con dos cosechas.",
    impactDe: "Ein ausgewachsener Baum produziert mit zwei Ernten bis zu 600 Zitronen pro Jahr.",
    impactEn: "An adult tree produces up to 600 lemons per year with two harvests.",
    impactFr: "Un arbre adulte produit jusqu'à 600 citrons par an avec deux récoltes.",
    impactCo2Kg: 20.0,
    impactFamilies: 0.12,
    priceBaseEur: 25.0,
    image: "/images/trees/limon.jpg",
    active: true,
    latitude: 14.9741,
    longitude: -89.8672,
    plotArea: "Sektor D — Cooperativa Agrícola Zacapa",
  },
  {
    species: "mango",
    nameEs: "Mango",
    nameDe: "Mangobaum",
    nameEn: "Mango Tree",
    nameFr: "Manguier",
    nameAr: "شجرة المانجو",
    descEs: "El mango Tommy Atkins cultivado en las tierras cálidas de Zacapa es famoso por su tamaño y dulzura. Los árboles maduros producen entre 100 y 200 kg de fruta por temporada.",
    descDe: "Die in den warmen Böden von Zacapa angebaute Tommy-Atkins-Mango ist für ihre Größe und Süße bekannt. Ausgereifte Bäume produzieren 100 bis 200 kg Früchte pro Saison.",
    descEn: "Tommy Atkins mango grown in the warm soils of Zacapa is famous for its size and sweetness. Mature trees produce between 100 and 200 kg of fruit per season.",
    descFr: "La mangue Tommy Atkins cultivée dans les terres chaudes de Zacapa est réputée pour sa taille et sa douceur. Les arbres matures produisent entre 100 et 200 kg de fruits par saison.",
    impactEs: "Cada árbol da sombra y alimento a la familia guardiana mientras estabiliza el suelo.",
    impactDe: "Jeder Baum spendet der Hüterfamilie Schatten und Nahrung und stabilisiert dabei den Boden.",
    impactEn: "Each tree provides shade and food for the guardian family while stabilizing the soil.",
    impactFr: "Chaque arbre procure ombre et nourriture à la famille gardienne tout en stabilisant le sol.",
    impactCo2Kg: 28.0,
    impactFamilies: 0.1,
    priceBaseEur: 25.0,
    image: "/images/trees/mango.jpg",
    active: true,
    latitude: 14.9756,
    longitude: -89.8609,
    plotArea: "Sektor E — Finca Las Delicias, Zacapa",
  },
];

async function main() {
  console.log("🌳 Seeding demo trees with GPS coordinates...");

  for (const tree of DEMO_TREES) {
    const result = await prisma.tree.upsert({
      where: { species: tree.species },
      update: {
        latitude: tree.latitude,
        longitude: tree.longitude,
        plotArea: tree.plotArea,
        nameDe: tree.nameDe,
        nameEn: tree.nameEn,
        nameFr: tree.nameFr,
        nameAr: tree.nameAr,
        descDe: tree.descDe,
        descEn: tree.descEn,
        descFr: tree.descFr,
        descAr: tree.descAr,
        impactDe: tree.impactDe,
        impactEn: tree.impactEn,
        impactFr: tree.impactFr,
      },
      create: tree,
    });
    console.log(`  ✅ ${result.nameDe} (${result.species}) — GPS: ${result.latitude}, ${result.longitude}`);
  }

  console.log("\n✅ Done. 5 demo trees seeded with Zacapa GPS coordinates.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
