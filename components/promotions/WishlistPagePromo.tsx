'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Gift, ArrowRight } from 'lucide-react'

export function WishlistPagePromo() {
  return (
    <>
      {/* Save & Share Banner */}
      <section className="py-16 bg-gradient-to-br from-accent/5 via-background to-surface">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30">
                <Heart className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-bold text-accent uppercase tracking-wider">Your Favorites</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold text-text leading-tight">
                Save Your Favorites & Share Your Wishlist
              </h2>

              <p className="text-xl text-text/80 leading-relaxed">
                Create the perfect collection of hair extensions you love. Share your wishlist with friends and family for special occasions.
              </p>

              <ul className="space-y-3">
                {[
                  'Save items for later purchase',
                  'Share with friends & family',
                  'Get notified of price drops',
                  'Perfect for gift registries'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-text/90 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold text-lg shadow-xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/lucy-photos/_F8A0475-Edit.jpg"
                alt="Wishlist Favorites"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Gift Registry Section */}
      <section className="py-20">
        <div className="container-max">
          <div className="bg-gradient-to-br from-accent/10 to-accent-dark/10 rounded-3xl p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/lucy-photos/_F8A0489-Edit.jpg"
                  alt="Gift Registry"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-full bg-white w-fit">
                  <Gift className="w-10 h-10 text-accent" />
                </div>

                <h3 className="text-3xl md:text-4xl font-extrabold text-text leading-tight">
                  Create a Gift Registry
                </h3>

                <p className="text-xl text-text/80 leading-relaxed">
                  Planning a special event? Create a gift registry and let your loved ones help you get the hair extensions you've been dreaming of.
                </p>

                <ul className="space-y-3">
                  {[
                    'Perfect for birthdays & holidays',
                    'Easy sharing with family & friends',
                    'Track purchased items',
                    'Add notes & preferences'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-text/90 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-accent/60 text-accent font-bold text-lg hover:bg-accent hover:text-white transition-all duration-300"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-20 bg-gradient-to-br from-surface via-background to-accent/5">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text mb-4">
              You Might Also Love
            </h2>
            <p className="text-xl text-text/70 max-w-2xl mx-auto">
              Discover more premium hair extensions handpicked for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { image: '_F8A0504-Edit.jpg', title: 'Luxury Volume' },
              { image: '_F8A0531-Edit.jpg', title: 'Natural Blend' },
              { image: '_F8A0536-Edit.jpg', title: 'Silky Smooth' }
            ].map((item, i) => (
              <div key={i} className="group relative h-[400px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <Image
                  src={`/lucy-photos/${item.image}`}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <button className="w-full px-6 py-3 rounded-full bg-white text-accent font-bold hover:bg-accent hover:text-white transition-all duration-300">
                    Add to Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold text-lg shadow-xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105"
            >
              <span>View All Products</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
