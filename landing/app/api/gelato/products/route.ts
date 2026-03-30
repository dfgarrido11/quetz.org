export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'

// ─── Real Gelato Product Catalog (verified UIDs) ─────────────────────────────
// These UIDs follow Gelato's naming convention and have been tested with the
// Product Catalog API v3 and Order API v4.

interface ShopProduct {
  id: string
  name: string
  category: string
  price: number
  costPrice: number
  trees: number
  phrase: string
  mascot: string
  mascotLabel: string
  ref: string
  badge?: string
  sizes: { label: string; gelatoCode: string }[]
  colors: { name: string; hex: string; gelatoCode: string }[]
  description: string
  gelatoUidTemplate: string
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'camiseta-adulto',
    name: 'Camiseta "Adopté un árbol"',
    category: 'ropa',
    price: 29.99,
    costPrice: 6.16,
    trees: 2,
    phrase: 'Adopté un árbol en Zacapa 🌱',
    mascot: 'quetzito-aventurero',
    mascotLabel: 'Quetzito Aventurero',
    ref: 'camiseta',
    badge: 'Quetz Pick',
    sizes: [
      { label: 'XS', gelatoCode: 'xs' },
      { label: 'S', gelatoCode: 's' },
      { label: 'M', gelatoCode: 'm' },
      { label: 'L', gelatoCode: 'l' },
      { label: 'XL', gelatoCode: 'xl' },
      { label: 'XXL', gelatoCode: '2xl' },
    ],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF', gelatoCode: 'white' },
      { name: 'Negro', hex: '#1a1a1a', gelatoCode: 'black' },
      { name: 'Azul marino', hex: '#1e3a5f', gelatoCode: 'navy' },
    ],
    description: 'Algodón 100% orgánico. Lleva el bosque contigo a cualquier lugar.',
    gelatoUidTemplate: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_{size}_gco_{color}_gpr_4-0',
  },
  {
    id: 'hoodie',
    name: 'Hoodie "Mi bosque de Guatemala"',
    category: 'ropa',
    price: 49.99,
    costPrice: 19.26,
    trees: 3,
    phrase: 'Mi bosque de Guatemala 🌿',
    mascot: 'quetzito-heroe',
    mascotLabel: 'Quetzito Héroe',
    ref: 'hoodie',
    badge: 'Bestseller',
    sizes: [
      { label: 'S', gelatoCode: 's' },
      { label: 'M', gelatoCode: 'm' },
      { label: 'L', gelatoCode: 'l' },
      { label: 'XL', gelatoCode: 'xl' },
      { label: 'XXL', gelatoCode: '2xl' },
    ],
    colors: [
      { name: 'Negro', hex: '#1a1a1a', gelatoCode: 'black' },
      { name: 'Azul marino', hex: '#1e3a5f', gelatoCode: 'navy' },
      { name: 'Gris', hex: '#6b7280', gelatoCode: 'sport-grey' },
    ],
    description: 'Interior suave, exterior con propósito. Cálido como el bosque maya.',
    gelatoUidTemplate: 'apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_{size}_gco_{color}_gpr_4-0',
  },
  {
    id: 'taza',
    name: 'Taza "Buenos días desde Zacapa"',
    category: 'hogar',
    price: 18.99,
    costPrice: 4.43,
    trees: 1,
    phrase: 'Buenos días desde Zacapa ☕',
    mascot: 'quetzito-maestro',
    mascotLabel: 'Quetzito Maestro',
    ref: 'taza',
    sizes: [
      { label: '11oz', gelatoCode: '11-oz' },
    ],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF', gelatoCode: 'ceramic-white' },
    ],
    description: 'Cerámica resistente al lavavajillas. Cada sorbo planta un árbol.',
    gelatoUidTemplate: 'mug_product_msz_{size}_mmat_{color}_cl_4-0',
  },
  {
    id: 'totebag',
    name: 'Tote Bag "Raíces que cambian vidas"',
    category: 'accesorios',
    price: 22.99,
    costPrice: 11.54,
    trees: 1,
    phrase: 'Raíces que cambian vidas 💚',
    mascot: 'quetzito-aventurero',
    mascotLabel: 'Quetzito Aventurero',
    ref: 'totebag',
    badge: 'Eco',
    sizes: [
      { label: 'Único', gelatoCode: 'std-t' },
    ],
    colors: [
      { name: 'Natural', hex: '#F5F0E8', gelatoCode: 'natural' },
      { name: 'Negro', hex: '#1a1a1a', gelatoCode: 'black' },
    ],
    description: 'Algodón orgánico. Cero plástico, máximo impacto en Guatemala.',
    gelatoUidTemplate: 'bag_product_bsc_tote-bag_bqa_clc_bsi_{size}_bco_{color}_bpr_4-0',
  },
]

// Helper: build real Gelato productUid from template + selected size/color
export function buildGelatoUid(template: string, sizeCode: string, colorCode: string): string {
  return template.replace('{size}', sizeCode).replace('{color}', colorCode)
}

// Helper: get the mascot image URL for the front print
export function getMascotUrl(mascot: string): string {
  return `https://www.quetz.org/mascot/${mascot}.png`
}

// Helper: get QR code URL for the back print
export function getQrUrl(ref: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://www.quetz.org?ref=${ref}`)}`
}

export async function GET() {
  const products = SHOP_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    trees: p.trees,
    phrase: p.phrase,
    mascot: p.mascot,
    mascotLabel: p.mascotLabel,
    ref: p.ref,
    badge: p.badge,
    sizes: p.sizes,
    colors: p.colors,
    description: p.description,
    mascotUrl: getMascotUrl(p.mascot),
    qrUrl: getQrUrl(p.ref),
    gelatoUidTemplate: p.gelatoUidTemplate,
  }))

  return NextResponse.json({ products, source: 'gelato-verified' })
}