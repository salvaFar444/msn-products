import { z } from 'zod'

/**
 * Server-side validator for the admin product form.
 *
 * Why z.coerce.*: the form action receives serialized FormData from the
 * client, so numbers arrive as strings. Coercion guarantees price/stock
 * are numbers regardless of how the payload was built (native form post,
 * server-action RPC, or manual JSON).
 *
 * Why .strict() is NOT used: we receive ProductFormData which includes
 * optional legacy fields (imageFile/imageUrl/media) we want to silently
 * ignore — strict would reject them.
 */
export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(120, 'Nombre demasiado largo (máx. 120).'),
  shortName: z
    .string()
    .trim()
    .min(2, 'El nombre corto debe tener al menos 2 caracteres.')
    .max(60, 'Nombre corto demasiado largo (máx. 60).'),
  category: z.enum(['Audio', 'Wearables', 'Cables', 'Cargadores'], {
    errorMap: () => ({ message: 'Categoría inválida.' }),
  }),
  price: z.coerce
    .number({ invalid_type_error: 'El precio debe ser un número.' })
    .int('El precio debe ser un entero (COP sin decimales).')
    .min(1, 'El precio debe ser mayor a 0.')
    .max(100_000_000, 'Precio demasiado alto.'),
  stock: z.coerce
    .number({ invalid_type_error: 'El stock debe ser un número.' })
    .int('El stock debe ser un entero.')
    .min(0, 'El stock no puede ser negativo.')
    .max(100_000, 'Stock demasiado alto.'),
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(2000, 'Descripción demasiado larga (máx. 2000).'),
  longDescription: z.string().trim().max(8000).optional(),
  specs: z.record(z.string()).optional(),
  badge: z.string().trim().max(30).optional().or(z.literal('')),
  features: z
    .array(z.string().trim())
    .default([])
    .transform((arr) => arr.filter((f) => f.length > 0)),
})

export type ProductFormSchemaInput = z.input<typeof productFormSchema>
export type ProductFormSchemaOutput = z.output<typeof productFormSchema>

/**
 * Helper: run the schema and collapse Zod's ZodError into the first
 * human-readable message (Spanish). Returns a discriminated result so
 * callers can branch cleanly.
 */
export function parseProductForm(
  input: unknown
):
  | { ok: true; data: ProductFormSchemaOutput }
  | { ok: false; error: string; field?: string } {
  const parsed = productFormSchema.safeParse(input)
  if (parsed.success) return { ok: true, data: parsed.data }
  const first = parsed.error.issues[0]
  return {
    ok: false,
    error: first?.message ?? 'Datos inválidos.',
    field: first?.path.join('.') || undefined,
  }
}
