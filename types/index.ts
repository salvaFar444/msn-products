// ─── Product Types ────────────────────────────────────────────────

export type ProductCategory = 'Audio' | 'Wearables' | 'Cables' | 'Cargadores'

export interface Product {
  id: string
  name: string
  shortName: string
  category: ProductCategory
  price: number       // COP integer, no decimals
  description: string
  image: string       // Supabase Storage URL or '/img.jpg' fallback
  badge?: string      // e.g. 'Más vendido', 'Nuevo'
  stock: number       // 0 = Agotado
  features: string[]
}

// Computed helper — not stored in DB
export function isInStock(product: Product): boolean {
  return product.stock > 0
}

// ─── Cart Types ───────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export interface CartActions {
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

export type CartStore = CartState & CartActions

// ─── Checkout Types ───────────────────────────────────────────────

export interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  phone: string       // +57 3XX XXX XXXX
  department: string
  city: string
  address: string
  notes?: string
}

export type PaymentMethod = 'mercadopago' | 'wompi' | 'nequi'

export interface OrderSummaryData {
  items: CartItem[]
  subtotal: number
  shipping: number    // 0 = free shipping
  total: number
}

// ─── Admin Types ──────────────────────────────────────────────────

export interface AdminUser {
  id: string
  email: string
  role: 'admin'
  createdAt: string
}

export interface ProductFormData {
  name: string
  shortName: string
  category: ProductCategory
  price: number
  description: string
  stock: number
  badge: string
  features: string[]
  imageFile?: File
  imageUrl?: string
}

// ─── Order Types ──────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export interface OrderRow {
  id: string
  mp_preference_id: string | null
  mp_payment_id: string | null
  status: OrderStatus
  items: OrderItem[]
  customer: CheckoutFormData
  total: number
  created_at: string
  updated_at: string
}

// ─── Supabase DB Row Types ────────────────────────────────────────

export interface ProductRow {
  id: string
  name: string
  short_name: string
  category: string
  price: number
  description: string | null
  image_url: string | null
  badge: string | null
  stock: number
  features: string[]
  created_at: string
  updated_at: string
}

// Maps a Supabase row to our Product interface
export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    category: row.category as ProductCategory,
    price: row.price,
    description: row.description ?? '',
    image: row.image_url ?? '/img.jpg',
    badge: row.badge ?? undefined,
    stock: row.stock,
    features: row.features ?? [],
  }
}
