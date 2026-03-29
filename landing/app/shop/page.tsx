'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  TreePine,
  X,
  Plus,
  Minus,
  Leaf,
  QrCode,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Package,
  ChevronRight,
  Star,
  Heart,
  Globe,
  Truck,
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductColor { nameKey: string; hex: string; gelatoCode: string }

interface ProductSize { label: string; gelatoCode: string }

interface Product {
  id: string
  nameKey: string
  descKey: string
  phraseKey: string
  category: string
  price: number
  trees: number
  mascot: string
  mascotLabel: string
  ref: string
  sizes: ProductSize[]
  colors: ProductColor[]
  badge?: string
  gelatoUidTemplate: string
  mockupFront: string
  mockupBack: string
}

interface CartItem extends Product {
  quantity: number
  selectedSize: ProductSize
  selectedColor: ProductColor
}

// ─── Color key map for display ──────────────────────────────────────────────

const COLOR_KEYS: Record<string, string> = {
  white: 'shop.color.white',
  black: 'shop.color.black',
  navy: 'shop.color.navy',
  'sport-grey': 'shop.color.grey',
  'ceramic-white': 'shop.color.white',
  natural: 'shop.color.natural',
}

// ─── Real Gelato Product Catalog (verified UIDs) ─────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 'camiseta-adulto',
    nameKey: 'shop.prod.camiseta.name',
    descKey: 'shop.prod.camiseta.desc',
    phraseKey: 'shop.prod.camiseta.phrase',
    category: 'ropa',
    price: 29.99,
    trees: 2,
    mascot: 'quetzito-aventurero',
    mascotLabel: 'Quetzito Aventurero',
    ref: 'camiseta',
    badge: 'Quetz Pick',
    mockupFront: '/shop-mockups/mockup-camiseta.png',
    mockupBack: '/shop-mockups/mockup-camiseta-back.png',
    sizes: [
      { label: 'XS', gelatoCode: 'xs' },
      { label: 'S', gelatoCode: 's' },
      { label: 'M', gelatoCode: 'm' },
      { label: 'L', gelatoCode: 'l' },
      { label: 'XL', gelatoCode: 'xl' },
      { label: 'XXL', gelatoCode: '2xl' },
    ],
    colors: [
      { nameKey: 'shop.color.white', hex: '#FFFFFF', gelatoCode: 'white' },
      { nameKey: 'shop.color.black', hex: '#1a1a1a', gelatoCode: 'black' },
      { nameKey: 'shop.color.navy', hex: '#1e3a5f', gelatoCode: 'navy' },
    ],
    gelatoUidTemplate: 'apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_{size}_gco_{color}_gpr_4-0',
  },
  {
    id: 'hoodie',
    nameKey: 'shop.prod.hoodie.name',
    descKey: 'shop.prod.hoodie.desc',
    phraseKey: 'shop.prod.hoodie.phrase',
    category: 'ropa',
    price: 49.99,
    trees: 3,
    mascot: 'quetzito-heroe',
    mascotLabel: 'Quetzito Héroe',
    ref: 'hoodie',
    badge: 'Bestseller',
    mockupFront: '/shop-mockups/mockup-hoodie.png',
    mockupBack: '/shop-mockups/mockup-hoodie-back.png',
    sizes: [
      { label: 'S', gelatoCode: 's' },
      { label: 'M', gelatoCode: 'm' },
      { label: 'L', gelatoCode: 'l' },
      { label: 'XL', gelatoCode: 'xl' },
      { label: 'XXL', gelatoCode: '2xl' },
    ],
    colors: [
      { nameKey: 'shop.color.black', hex: '#1a1a1a', gelatoCode: 'black' },
      { nameKey: 'shop.color.navy', hex: '#1e3a5f', gelatoCode: 'navy' },
      { nameKey: 'shop.color.grey', hex: '#6b7280', gelatoCode: 'sport-grey' },
    ],
    gelatoUidTemplate: 'apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_{size}_gco_{color}_gpr_4-0',
  },
  {
    id: 'taza',
    nameKey: 'shop.prod.taza.name',
    descKey: 'shop.prod.taza.desc',
    phraseKey: 'shop.prod.taza.phrase',
    category: 'hogar',
    price: 18.99,
    trees: 1,
    mascot: 'quetzito-maestro',
    mascotLabel: 'Quetzito Maestro',
    ref: 'taza',
    mockupFront: '/shop-mockups/mockup-taza.png',
    mockupBack: '/shop-mockups/mockup-taza.png',
    sizes: [
      { label: '11oz', gelatoCode: '11-oz' },
    ],
    colors: [
      { nameKey: 'shop.color.white', hex: '#FFFFFF', gelatoCode: 'ceramic-white' },
    ],
    gelatoUidTemplate: 'mug_product_msz_{size}_mmat_{color}_cl_4-0',
  },
  {
    id: 'totebag',
    nameKey: 'shop.prod.totebag.name',
    descKey: 'shop.prod.totebag.desc',
    phraseKey: 'shop.prod.totebag.phrase',
    category: 'accesorios',
    price: 22.99,
    trees: 1,
    mascot: 'quetzito-aventurero',
    mascotLabel: 'Quetzito Aventurero',
    ref: 'totebag',
    badge: 'Eco',
    mockupFront: '/shop-mockups/mockup-totebag.png',
    mockupBack: '/shop-mockups/mockup-totebag.png',
    sizes: [
      { label: 'shop.size.oneSize', gelatoCode: 'std-t' },
    ],
    colors: [
      { nameKey: 'shop.color.natural', hex: '#F5F0E8', gelatoCode: 'natural' },
      { nameKey: 'shop.color.black', hex: '#1a1a1a', gelatoCode: 'black' },
    ],
    gelatoUidTemplate: 'bag_product_bsc_tote-bag_bqa_clc_bsi_{size}_bco_{color}_bpr_4-0',
  },
]

const CATEGORIES = ['todos', 'ropa', 'hogar', 'accesorios']

const CATEGORY_KEYS: Record<string, string> = {
  todos: 'shop.catAll',
  ropa: 'shop.catClothing',
  hogar: 'shop.catHome',
  accesorios: 'shop.catAccessories',
}

const BADGE_STYLES: Record<string, string> = {
  'Bestseller': 'bg-[#1b4332] text-white',
  'Quetz Pick': 'bg-[#95d5b2] text-[#1b4332]',
  'Eco': 'bg-emerald-100 text-emerald-800',
  'Kids': 'bg-sky-100 text-sky-800',
  'Nuevo': 'bg-orange-100 text-orange-800',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildGelatoUid(template: string, size: string, color: string): string {
  return template.replace('{size}', size).replace('{color}', color)
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onAddToCart, t }: { product: Product; onAddToCart: (item: CartItem) => void; t: (key: string) => string }) {
  const defaultSizeIdx = product.sizes.length > 2 ? 2 : 0
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[defaultSizeIdx])
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0])
  const [added, setAdded] = useState(false)
  const [showBack, setShowBack] = useState(false)
  const [qrSrc, setQrSrc] = useState('')

  useEffect(() => {
    const qrUrl = encodeURIComponent(`https://www.quetz.org?ref=${product.ref}`)
    setQrSrc(`/api/qr?url=${qrUrl}&size=180`)
  }, [product.ref])

  const handleAdd = () => {
    onAddToCart({ ...product, quantity: 1, selectedSize, selectedColor })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const productName = t(product.nameKey)
  const treesText = product.trees > 1 ? t('shop.trees') : t('shop.tree')
  const adoptedText = product.trees > 1 ? t('shop.treesAdopted') : t('shop.treeAdopted')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col"
    >
      {/* ── Image area ── */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden" style={{ paddingBottom: '110%' }}>
        <div className="absolute inset-0">
          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[product.badge] ?? 'bg-gray-100 text-gray-700'}`}>
              {product.badge === 'Bestseller' && <Star className="w-3 h-3 inline mr-1" />}
              {product.badge}
            </div>
          )}

          {/* Trees badge — prominent */}
          <div className="absolute top-3 right-3 z-10 bg-[#dcfce7] text-[#1b4332] text-[11px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <TreePine className="w-3.5 h-3.5" />
            +{product.trees} {treesText}
          </div>

          {/* QR back overlay — appears on hover/click */}
          <AnimatePresence>
            {showBack && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 z-20"
              >
                <Image
                  src={product.mockupBack}
                  alt={`${productName} — QR`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1b4332] to-transparent p-4 pt-10">
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 text-[#95d5b2]" />
                    <p className="text-white text-xs font-medium">{t('shop.scanAdopt')}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product mockup — realistic product photo */}
          <Image
            src={product.mockupFront}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
            priority={product.id === 'camiseta-adulto'}
          />

          {/* Toggle front/back button — bottom */}
          <button
            onMouseEnter={() => setShowBack(true)}
            onMouseLeave={() => setShowBack(false)}
            onClick={() => setShowBack(v => !v)}
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-t from-black/40 to-transparent text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <QrCode className="w-3.5 h-3.5" />
            {showBack ? t('shop.viewFront') : t('shop.viewBack')}
          </button>
        </div>
      </div>

      {/* ── Product info ── */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{productName}</h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t(product.descKey)}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-gray-900">{product.price.toFixed(2)}€</span>
          <span className="text-xs text-gray-400">{t('shop.plusShipping')}</span>
        </div>

        {/* ── TREE IMPACT — prominent ── */}
        <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 bg-[#1b4332] rounded-lg flex items-center justify-center shrink-0">
            <TreePine className="w-4 h-4 text-[#95d5b2]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1b4332]">
              🌱 {t('shop.includes')} {product.trees} {adoptedText}
            </p>
            <p className="text-[10px] text-[#2d6a4f]/70">{t('shop.plantedIn')} 🇬🇹</p>
          </div>
        </div>

        {/* Color selector */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 uppercase tracking-wide w-12 shrink-0">{t('shop.color')}</span>
            <div className="flex gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.gelatoCode}
                  onClick={() => setSelectedColor(c)}
                  title={t(c.nameKey)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selectedColor.gelatoCode === c.gelatoCode
                      ? 'border-[#1b4332] scale-125 shadow-sm'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <span className="text-[11px] text-gray-500 ml-1 self-center">{t(selectedColor.nameKey)}</span>
            </div>
          </div>
        )}

        {/* Size selector */}
        {product.sizes.length > 1 && (
          <div className="flex items-start gap-2">
            <span className="text-[11px] text-gray-400 uppercase tracking-wide w-12 shrink-0 pt-1">{t('shop.size')}</span>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2 py-0.5 text-xs font-medium rounded border transition-all ${
                    selectedSize.label === s.label
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#1b4332] hover:text-[#1b4332]'
                  }`}
                >
                  {s.label.startsWith('shop.') ? t(s.label) : s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.97 }}
          className={`mt-auto w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            added
              ? 'bg-[#95d5b2] text-[#1b4332]'
              : 'bg-[#1b4332] text-white hover:bg-[#2d6a4f]'
          }`}
        >
          {added ? (
            <><CheckCircle className="w-4 h-4" /> {t('shop.addedToCart')}</>
          ) : (
            <><ShoppingBag className="w-4 h-4" /> {t('shop.addToCart')}</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────

function CartSidebar({
  items,
  onClose,
  onUpdateQty,
  onRemove,
  onCheckout,
  loading,
  t,
}: {
  items: CartItem[]
  onClose: () => void
  onUpdateQty: (id: string, size: string, delta: number) => void
  onRemove: (id: string, size: string) => void
  onCheckout: () => void
  loading: boolean
  t: (key: string) => string
}) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalTrees = items.reduce((s, i) => s + i.trees * i.quantity, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
    >
      <div className="flex items-center justify-between p-5 border-b">
        <div>
          <h2 className="font-black text-gray-900 text-lg">{t('shop.yourOrder')}</h2>
          <p className="text-sm text-gray-400">{totalItems} {totalItems !== 1 ? t('shop.products') : t('shop.product')}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* ── Tree impact summary ── */}
      {totalTrees > 0 && (
        <div className="mx-4 mt-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 bg-[#1b4332] rounded-lg flex items-center justify-center shrink-0">
              <TreePine className="w-4 h-4 text-[#95d5b2]" />
            </div>
            <div>
              <p className="text-sm text-[#1b4332] font-bold">
                🌱 {totalTrees} {totalTrees > 1 ? t('shop.treesAdopted') : t('shop.treeAdopted')}
              </p>
              <p className="text-[10px] text-[#2d6a4f]/70">{t('shop.willBePlanted')}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: Math.min(totalTrees, 12) }).map((_, i) => (
              <div key={i} className="text-sm">🌳</div>
            ))}
            {totalTrees > 12 && <span className="text-[10px] text-[#2d6a4f] self-center">+{totalTrees - 12} {t('shop.more')}</span>}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 mt-2">
        {items.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">{t('shop.emptyCart')}</p>
            <p className="text-sm mt-1">{t('shop.emptyCartSub')} 🌳</p>
          </div>
        )}
        {items.map((item) => (
          <div key={`${item.id}-${item.selectedSize.label}`} className="flex gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-1">
              <Image
                src={`/mascot/${item.mascot}.png`}
                alt={t(item.nameKey)}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 line-clamp-1">{t(item.nameKey)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.selectedSize.label.startsWith('shop.') ? t(item.selectedSize.label) : item.selectedSize.label} · {t(item.selectedColor.nameKey)}
              </p>
              <p className="text-[10px] text-[#2d6a4f] font-medium mt-0.5">
                🌱 +{item.trees * item.quantity} {item.trees * item.quantity > 1 ? t('shop.trees') : t('shop.tree')}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateQty(item.id, item.selectedSize.label, -1)}
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-gray-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.selectedSize.label, 1)}
                    className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center hover:bg-[#2d6a4f]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-black text-gray-900">{(item.price * item.quantity).toFixed(2)}€</span>
              </div>
            </div>
            <button onClick={() => onRemove(item.id, item.selectedSize.label)} className="shrink-0 p-1 text-gray-300 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="p-5 border-t space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">{t('shop.subtotal')}</span>
            <span className="font-black text-xl text-gray-900">{total.toFixed(2)}€</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Leaf className="w-3 h-3 text-[#2d6a4f]" />
            {t('shop.shippingNote')}
          </p>
          <button
            onClick={onCheckout}
            disabled={loading}
            className="w-full bg-[#1b4332] text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 hover:bg-[#2d6a4f] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CreditCard className="w-5 h-5" /> {t('shop.payStripe')}</>
            )}
          </button>
          <p className="text-[10px] text-center text-gray-400">
            🔒 {t('shop.securePayment')}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { t } = useLanguage()
  const [category, setCategory] = useState('todos')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') setSuccess(true)
    }
  }, [])

  const filtered = category === 'todos' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category)
  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0)
  const totalCartTrees = cart.reduce((s, i) => s + i.trees * i.quantity, 0)

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const key = `${item.id}-${item.selectedSize.label}`
      const existing = prev.find((i) => `${i.id}-${i.selectedSize.label}` === key)
      if (existing) {
        return prev.map((i) => `${i.id}-${i.selectedSize.label}` === key ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, item]
    })
    setCartOpen(true)
  }, [])

  const updateQty = (id: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => `${i.id}-${i.selectedSize.label}` === `${id}-${size}` ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (id: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.selectedSize.label === size)))
  }

  const handleCheckout = async () => {
    if (!cart.length) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            id: i.id,
            name: t(i.nameKey),
            price: i.price,
            trees: i.trees,
            quantity: i.quantity,
            size: i.selectedSize.label.startsWith('shop.') ? t(i.selectedSize.label) : i.selectedSize.label,
            color: t(i.selectedColor.nameKey),
            ref: i.ref,
            gelatoProductUid: buildGelatoUid(
              i.gelatoUidTemplate,
              i.selectedSize.gelatoCode,
              i.selectedColor.gelatoCode
            ),
            mascot: i.mascot,
            imageUrl: `https://www.quetz.org/mascot/${i.mascot}.png`,
          })),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || t('shop.errorPayment'))
      }
    } catch {
      alert(t('shop.errorConnection'))
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Stripe success banner ── */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#1b4332] text-white px-4 py-4 flex flex-col items-center justify-center gap-1 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#95d5b2]" />
              <span className="font-bold">{t('shop.orderConfirmed')} 🎉</span>
              <button onClick={() => setSuccess(false)} className="ml-4 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#95d5b2]">
              {t('shop.orderConfirmedSub')} 🌱
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] text-white pt-24 pb-20 px-4">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #95d5b2 0%, transparent 50%), radial-gradient(circle at 80% 20%, #40916c 0%, transparent 40%)' }} />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm mb-5">
              <Sparkles className="w-4 h-4 text-[#95d5b2]" />
              {t('shop.heroBadge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-4">
              {t('shop.heroTitle1')}<br />
              <span className="text-[#95d5b2]">{t('shop.heroTitle2')}</span>
            </h1>
            <p className="text-white/75 text-lg mb-6 max-w-lg">
              {t('shop.heroSubtitle')}
            </p>

            {/* Impact stats */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {[
                { value: '1–3', label: t('shop.treesPerProduct'), icon: TreePine },
                { value: '100%', label: t('shop.organicCotton'), icon: Leaf },
                { value: '🌍', label: t('shop.globalShipping'), icon: Globe },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <div className="text-xl font-black text-[#95d5b2]">{value}</div>
                  <div className="text-[10px] text-white/60 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {[
                { icon: TreePine, text: t('shop.realTreesPlanted') },
                { icon: Package, text: t('shop.globalShippingGelato') },
                { icon: Leaf, text: t('shop.ecoMaterials') },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  <Icon className="w-4 h-4 text-[#95d5b2]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Product showcase — hero */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 shrink-0">
            <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
              <Image
                src="/shop-mockups/mockup-camiseta.png"
                alt={t('shop.prod.camiseta.name')}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 288px, 384px"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 md:w-40 md:h-40 z-20 rounded-xl overflow-hidden shadow-xl border-2 border-white/30">
              <Image
                src="/shop-mockups/mockup-hoodie.png"
                alt={t('shop.prod.hoodie.name')}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <div className="absolute -top-2 -right-2 w-24 h-24 md:w-28 md:h-28 z-20 rounded-xl overflow-hidden shadow-xl border-2 border-white/30">
              <Image
                src="/shop-mockups/mockup-taza.png"
                alt={t('shop.prod.taza.name')}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category nav ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`relative px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'text-[#1b4332]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t(CATEGORY_KEYS[cat])}
                {category === cat && (
                  <motion.div
                    layoutId="cat-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4332] rounded-full"
                  />
                )}
              </button>
            ))}
            <div className="ml-auto text-xs text-gray-400 whitespace-nowrap shrink-0 pr-4">
              {filtered.length} {filtered.length !== 1 ? t('shop.products') : t('shop.product')}
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating cart ── */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1b4332] text-white rounded-full px-5 py-3.5 shadow-xl hover:bg-[#2d6a4f] transition-all flex items-center gap-2.5 font-semibold"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-sm">{t('shop.cart')}</span>
        {totalCartItems > 0 && (
          <span className="bg-[#95d5b2] text-[#1b4332] text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
            {totalCartItems > 9 ? '9+' : totalCartItems}
          </span>
        )}
        {totalCartTrees > 0 && (
          <span className="text-[10px] text-[#95d5b2] font-medium">
            🌱{totalCartTrees}
          </span>
        )}
      </button>

      {/* ── Product grid ── */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} t={t} />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* ── Impact section ── */}
      <section className="border-t border-gray-100 bg-[#f0fdf4] py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-black text-[#1b4332] mb-2">🌱 {t('shop.impactTitle')}</h2>
          <p className="text-[#2d6a4f]/70 mb-10">{t('shop.impactSubtitle')}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { nameKey: 'shop.prod.camiseta.name', trees: 2, emoji: '👕' },
              { nameKey: 'shop.prod.hoodie.name', trees: 3, emoji: '🧥' },
              { nameKey: 'shop.prod.taza.name', trees: 1, emoji: '☕' },
              { nameKey: 'shop.prod.totebag.name', trees: 1, emoji: '👜' },
            ].map(({ nameKey, trees, emoji }) => (
              <div key={nameKey} className="bg-white rounded-2xl p-5 shadow-sm border border-[#bbf7d0]">
                <div className="text-3xl mb-2">{emoji}</div>
                <p className="font-bold text-[#1b4332] text-sm">{t(nameKey).split('"')[0].trim()}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TreePine className="w-4 h-4 text-[#2d6a4f]" />
                  <span className="text-lg font-black text-[#1b4332]">{trees}</span>
                  <span className="text-xs text-[#2d6a4f]/70">{trees > 1 ? t('shop.trees') : t('shop.tree')}</span>
                </div>
                <p className="text-[10px] text-[#2d6a4f]/50 mt-1">Zacapa, Guatemala</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#bbf7d0] max-w-lg mx-auto">
            <p className="text-sm text-[#2d6a4f] leading-relaxed" dangerouslySetInnerHTML={{ __html: t('shop.impactEmail') }} />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-gray-100 bg-gray-50 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">{t('shop.howTitle')}</h2>
          <p className="text-gray-500 text-center mb-10">{t('shop.howSubtitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, step: '01', text: t('shop.step1'), sub: t('shop.step1sub') },
              { icon: CreditCard, step: '02', text: t('shop.step2'), sub: t('shop.step2sub') },
              { icon: TreePine, step: '03', text: t('shop.step3'), sub: t('shop.step3sub') },
              { icon: Package, step: '04', text: t('shop.step4'), sub: t('shop.step4sub') },
            ].map(({ icon: Icon, step, text, sub }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1b4332] flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#95d5b2]" />
                </div>
                <div className="text-xs text-gray-400 font-mono mb-1">{step}</div>
                <p className="font-bold text-gray-900 text-sm">{text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QR explanation ── */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="shrink-0 w-28 h-28 bg-[#f0fdf4] rounded-3xl flex items-center justify-center shadow-inner">
            <QrCode className="w-14 h-14 text-[#1b4332]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-2">{t('shop.qrTitle')}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t('shop.qrText') }} />
            <div className="flex flex-wrap gap-4 text-sm text-[#2d6a4f]">
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                {t('shop.qrFeature1')}
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                {t('shop.qrFeature2')}
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                {t('shop.qrFeature3')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer nav ── */}
      <div className="py-6 px-4 text-center border-t border-gray-100">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#2d6a4f] hover:text-[#1b4332] font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('shop.backHome')}
        </Link>
      </div>

      {/* ── Cart sidebar ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <CartSidebar
              items={cart}
              onClose={() => setCartOpen(false)}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onCheckout={handleCheckout}
              loading={checkoutLoading}
              t={t}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
