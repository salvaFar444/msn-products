'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { formatCOP } from '@/lib/formatCurrency'
import type { Product } from '@/types'

interface Props {
  product: Product | null
}

export default function HeroProduct({ product }: Props) {
  const shouldReduce = useReducedMotion()

  if (!product) {
    return (
      <div className="hero-product-scene">
        <div className="hero-halo" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="hero-product-scene">
      {/* Halo de luz de fondo */}
      <motion.div
        className="hero-halo"
        aria-hidden="true"
        animate={
          shouldReduce
            ? undefined
            : {
              opacity: [0.35, 0.6, 0.35],
              scale: [1, 1.08, 1],
            }
        }
        transition={{
          duration: 4,
          timeout: 'easeInOut',
          repeat: Infinity,
        }}
      />

      <motion.div
        className="hero-product-float"
        animate={
          shouldReduce
            ? undefined
            : {
              y: [0, -20, 0],
              rotate: [0, 1.5, 0, -1.5, 0],
            }
        }
        transition={{
          duration: 4,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        {/* Eliminamos cualquier color de fondo aquí para evitar el recuadro */}
        <div className="hero-product-light-overlay" aria-hidden="true" style={{ background: 'none' }} />

        <div className="hero-product-img-wrapper" style={{ filter: 'none', boxShadow: 'none' }}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 220px, (max-width: 1024px) 300px, 380px"
            // La clave: drop-shadow sigue la forma del PNG. 
            // El primer valor es horizontal, el segundo vertical, el tercero el desenfoque y el último el color.
            style={{
              objectFit: 'contain',
              filter: 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.15))'
            }}
            className="hero-product-img"
            draggable={false}
          />
        </div>
      </motion.div>

      {/* Sombra de suelo (ajustada para ser circular/difuminada) */}
      <motion.div
        className="hero-product-shadow"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          width: '200px',
          height: '40px',
          margin: '0 auto',
          filter: 'blur(10px)',
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        animate={
          shouldReduce
            ? undefined
            : {
              scaleX: [1, 0.8, 1],
              opacity: [0.18, 0.08, 0.18],
            }
        }
        transition={{
          duration: 4,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      <motion.div
        className="hero-product-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {product.badge && (
          <span className="hero-product-card-badge">{product.badge}</span>
        )}
        <span className="hero-product-card-name">
          {product.shortName || product.name}
        </span>
        <span className="hero-product-card-price">
          {formatCOP(product.price)}
        </span>
      </motion.div>
    </div>
  )
}