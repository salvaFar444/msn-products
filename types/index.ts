// ─── Product Types ────────────────────────────────────────────────

export type ProductCategory =
  | 'Audio'
  | 'Relojes Inteligentes'
  | 'Cables'
  | 'Cargadores'
  | 'Gaming'
  | 'Hogar Tech'
  | 'Cuidado Personal'

export type MediaType = 'image' | 'video'

export interface ProductMedia {
  id: string
  productId: string
  url: string
  mediaType: MediaType
  position: number
  isPrimary: boolean
  createdAt: string
}

export interface ProductReview {
  id: string
  productId: string
  authorName: string
  authorCity: string | null
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  isVerified: boolean
  createdAt: string
}

export interface Product {
  id: string
  slug: string
  name: string
  shortName: string
  category: ProductCategory
  price: number // COP integer, no decimals
  description: string
  longDescription?: string
  specs?: Record<string, string>
  image: string // Primary image URL — cached from product_media for listing cards
  badge?: string
  stock: number
  features: string[]
  media?: ProductMedia[] // loaded only for detail views
  hasVideo?: boolean // derived flag — true if media contains at least one video
  updatedAt?: string // ISO timestamp — shown in admin form for confirmation
}

export function isInStock(product: Product): boolean {
  return product.stock > 0
}

// ─── Cart Types ───────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

export type DiscountType = 'percentage' | 'fixed'

export interface DiscountCode {
  id: string
  code: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxUses: number | null
  currentUses: number
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AppliedDiscount {
  code: string
  discountType: DiscountType
  discountValue: number
  amount: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  isOrderFormOpen: boolean
  discount: AppliedDiscount | null
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
  applyDiscount: (discount: AppliedDiscount) => void
  removeDiscount: () => void
}

export type CartStore = CartState & CartActions

export interface DiscountCodeRow {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  current_uses: number
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export function rowToDiscountCode(row: DiscountCodeRow): DiscountCode {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrderAmount: Number(row.min_order_amount),
    maxUses: row.max_uses,
    currentUses: row.current_uses,
    isActive: row.is_active,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
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
  longDescription?: string
  specs?: Record<string, string>
  stock: number
  badge: string
  features: string[]
  // Legacy single-image fields — still used by ProductForm until the MediaList
  // integration (Task 1) is finished. MediaList will replace them.
  imageUrl?: string
  imageFile?: File
  // Local draft media list — mixed existing rows and pending uploads.
  // Managed by MediaList; server sync happens via /api/admin/media.
  media?: ProductMedia[]
}

// ─── Supabase DB Row Types ────────────────────────────────────────

export interface ProductRow {
  id: string
  slug: string | null
  name: string
  short_name: string
  category: string
  price: number
  description: string | null
  long_description: string | null
  specs: Record<string, string> | null
  image_url: string | null
  badge: string | null
  stock: number
  features: string[]
  created_at: string
  updated_at: string
}

export interface ProductMediaRow {
  id: string
  product_id: string
  url: string
  media_type: 'image' | 'video'
  position: number
  is_primary: boolean
  created_at: string
}

export interface ProductReviewRow {
  id: string
  product_id: string
  author_name: string
  author_city: string | null
  rating: number
  comment: string
  is_verified: boolean
  created_at: string
}

// ─── Row → Domain mappers ────────────────────────────────────────

export function rowToProduct(
  row: ProductRow,
  media?: ProductMediaRow[]
): Product {
  const mappedMedia = media?.map(rowToProductMedia) ?? []
  const primary = mappedMedia.find((m) => m.isPrimary && m.mediaType === 'image')

  return {
    id: row.id,
    slug: row.slug ?? row.id, // fallback to id if slug not yet generated
    name: row.name,
    shortName: row.short_name,
    category: row.category as ProductCategory,
    price: row.price,
    description: row.description ?? '',
    longDescription: row.long_description ?? undefined,
    specs: row.specs ?? undefined,
    image: primary?.url ?? row.image_url ?? '/img.jpg',
    badge: row.badge ?? undefined,
    stock: row.stock,
    features: row.features ?? [],
    media: mappedMedia.length > 0 ? mappedMedia : undefined,
    hasVideo: mappedMedia.some((m) => m.mediaType === 'video'),
    updatedAt: row.updated_at,
  }
}

export function rowToProductMedia(row: ProductMediaRow): ProductMedia {
  return {
    id: row.id,
    productId: row.product_id,
    url: row.url,
    mediaType: row.media_type,
    position: row.position,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  }
}

export function rowToProductReview(row: ProductReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    authorName: row.author_name,
    authorCity: row.author_city,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    comment: row.comment,
    isVerified: row.is_verified,
    createdAt: row.created_at,
  }
}
