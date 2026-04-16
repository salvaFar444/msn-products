// ─── Product Types ────────────────────────────────────────────────

export type ProductCategory = 'Audio' | 'Wearables' | 'Cables' | 'Cargadores'

export interface Product {
  id: string
  name: string
  shortName: string
  category: ProductCategory
  price: number // COP integer, no decimals
  description: string
  image: string // Supabase Storage URL or '/img.jpg' fallback
  badge?: string // e.g. 'Más vendido', 'Nuevo'
  stock: number // 0 = Agotado
  features: string[]
}

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
  isOrderFormOpen: boolean
}

export interface CartActions {
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  openOrderForm: () => void
  closeOrderForm: () => void
}

export type CartStore = CartState & CartActions

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
