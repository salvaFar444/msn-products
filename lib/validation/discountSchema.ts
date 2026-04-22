import { z } from 'zod'

export const discountCodeSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'El código debe tener al menos 3 caracteres.')
      .max(40, 'Código demasiado largo (máx. 40).')
      .regex(/^[A-Z0-9_-]+$/i, 'Solo letras, números, guiones y guiones bajos.'),
    description: z
      .string()
      .trim()
      .max(200, 'Descripción demasiado larga (máx. 200).')
      .optional()
      .or(z.literal('')),
    discountType: z.enum(['percentage', 'fixed'], {
      errorMap: () => ({ message: 'Tipo de descuento inválido.' }),
    }),
    discountValue: z.coerce
      .number({ invalid_type_error: 'El valor debe ser un número.' })
      .positive('El valor debe ser mayor a 0.')
      .max(100_000_000, 'Valor demasiado alto.'),
    minOrderAmount: z.coerce
      .number({ invalid_type_error: 'El mínimo debe ser un número.' })
      .min(0, 'No puede ser negativo.')
      .max(100_000_000, 'Valor demasiado alto.')
      .default(0),
    maxUses: z
      .union([
        z.coerce
          .number()
          .int('Debe ser un entero.')
          .positive('Debe ser mayor a 0.'),
        z.literal('').transform(() => null),
        z.null(),
      ])
      .optional()
      .nullable(),
    isActive: z
      .union([z.boolean(), z.literal('on').transform(() => true), z.literal('').transform(() => false)])
      .default(true),
    startsAt: z
      .union([z.string().datetime().or(z.string().min(1)), z.literal(''), z.null()])
      .optional()
      .nullable(),
    expiresAt: z
      .union([z.string().datetime().or(z.string().min(1)), z.literal(''), z.null()])
      .optional()
      .nullable(),
  })
  .refine(
    (v) => v.discountType !== 'percentage' || v.discountValue <= 100,
    { message: 'El porcentaje no puede superar 100.', path: ['discountValue'] }
  )
  .refine(
    (v) => {
      if (!v.startsAt || !v.expiresAt) return true
      try {
        return new Date(v.startsAt) < new Date(v.expiresAt)
      } catch {
        return true
      }
    },
    { message: 'La fecha de expiración debe ser posterior al inicio.', path: ['expiresAt'] }
  )

export type DiscountCodeSchemaInput = z.input<typeof discountCodeSchema>
export type DiscountCodeSchemaOutput = z.output<typeof discountCodeSchema>

export function parseDiscountCodeForm(
  input: unknown
):
  | { ok: true; data: DiscountCodeSchemaOutput }
  | { ok: false; error: string; field?: string } {
  const parsed = discountCodeSchema.safeParse(input)
  if (parsed.success) return { ok: true, data: parsed.data }
  const first = parsed.error.issues[0]
  return {
    ok: false,
    error: first?.message ?? 'Datos inválidos.',
    field: first?.path.join('.') || undefined,
  }
}
