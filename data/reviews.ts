/**
 * Local customer reviews — fictional names, replace with real ones when available.
 * Kept in this file for easy editing without touching components.
 */
export interface Review {
  name: string
  location: string
  text: string
  stars: 1 | 2 | 3 | 4 | 5
}

export const REVIEWS: Review[] = [
  {
    name: 'Laura Martínez',
    location: 'Montería, Córdoba',
    text:
      'Pedí unos audífonos y me los trajeron el mismo día a mi casa en El Recreo. Pagué cuando los recibí, todo perfecto. ¡Buenísimo el servicio!',
    stars: 5,
  },
  {
    name: 'Andrés Naranjo',
    location: 'Montería, Córdoba',
    text:
      'La atención por WhatsApp es rapidísima. Me resolvieron todas las dudas antes de comprar y el producto llegó en excelente estado. 100% recomendados.',
    stars: 5,
  },
  {
    name: 'Valentina Guerra',
    location: 'Cereté, Córdoba',
    text:
      'Desde Cereté hice mi pedido y llegó sin problema. Me encantó que pudiera pagar contra entrega, eso me dio mucha confianza. Ya pedí por segunda vez.',
    stars: 5,
  },
]
