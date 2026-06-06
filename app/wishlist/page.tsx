'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowRight, Trash2, ShoppingCart } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { products } from '@/lib/data'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (wishlist.length === 0) {
    return (
      <div className="section">
        <div className="container-max max-w-2xl text-center py-20">
          <Heart className="w-24 h-24 text-text-muted mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-bold text-text mb-4">Your Wishlist is Empty</h1>
          <p className="text-text-muted mb-8">
            Save your favorite items to your wishlist and shop them later.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition-colors">
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="container-max">
        <h1 className="text-4xl font-bold text-text mb-8">Your Wishlist</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const fullProduct = products.find(p => p.id === item.id)
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden group">
                <div className="relative aspect-[3/4] bg-surface">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <Link href={`/products/${item.slug}`} className="font-semibold text-text hover:text-accent block mb-1">
                    {item.title}
                  </Link>
                  <p className="text-sm text-text-muted capitalize mb-2">{item.category}</p>
                  <p className="text-accent font-bold mb-4">${item.priceMin} - ${item.priceMax}</p>
                  <Link
                    href={`/products/${item.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View Product
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

