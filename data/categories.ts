import {
  Cable,
  Gamepad2,
  Headphones,
  LayoutGrid,
  Scissors,
  Tv,
  Watch,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { ProductCategory } from '@/types'

export type CategoryId = ProductCategory | 'Todos'

export interface CategoryDef {
  id: CategoryId
  label: string
  icon: LucideIcon
}

export const CATEGORIES: readonly CategoryDef[] = [
  { id: 'Todos', label: 'Todos', icon: LayoutGrid },
  { id: 'Audio', label: 'Audio', icon: Headphones },
  { id: 'Relojes Inteligentes', label: 'Relojes Inteligentes', icon: Watch },
  { id: 'Cables', label: 'Cables', icon: Cable },
  { id: 'Cargadores', label: 'Cargadores', icon: Zap },
  { id: 'Gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'Hogar Tech', label: 'Hogar Tech', icon: Tv },
  { id: 'Cuidado Personal', label: 'Cuidado Personal', icon: Scissors },
] as const

export function getCategoryDef(id: CategoryId): CategoryDef {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]
}
