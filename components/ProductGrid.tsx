'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/data'
import { Heart, Star } from 'lucide-react'

interface ProductGridProps {
  items: Product[]
}

export function ProductGrid({ items }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group cursor-pointer h-full flex flex-col relative"
        >
          {/* Outer Glow */}
          <div className="absolute -inset-4 bg-gradient-to-br from-accent/5 via-transparent to-accent-dark/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

          {/* Card Container */}
          <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent/10 group-hover:border-accent/30 group-hover:scale-[1.02] flex flex-col h-full">
            {/* Corner Decorations */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-[3rem] opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent-dark/20 to-transparent rounded-tr-[2.5rem] opacity-50"></div>

            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden">
              {/* Border Frame */}
              <div className="absolute inset-0 border-4 border-white/50 rounded-t-2xl z-10 pointer-events-none"></div>

              {/* Shimmer Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>

              {/* Product Image */}
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              />

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              {/* Badge with Glow */}
              {product.badge && (
                <div className="absolute top-3 left-3 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-dark rounded-xl blur-md opacity-75"></div>
                    <div className="relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent to-accent-dark text-white text-xs font-bold shadow-xl flex items-center gap-1.5 border border-white/20">
                      {product.badge}
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist Button */}
              <button className="absolute top-3 right-3 w-10 h-10 rounded-lg backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg z-20 border-2 bg-white/90 text-text hover:bg-accent hover:text-white border-white/50 hover:border-accent">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-4 bg-white relative">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

              {/* Category & Rating Row */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-accent/10 to-accent-dark/10 text-accent text-xs font-bold uppercase tracking-wider border border-accent/20">
                  {product.category}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-text mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-300 text-sm leading-tight">
                {product.title}
              </h3>

              {/* Price Section */}
              <div className="mt-auto pt-3 border-t border-border/50">
                <div className="mb-2">
                  <span className="text-xs text-text-muted block mb-0.5">Starting at</span>
                  <span className="text-xl font-bold text-text">${product.priceMin}.00</span>
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold">
                    In Stock
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
                    Free Ship
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-semibold">
                    {product.sizes?.length || 8} Sizes
                  </span>
                </div>

                {/* View Details Button */}
                <div className="w-full py-2 rounded-lg bg-accent/10 text-accent text-sm font-semibold text-center group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                  View Details
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

