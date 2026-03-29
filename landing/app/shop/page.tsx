'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  TreePine,
  RotateCw,
  X,
  Plus,
  Minus,
  ChevronRight,
  Leaf,
  QrCode,
  Shirt,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Package,
} from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

// ─── Types ───────────────────────────────────────────────────────────────────

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
}

interface CartItem extends Product {
  quantity: number
  selectedSize: string
  selectedColor: ProductColor
}

// ─── Static catalog (mirrors /api/gelato/products) ───────────────────────────

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
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Blanco', hex: '#FFFFFF' },
      { name: 'Verde bosque', hex: '#2d6a4f' },
      { name: 'Negro', hex: '#1a1a1a' },
    ],
    description: 'Algodón 100% orgánico. Lleva el bosque contigo a cualquier lugar.',
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
    description: 'Interior suave, exterior con propósito. Cálido como el bosque maya.',
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
    description: 'Algodón orgánico. Cero plástico, máximo impacto en Guatemala.',
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
    description: 'Los niños también pueden cambiar el mundo. 100% algodón orgánico.',
  },
]

const CATEGORIES = ['todos', 'ropa', 'hogar', 'accesorios']

// ─── Product Mockup SVG shapes ────────────────────────────────────────────────

function ProductShape({ productId, color }: { productId: string; color: string }) {
  if (productId === 'taza') {
    return (
      <svg viewBox="0 0 120 100" className="w-full h-full">
        <rect x="10" y="15" width="80" height="70" rx="8" fill={color} stroke="#1b4332" strokeWidth="2" />
        <path d="M90 30 Q110 30 110 50 Q110 70 90 70" fill="none" stroke="#1b4332" strokeWidth="3" strokeLinecap="round"/>
        <rect x="10" y="15" width="80" height="12" rx="4" fill={color === '#FFFFFF' ? '#e8f5e9' : '#0f3d24'} opacity="0.4" />
      </svg>
    )
  }
  if (productId === 'totebag') {
    return (
      <svg viewBox="0 0 120 130" className="w-full h-full">
        <path d="M20 40 L15 120 Q15 125 20 125 L100 125 Q105 125 105 120 L100 40 Z" fill={color} stroke="#1b4332" strokeWidth="2"/>
        <path d="M40 40 Q40 15 60 15 Q80 15 80 40" fill="none" stroke="#1b4332" strokeWidth="3" strokeLinecap="round"/>
        <line x1="15" y1="55" x2="105" y2="55" stroke="#1b4332" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.4"/>
      </svg>
    )
  }
  if (productId === 'gorra') {
    return (
      <svg viewBox="0 0 130 80" className="w-full h-full">
        <path d="M20 55 Q20 20 65 20 Q110 20 110 55" fill={color} stroke="#1b4332" strokeWidth="2"/>
        <rect x="5" y="52" width="120" height="14" rx="7" fill={color} stroke="#1b4332" strokeWidth="2"/>
        <path d="M5 59 Q65 70 125 59" fill="none" stroke="#1b4332" strokeWidth="1.5" opacity="0.4"/>
        <rect x="57" y="20" width="16" height="8" rx="4" fill={color === '#FFFFFF' ? '#e8f5e9' : '#0f3d24'} opacity="0.6"/>
      </svg>
    )
  }
  if (productId === 'cuaderno-bambu') {
    return (
      <svg viewBox="0 0 90 120" className="w-full h-full">
        <rect x="10" y="5" width="70" height="110" rx="4" fill={color} stroke="#1b4332" strokeWidth="2"/>
        <rect x="10" y="5" width="12" height="110" rx="2" fill="#A0784A"/>
        <line x1="28" y1="25" x2="72" y2="25" stroke="#1b4332" strokeWidth="1.5" opacity="0.5"/>
        <line x1="28" y1="35" x2="72" y2="35" stroke="#1b4332" strokeWidth="1" opacity="0.3"/>
        <line x1="28" y1="45" x2="72" y2="45" stroke="#1b4332" strokeWidth="1" opacity="0.3"/>
        <line x1="28" y1="55" x2="60" y2="55" stroke="#1b4332" strokeWidth="1" opacity="0.3"/>
      </svg>
    )
  }
  // T-shirt (default for camiseta, hoodie, camiseta-ninos)
  return (
    <svg viewBox="0 0 140 130" className="w-full h-full">
      <path
        d="M30 10 L10 40 L30 50 L30 120 Q30 125 35 125 L105 125 Q110 125 110 120 L110 50 L130 40 L110 10 L90 25 Q70 35 50 25 Z"
        fill={color}
        stroke="#1b4332"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {productId === 'hoodie' && (
        <>
          <path d="M55 10 Q70 18 85 10 L80 35 Q70 40 60 35 Z" fill={color === '#FFFFFF' ? '#d1fae5' : '#0f3d24'} opacity="0.5"/>
          <path d="M30 50 L110 50" stroke="#1b4332" strokeWidth="1.5" opacity="0.3"/>
          <circle cx="70" cy="60" r="3" fill="#1b4332" opacity="0.4"/>
        </>
      )}
    </svg>
  )
}

// ─── Product Card — front & back ─────────────────────────────────────────────

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (item: CartItem) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [selectedSize, setSelectedSize] = useState(product.sizes[product.sizes.length > 2 ? 2 : 0])
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0])
  const [added, setAdded] = useState(false)
  const [qrSrc, setQrSrc] = useState('')

  const qrUrl = `https://www.quetz.org?ref=${product.ref}`

  useEffect(() => {
    const encoded = encodeURIComponent(qrUrl)
    setQrSrc(`/api/qr?url=${encoded}&size=180`)
  }, [qrUrl])

  const handleAdd = () => {
    onAddToCart({ ...product, quantity: 1, selectedSize, selectedColor })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Determine if color is light (needs dark text)
  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return r * 0.299 + g * 0.587 + b * 0.114 > 160
  }

  const textOnColor = isLight(selectedColor.hex) ? '#1b4332' : '#f0fdf4'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      {/* Product visual area with flip */}
      <div className="relative h-64 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]">
        {/* Flip button */}
        <button
          onClick={() => setFlipped(!flipped)}
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-[#95d5b2]/30 transition-colors"
          title={flipped ? 'Ver frente' : 'Ver reverso'}
        >
          <RotateCw className="w-4 h-4 text-[#1b4332]" />
        </button>

        {/* Trees badge */}
        <div className="absolute top-3 left-3 z-10 bg-[#1b4332] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <TreePine className="w-3 h-3" />
          {product.trees} árbol{product.trees > 1 ? 'es' : ''}
        </div>

        <AnimatePresence mode="wait">
          {!flipped ? (
            /* FRENTE */
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-2"
            >
              {/* Product shape with mascot overlay */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <div className="absolute inset-0">
                  <ProductShape productId={product.id} color={selectedColor.hex} />
                </div>
                {/* Mascot centered on product */}
                <div className="relative z-10 w-16 h-16 mt-2">
                  <Image
                    src={`/mascot/${product.mascot}.png`}
                    alt="Quetzito mascota"
                    fill
                    className="object-contain drop-shadow-md"
                    sizes="64px"
                  />
                </div>
              </div>
              {/* Phrase */}
              <p className="text-[#1b4332] text-xs font-semibold text-center leading-tight max-w-[160px]">
                {product.phrase}
              </p>
            </motion.div>
          ) : (
            /* REVERSO */
            <motion.div
              key="back"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] p-4"
            >
              {/* QR code */}
              <div className="bg-white rounded-xl p-2 shadow-lg">
                {qrSrc ? (
                  <Image
                    src={qrSrc}
                    alt={`QR quetz.org?ref=${product.ref}`}
                    width={100}
                    height={100}
                    className="rounded-lg"
                    unoptimized
                  />
                ) : (
                  <div className="w-[100px] h-[100px] flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-gray-300 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Text */}
              <p className="text-white text-xs font-bold text-center leading-tight">
                Escanea y adopta tu árbol 🌱
              </p>

              {/* Logo + URL */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="relative w-5 h-5">
                  <Image
                    src="/logo-quetz-oficial.png"
                    alt="QUETZ"
                    fill
                    className="object-contain brightness-0 invert"
                    sizes="20px"
                  />
                </div>
                <span className="text-[#95d5b2] text-[10px] font-mono">quetz.org?ref={product.ref}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>
        </div>

        {/* Price + trees */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#1b4332]">{product.price.toFixed(2)}€</span>
          <span className="text-xs text-[#2d6a4f] bg-[#dcfce7] px-2 py-0.5 rounded-full font-medium">
            🌱 {product.trees} árbol{product.trees > 1 ? 'es' : ''} plantado{product.trees > 1 ? 's' : ''}
          </span>
        </div>

        {/* Color selector */}
        {product.colors.length > 1 && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Color: {selectedColor.name}</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor.name === c.name
                      ? 'border-[#1b4332] scale-110 shadow-md'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size selector */}
        {product.sizes.length > 1 && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">Talla / Tamaño</p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                    selectedSize === s
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#2d6a4f]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.97 }}
          className={`mt-auto w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            added
              ? 'bg-[#95d5b2] text-[#1b4332]'
              : 'bg-[#1b4332] text-white hover:bg-[#2d6a4f]'
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-4 h-4" />
              ¡Añadido!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              Añadir al carrito
            </>
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
      <div className="flex items-center justify-between p-4 border-b bg-[#1b4332] text-white">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-bold">Tu pedido ({items.reduce((s, i) => s + i.quantity, 0)})</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Trees impact */}
      {totalTrees > 0 && (
        <div className="mx-4 mt-3 bg-[#dcfce7] rounded-xl p-3 flex items-center gap-2">
          <TreePine className="w-5 h-5 text-[#1b4332] shrink-0" />
          <p className="text-sm text-[#1b4332] font-medium">
            Este pedido planta <strong>{totalTrees} árbol{totalTrees > 1 ? 'es' : ''}</strong> en Zacapa 🇬🇹
          </p>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Tu carrito está vacío</p>
          </div>
        )}
        {items.map((item) => (
          <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 bg-gray-50 rounded-xl p-3">
            <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
              <div className="absolute inset-0">
                <ProductShape productId={item.id} color={item.selectedColor.hex} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-7 h-7">
                  <Image
                    src={`/mascot/${item.mascot}.png`}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="28px"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-[10px] text-gray-400">
                {item.selectedSize} · {item.selectedColor.name}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateQty(item.id, item.selectedSize, -1)}
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.selectedSize, 1)}
                    className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center hover:bg-[#2d6a4f]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-bold text-[#1b4332]">
                  {(item.price * item.quantity).toFixed(2)}€
                </span>
              </div>
            </div>
            <button
              onClick={() => onRemove(item.id, item.selectedSize)}
              className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold text-lg">{total.toFixed(2)}€</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Leaf className="w-3 h-3 text-[#2d6a4f]" />
            Envío calculado al finalizar. Producido por Gelato, enviado globalmente.
          </p>
          <button
            onClick={onCheckout}
            disabled={loading}
            className="w-full bg-[#1b4332] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2d6a4f] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pagar con Stripe
              </>
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

  // Check for Stripe success redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') setSuccess(true)
    }
  }, [])

  const filtered = category === 'todos'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === category)

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0)

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const key = `${item.id}-${item.selectedSize}`
      const existing = prev.find((i) => `${i.id}-${i.selectedSize}` === key)
      if (existing) {
        return prev.map((i) =>
          `${i.id}-${i.selectedSize}` === key ? { ...i, quantity: i.quantity + 1 } : i
        )
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
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-white">

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] text-white pt-24 pb-16 px-4">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm mb-4">
              <Sparkles className="w-4 h-4 text-[#95d5b2]" />
              Tienda oficial QUETZ
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
              Viste el bosque.<br />
              <span className="text-[#95d5b2]">Cambia el mundo.</span>
            </h1>
            <p className="text-white/80 text-lg mb-6">
              Cada producto planta árboles reales en Zacapa, Guatemala.<br />
              Diseñado con nuestros Quetzitos. Producido globalmente por Gelato.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <TreePine className="w-4 h-4 text-[#95d5b2]" /> Árboles reales
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <Package className="w-4 h-4 text-[#95d5b2]" /> Envío global
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                <Leaf className="w-4 h-4 text-[#95d5b2]" /> Materiales ecológicos
              </div>
            </div>
          </div>

          {/* Mascot */}
          <div className="relative w-56 h-56 md:w-72 md:h-72 shrink-0">
            <div className="absolute inset-0 bg-white/10 rounded-full" />
            <div className="absolute inset-4 bg-white/10 rounded-full" />
            <Image
              src="/mascot/quetzito-aventurero.png"
              alt="Quetzito aventurero"
              fill
              className="object-contain drop-shadow-2xl z-10 relative"
              priority
              sizes="(max-width: 768px) 224px, 288px"
            />
          </div>
        </div>
      </section>

      {/* ── Floating cart button ── */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1b4332] text-white rounded-full p-4 shadow-xl hover:bg-[#2d6a4f] transition-colors flex items-center gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        {totalCartItems > 0 && (
          <span className="bg-[#95d5b2] text-[#1b4332] text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
            {totalCartItems > 9 ? '9+' : totalCartItems}
          </span>
        )}
      </button>

      {/* ── Category tabs ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-[#1b4332] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-[#dcfce7] hover:text-[#1b4332]'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <div className="ml-auto text-xs text-gray-400 whitespace-nowrap shrink-0">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ── Product grid ── */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* ── How it works ── */}
      <section className="bg-[#1b4332] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">¿Cómo funciona? 🌱</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, step: '1', text: 'Eliges tu producto favorito' },
              { icon: CreditCard, step: '2', text: 'Pagas con Stripe de forma segura' },
              { icon: TreePine, step: '3', text: 'Plantamos árboles en Zacapa 🇬🇹' },
              { icon: Package, step: '4', text: 'Gelato produce y envía globalmente' },
            ].map(({ icon: Icon, step, text }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#95d5b2]" />
                </div>
                <p className="text-sm text-white/80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QR explanation ── */}
      <section className="py-10 px-4 bg-[#f0fdf4]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3">
              <QrCode className="w-20 h-20 text-[#2d6a4f]" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1b4332] mb-2">QR en el reverso de cada producto</h2>
            <p className="text-gray-600 mb-3">
              Cada producto lleva un QR único en el reverso que lleva a <strong>quetz.org?ref=producto</strong>.
              Cuando alguien escanea tu camiseta y adopta un árbol, queda registrado como tu referido.
            </p>
            <div className="flex gap-4 text-sm text-[#2d6a4f]">
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                Rastrea tus referidos
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4" />
                Multiplica el impacto
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Back to site ── */}
      <div className="py-6 px-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#2d6a4f] hover:text-[#1b4332] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al bosque
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
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
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
