'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useShipping } from '@/contexts/ShippingContext'
import { computeShipping, freeShippingRemaining } from '@/lib/checkout/shipping'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart()

  if (cart.length === 0) {
    return (
      <div className="section">
        <div className="container-max max-w-2xl text-center py-20">
          <ShoppingBag className="w-24 h-24 text-text-muted mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-bold text-text mb-4">Your Cart is Empty</h1>
          <p className="text-text-muted mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition-colors">
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  const shippingCfg = useShipping()
  const cartTotal = getCartTotal()
  const shipping = computeShipping(cartTotal, shippingCfg)
  const awayFromFree = freeShippingRemaining(cartTotal, shippingCfg)

  return (
    <div className="section">
      <div className="container-max">
        <h1 className="text-4xl font-bold text-text mb-8">Your Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border">
                <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-surface flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.slug}`} className="font-semibold text-text hover:text-accent">
                    {item.title}
                  </Link>
                  <p className="text-sm text-text-muted">Size: {item.size}</p>
                  <p className="text-accent font-bold">${item.selectedPrice}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>${shipping.toFixed(2)}</span>
                  )}
                </div>
                {awayFromFree > 0 && (
                  <p className="text-xs text-accent">
                    Add ${awayFromFree.toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-accent">${(cartTotal + shipping).toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition-colors"
              >
                Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/shop"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 mt-3 text-accent font-semibold hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

