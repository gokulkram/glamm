'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Shield, Truck, RotateCcw, Star, ArrowRight } from 'lucide-react'

export function ProductPagePromo() {
  return (
    <>
      {/* Trust Badges */}
      <section className="py-12 bg-gradient-to-r from-accent/5 via-background to-accent/5">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: '100% Authentic',
                description: 'Virgin human hair'
              },
              {
                icon: Truck,
                title: 'Free Shipping',
                description: 'Orders over $100'
              },
              {
                icon: RotateCcw,
                title: '30-Day Returns',
                description: 'Money-back guarantee'
              },
              {
                icon: Star,
                title: '5-Star Rated',
                description: '5,000+ reviews'
              }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-4 p-6 rounded-xl bg-white shadow-md">
                <div className="p-3 rounded-full bg-accent/10">
                  <badge.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-text">{badge.title}</div>
                  <div className="text-sm text-text/70">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Style Section */}
      <section className="py-20">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/lucy-photos/_F8A0386-Edit.jpg"
                alt="How to Style Your Extensions"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-text leading-tight">
                Style with Confidence
              </h2>
              <p className="text-xl text-text/80 leading-relaxed">
                Our premium extensions are designed to be styled just like your natural hair. Heat style, color, and treat them with care for long-lasting beauty.
              </p>
              <ul className="space-y-4">
                {[
                  'Heat resistant up to 380°F',
                  'Can be colored and highlighted',
                  'Holds curls and styles beautifully',
                  'Wash and care like natural hair',
                  'Lasts 6-12 months with proper care'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-accent/10">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                    </div>
                    <span className="text-text/90 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-accent/60 text-accent font-bold text-lg hover:bg-accent hover:text-white transition-all duration-300"
              >
                <span>Need Styling Tips?</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Style Showcase */}
      <section className="py-20 bg-gradient-to-br from-surface via-background to-accent/5">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text mb-4">
              See the Transformation
            </h2>
            <p className="text-xl text-text/70 max-w-3xl mx-auto">
              Real results from real customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { image: '_F8A0391-Edit.jpg', title: 'Volume & Length' },
              { image: '_F8A0404-Edit.jpg', title: 'Natural Blend' },
              { image: '_F8A0421-Edit.jpg', title: 'Stunning Results' }
            ].map((item, i) => (
              <div key={i} className="group relative h-[400px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <Image
                  src={`/lucy-photos/${item.image}`}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products CTA */}
      <section className="py-20">
        <div className="container-max">
          <div className="bg-gradient-to-br from-accent/10 to-accent-dark/10 rounded-3xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text mb-6">
              Complete Your Look
            </h2>
            <p className="text-xl text-text/80 mb-8 max-w-2xl mx-auto">
              Explore our full collection of premium hair extensions and find your perfect match
            </p>
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
