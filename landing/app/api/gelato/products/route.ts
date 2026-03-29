import { NextResponse } from 'next/server'

const GELATO_API_KEY = process.env.GELATO_API_KEY || ''
const GELATO_STORE_ID = process.env.GELATO_STORE_ID || ''

// Static product catalog — matches Gelato product IDs
// Update these IDs with real Gelato catalog UIDs from your store
export const GELATO_PRODUCTS = [
  {
    id: 'camiseta-adulto',
    name: 'Camiseta "Adopté un árbol"',
    gelatoProductUid: 'classic-unisex-crewneck-t-shirt',
    category: 'ropa',
    price: 29.99,
    trees: 2,
    phrase: 'Adopté un árbol en Zacapa 🌱',
    mascot: 'quetzito-aventurero',
    ref: 'camiseta',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde bosque', hex: '#2d6a4f' },
      { name: 'Negro', hex: '#1a1a1a' },
    ],
    description: 'Lleva el bosque contigo. Algodón 100% orgánico, fabricado con amor por familias guatemaltecas.',
  },
  {
    id: 'hoodie',
    name: 'Hoodie "Mi bosque de Guatemala"',
    gelatoProductUid: 'unisex-premium-hoodie',
    category: 'ropa',
    price: 49.99,
    trees: 3,
    phrase: 'Mi bosque de Guatemala 🌿',
    mascot: 'quetzito-heroe',
    ref: 'hoodie',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Verde musgo', hex: '#1b4332' },
      { name: 'Gris piedra', hex: '#6b7280' },
      { name: 'Negro', hex: '#1a1a1a' },
    ],
    description: 'Cálido como el bosque maya. Interior suave, exterior con propósito.',
  },
  {
    id: 'taza',
    name: 'Taza "Buenos días desde Zacapa"',
    gelatoProductUid: 'mug-11oz',
    category: 'hogar',
    price: 18.99,
    trees: 1,
    phrase: 'Buenos días desde Zacapa ☕',
    mascot: 'quetzito-maestro',
    ref: 'taza',
    sizes: ['11oz', '15oz'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde', hex: '#95d5b2' },
    ],
    description: 'Cada sorbo planta un árbol. Cerámica resistente al lavavajillas.',
  },
  {
    id: 'totebag',
    name: 'Tote Bag "Raíces que cambian vidas"',
    gelatoProductUid: 'tote-bag-natural',
    category: 'accesorios',
    price: 22.99,
    trees: 1,
    phrase: 'Raíces que cambian vidas 💚',
    mascot: 'quetzito-aventurero',
    ref: 'totebag',
    sizes: ['Único'],
    colors: [
      { name: 'Natural', hex: '#F5F0E8' },
      { name: 'Verde', hex: '#2d6a4f' },
    ],
    description: 'Algodón orgánico. Cero plástico, máximo impacto.',
  },
  {
    id: 'gorra',
    name: 'Gorra QUETZ x Quetzito',
    gelatoProductUid: 'embroidered-dad-hat',
    category: 'accesorios',
    price: 24.99,
    trees: 1,
    phrase: 'QUETZ.ORG',
    mascot: 'quetzito-heroe',
    ref: 'gorra',
    sizes: ['Única (ajustable)'],
    colors: [
      { name: 'Verde bosque', hex: '#1b4332' },
      { name: 'Beige', hex: '#D4C5A9' },
      { name: 'Negro', hex: '#1a1a1a' },
    ],
    description: 'Logo bordado. Protección solar, estilo con propósito.',
  },
  {
    id: 'cuaderno-bambu',
    name: 'Cuaderno Bambú "Historias de Zacapa"',
    gelatoProductUid: 'notebook-a5-hardcover',
    category: 'hogar',
    price: 19.99,
    trees: 1,
    phrase: 'Historias de Zacapa',
    mascot: 'quetzito-maestro',
    ref: 'cuaderno',
    sizes: ['A5'],
    colors: [
      { name: 'Bambú natural', hex: '#C8A96E' },
    ],
    description: 'Tapa de bambú sostenible. 192 páginas de papel reciclado.',
  },
  {
    id: 'camiseta-ninos',
    name: 'Camiseta Niños "Futuro guardián"',
    gelatoProductUid: 'kids-classic-t-shirt',
    category: 'ropa',
    price: 22.99,
    trees: 1,
    phrase: 'Futuro guardián del bosque',
    mascot: 'quetzito-aventurero',
    ref: 'camiseta-ninos',
    sizes: ['3-4', '5-6', '7-8', '9-10', '11-12', '13-14'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde menta', hex: '#95d5b2' },
    ],
    description: 'Los niños también pueden cambiar el mundo. 100% algodón orgánico suave.',
  },
]

export async function GET() {
  // Try to fetch live catalog from Gelato (fallback to static)
  try {
    if (GELATO_API_KEY && GELATO_STORE_ID) {
      const res = await fetch(
        `https://ecommerce.gelatoapis.com/v1/stores/${GELATO_STORE_ID}/products`,
        { headers: { 'X-API-KEY': GELATO_API_KEY }, next: { revalidate: 3600 } }
      )
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ products: data.products, source: 'gelato' })
      }
    }
  } catch {
    // Fall through to static catalog
  }

  return NextResponse.json({ products: GELATO_PRODUCTS, source: 'static' })
}
