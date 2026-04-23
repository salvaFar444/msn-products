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
          ease: 'easeInOut',
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
        <div className="hero-product-light-overlay" aria-hidden="true" />
        <div className="hero-product-img-wrapper">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 220px, (max-width: 1024px) 300px, 380px"
            className="hero-product-img"
            draggable={false}
          />
        </div>
      </motion.div>

      <motion.div
        className="hero-product-shadow"
        aria-hidden="true"
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
