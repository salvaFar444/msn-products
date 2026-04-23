import { z } from 'zod'

/**
 * Zod schema for the order form. Applied at the UI edge before
 * building the WhatsApp URL. All fields are required.
 */
export const orderFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Tu nombre debe tener al menos 3 caracteres.')
    .max(80, 'Nombre demasiado largo.'),
  city: z
    .string()
    .trim()
    .min(2, 'Ingresa una ciudad válida.')
    .max(60, 'Ciudad demasiado larga.'),
  neighborhood: z
    .string()
    .trim()
    .min(2, 'Ingresa un barrio válido.')
    .max(80, 'Barrio demasiado largo.'),
  address: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres.')
    .max(120, 'Dirección demasiado larga.'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Ingresa un número de 10 dígitos (solo números).'),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>
