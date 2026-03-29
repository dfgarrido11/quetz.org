'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductColor { name: string; hex: string }

interface Product {
  id: string
  name: string
  gelatoProductUid: string
  category: string
  price: number
  trees: number
  phrase: string
  mascot: string
  ref: string
  sizes: string[]
  colors: ProductColor[]
  description: string
  badge?: string
  mockupUrl: string
  hoverUrl?: string
}

interface CartItem extends Product {
  quantity: number
  selectedSize: string
  selectedColor: ProductColor
}

// ─── Product catalog ──────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
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
    badge: 'Quetz Pick',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde bosque', hex: '#2d6a4f' },
      { name: 'Negro', hex: '#1a1a1a' },
    ],
    description: 'Algodón 100% orgánico. Lleva el bosque contigo a cualquier lugar.',
    mockupUrl: 'https://files.cdn.printful.com/o/upload/product-catalog-img/60/6040cec14e05d_unisex-staple-t-shirt-white-front-6305a5e6dfd78.jpg',
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
    badge: 'Bestseller',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Verde musgo', hex: '#1b4332' },
      { name: 'Gris piedra', hex: '#6b7280' },
      { name: 'Negro', hex: '#1a1a1a' },
    ],
    description: 'Interior suave, exterior con propósito. Cálido como el bosque maya.',
    mockupUrl: 'https://files.cdn.printful.com/o/upload/product-catalog-img/64/6414d6e7c3c5a_unisex-eco-hoodie-bottle-green-front-6414d77f4fbe3.jpg',
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
      { name: 'Verde menta', hex: '#95d5b2' },
    ],
    description: 'Cerámica resistente al lavavajillas. Cada sorbo planta un árbol.',
    mockupUrl: 'https://files.cdn.printful.com/o/upload/product-catalog-img/3d/3db8f6c3cb8d9_white-glossy-mug-11oz-front-view-6305a5e6e08b4.jpg',
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
    badge: 'Eco',
    sizes: ['Único'],
    colors: [
      { name: 'Natural', hex: '#F5F0E8' },
      { name: 'Verde', hex: '#2d6a4f' },
    ],
    description: 'Algodón orgánico. Cero plástico, máximo impacto en Guatemala.',
    mockupUrl: 'https://files.cdn.printful.com/o/upload/product-catalog-img/74/74da87bbfae32_AOP-tote-bag_front_mockup.jpg',
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
    description: 'Logo bordado. Protección solar con estilo y propósito.',
    mockupUrl: 'https://files.cdn.printful.com/o/upload/product-catalog-img/1f/1f87e0e4c8afe_classic-dad-hat-black-front-6305a5e5f00b2.jpg',
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
    mockupUrl: 'https://files.cdn.printful.com/o/upload/product-catalog-img/28/2890b0edb8069_premium-matte-paper-poster-in-a-frame_6_preview_6305a5e5f1b86.jpg',
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
    badge: 'Kids',
    sizes: ['3-4', '5-6', '7-8', '9-10', '11-12', '13-14'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde menta', hex: '#95d5b2' },
    ],
    description: 'Los niños también pueden cambiar el mundo. 100% algodón orgánico.',
    mockupUrl: 'https://files.cdn.printful.com/o/upload/product-catalog-img/60/6040cec14e05d_unisex-staple-t-shirt-white-front-6305a5e6dfd78.jpg',
  },
]

const CATEGORIES = ['todos', 'ropa', 'hogar', 'accesorios']

const CATEGORY_LABELS: Record<string, string> = {
  todos: 'Todos los productos',
  ropa: 'Ropa',
  hogar: 'Hogar & Oficina',
  accesorios: 'Accesorios',
}

const BADGE_STYLES: Record<string, string> = {
  'Bestseller': 'bg-[#1b4332] text-white',
  'Quetz Pick': 'bg-[#95d5b2] text-[#1b4332]',
  'Eco': 'bg-emerald-100 text-emerald-800',
  'Kids': 'bg-sky-100 text-sky-800',
  'Nuevo': 'bg-orange-100 text-orange-800',
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (item: CartItem) => void }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[product.sizes.length > 2 ? 2 : 0])
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col"
    >
      {/* ── Image area ── */}
      <div className="relative bg-gray-50 overflow-hidden" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          {/* Badge */}
          {product.badge && (
            <div className={`absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLES[product.badge] ?? 'bg-gray-100 text-gray-700'}`}>
              {product.badge === 'Bestseller' && <Star className="w-3 h-3 inline mr-1" />}
              {product.badge}
            </div>
          )}

          {/* Trees badge */}
          <div className="absolute top-3 right-3 z-10 bg-[#dcfce7] text-[#1b4332] text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <TreePine className="w-3 h-3" />
            {product.trees} árbol{product.trees > 1 ? 'es' : ''}
          </div>

          {/* QR back overlay — appears on hover */}
          <AnimatePresence>
            {showBack && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-20 bg-[#1b4332] flex flex-col items-center justify-center gap-3 p-6"
              >
                <div className="bg-white rounded-2xl p-3 shadow-lg">
                  {qrSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrSrc} alt="QR quetz.org" width={120} height={120} className="rounded-lg" />
                  ) : (
                    <div className="w-[120px] h-[120px] flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-300 animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm leading-tight">Diseño del reverso</p>
                  <p className="text-[#95d5b2] text-xs mt-1">Escanea y adopta tu árbol 🌱</p>
                  <p className="text-white/50 text-[10px] font-mono mt-1">quetz.org?ref={product.ref}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Image src="/logo-quetz-oficial.png" alt="QUETZ" width={20} height={20} className="brightness-0 invert opacity-60" />
                  <span className="text-white/60 text-[10px]">QUETZ.ORG</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product mockup image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.mockupUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />

          {/* QR hover button — bottom */}
          <button
            onMouseEnter={() => setShowBack(true)}
            onMouseLeave={() => setShowBack(false)}
            onClick={() => setShowBack(v => !v)}
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 py-2 bg-white/90 backdrop-blur-sm text-[#1b4332] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#f0fdf4]"
          >
            <QrCode className="w-3.5 h-3.5" />
            Ver diseño trasero con QR
          </button>
        </div>
      </div>

      {/* ── Product info ── */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{product.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-gray-900">{product.price.toFixed(2)}€</span>
          <span className="text-xs text-gray-400">+ envío</span>
        </div>

        {/* Color selector */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 uppercase tracking-wide w-12 shrink-0">Color</span>
            <div className="flex gap-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  title={c.name}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selectedColor.name === c.name
                      ? 'border-[#1b4332] scale-125 shadow-sm'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              <span className="text-[11px] text-gray-500 ml-1 self-center">{selectedColor.name}</span>
            </div>
          </div>
        )}

        {/* Size selector */}
        {product.sizes.length > 1 && (
          <div className="flex items-start gap-2">
            <span className="text-[11px] text-gray-400 uppercase tracking-wide w-12 shrink-0 pt-1">Talla</span>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2 py-0.5 text-xs font-medium rounded border transition-all ${
                    selectedSize === s
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#1b4332] hover:text-[#1b4332]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trees impact */}
        <div className="flex items-center gap-1.5 bg-[#f0fdf4] rounded-lg px-3 py-2">
          <TreePine className="w-4 h-4 text-[#1b4332] shrink-0" />
          <span className="text-xs text-[#1b4332] font-medium">
            Esta compra planta <strong>{product.trees} árbol{product.trees > 1 ? 'es' : ''}</strong> en Zacapa 🇬🇹
          </span>
        </div>

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
            <><CheckCircle className="w-4 h-4" /> ¡Añadido al carrito!</>
          ) : (
            <><ShoppingBag className="w-4 h-4" /> Añadir al carrito</>
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
}: {
  items: CartItem[]
  onClose: () => void
  onUpdateQty: (id: string, size: string, delta: number) => void
  onRemove: (id: string, size: string) => void
  onCheckout: () => void
  loading: boolean
}) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalTrees = items.reduce((s, i) => s + i.trees * i.quantity, 0)

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
          <h2 className="font-black text-gray-900 text-lg">Tu pedido</h2>
          <p className="text-sm text-gray-400">{items.reduce((s, i) => s + i.quantity, 0)} producto{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {totalTrees > 0 && (
        <div className="mx-4 mt-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex items-center gap-2">
          <TreePine className="w-5 h-5 text-[#1b4332] shrink-0" />
          <p className="text-sm text-[#1b4332] font-medium">
            Este pedido planta <strong>{totalTrees} árbol{totalTrees > 1 ? 'es' : ''}</strong> reales en Guatemala 🌱
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 mt-2">
        {items.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-sm mt-1">Añade productos para plantar árboles 🌳</p>
          </div>
        )}
        {items.map((item) => (
          <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.mockupUrl} alt={item.name} className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.selectedSize} · {item.selectedColor.name}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateQty(item.id, item.selectedSize, -1)}
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-gray-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.selectedSize, 1)}
                    className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center hover:bg-[#2d6a4f]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-black text-gray-900">{(item.price * item.quantity).toFixed(2)}€</span>
              </div>
            </div>
            <button onClick={() => onRemove(item.id, item.selectedSize)} className="shrink-0 p-1 text-gray-300 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="p-5 border-t space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="font-black text-xl text-gray-900">{total.toFixed(2)}€</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Leaf className="w-3 h-3 text-[#2d6a4f]" />
            Producido por Gelato, enviado globalmente. Envío calculado al pagar.
          </p>
          <button
            onClick={onCheckout}
            disabled={loading}
            className="w-full bg-[#1b4332] text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 hover:bg-[#2d6a4f] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CreditCard className="w-5 h-5" /> Pagar con Stripe</>
            )}
          </button>
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

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const key = `${item.id}-${item.selectedSize}`
      const existing = prev.find((i) => `${i.id}-${i.selectedSize}` === key)
      if (existing) {
        return prev.map((i) => `${i.id}-${i.selectedSize}` === key ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, item]
    })
    setCartOpen(true)
  }, [])

  const updateQty = (id: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => `${i.id}-${i.selectedSize}` === `${id}-${size}` ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (id: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.selectedSize === size)))
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
            name: i.name,
            price: i.price,
            trees: i.trees,
            quantity: i.quantity,
            size: i.selectedSize,
            color: i.selectedColor.name,
            ref: i.ref,
          })),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Error al procesar el pago')
      }
    } catch {
      alert('Error de conexión')
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
            className="fixed top-0 left-0 right-0 z-50 bg-[#1b4332] text-white px-4 py-3 flex items-center justify-center gap-3 shadow-lg"
          >
            <CheckCircle className="w-5 h-5 text-[#95d5b2]" />
            <span className="font-semibold">¡Pedido confirmado! Recibirás un email con los detalles. 🌱</span>
            <button onClick={() => setSuccess(false)} className="ml-4 text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
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
              Tienda oficial QUETZ · Producido por Gelato
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-4">
              Tienda quetz.org<br />
              <span className="text-[#95d5b2]">Cada compra planta árboles</span>
            </h1>
            <p className="text-white/75 text-lg mb-8 max-w-lg">
              Diseños exclusivos con nuestros Quetzitos. Cada producto incluye QR para adoptar árboles reales en Zacapa, Guatemala.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {[
                { icon: TreePine, text: 'Árboles reales plantados' },
                { icon: Package, text: 'Envío global por Gelato' },
                { icon: Leaf, text: 'Materiales ecológicos' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  <Icon className="w-4 h-4 text-[#95d5b2]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Mascot — solo en hero */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
            <div className="absolute inset-0 bg-white/5 rounded-full" />
            <div className="absolute inset-6 bg-white/5 rounded-full" />
            <Image
              src="/mascot/quetzito-aventurero.png"
              alt="Quetzito aventurero"
              fill
              className="object-contain drop-shadow-2xl relative z-10"
              priority
              sizes="(max-width: 768px) 256px, 320px"
            />
          </div>
        </div>
      </section>

      {/* ── Category nav — Gelato style ── */}
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
                {CATEGORY_LABELS[cat]}
                {category === cat && (
                  <motion.div
                    layoutId="cat-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b4332] rounded-full"
                  />
                )}
              </button>
            ))}
            <div className="ml-auto text-xs text-gray-400 whitespace-nowrap shrink-0 pr-4">
              {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
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
        <span className="text-sm">Carrito</span>
        {totalCartItems > 0 && (
          <span className="bg-[#95d5b2] text-[#1b4332] text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
            {totalCartItems > 9 ? '9+' : totalCartItems}
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
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* ── How it works ── */}
      <section className="border-t border-gray-100 bg-gray-50 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">¿Cómo funciona?</h2>
          <p className="text-gray-500 text-center mb-10">De tu carrito a un árbol en Zacapa, Guatemala</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, step: '01', text: 'Eliges tu producto', sub: 'Ropa, hogar o accesorios' },
              { icon: CreditCard, step: '02', text: 'Pago seguro', sub: 'Stripe · SSL · 100% seguro' },
              { icon: TreePine, step: '03', text: 'Plantamos árboles', sub: 'Zacapa, Guatemala 🇬🇹' },
              { icon: Package, step: '04', text: 'Gelato produce & envía', sub: 'Entrega en todo el mundo' },
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
            <h2 className="text-xl font-black text-gray-900 mb-2">QR exclusivo en el reverso</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Cada producto lleva un QR único impreso en el reverso que enlaza a{' '}
              <strong className="text-[#1b4332]">quetz.org?ref=producto</strong>. Cuando alguien escanea tu camiseta y adopta un árbol, queda registrado como tu referido — multiplicando tu impacto.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-[#2d6a4f]">
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                Rastrea tus referidos
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                Multiplica el impacto ambiental
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                Único en cada producto
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
          Volver al inicio
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
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
