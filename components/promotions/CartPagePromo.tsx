'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Shield, Truck, RotateCcw, CreditCard, ArrowRight } from 'lucide-react'

export function CartPagePromo() {
  return (
    <>
      {/* Trust Badges */}
      <section className="py-8 bg-gradient-to-r from-accent/5 via-background to-accent/5">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Shield,
                title: 'Secure Checkout',
                description: 'SSL encrypted'
              },
              {
                icon: Truck,
                title: 'Free Shipping',
                description: 'Orders $100+'
              },
              {
                icon: RotateCcw,
                title: 'Easy Returns',
                description: '30-day policy'
              },
              {
                icon: CreditCard,
                title: 'Safe Payment',
                description: 'Multiple options'
              }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-white shadow-md">
                <div className="p-2 rounded-full bg-accent/10">
                  <badge.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="text-center md:text-left">
                  <div className="font-bold text-text text-sm">{badge.title}</div>
                  <div className="text-xs text-text/70">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Your Look */}
      <section className="py-16">
        <div className="container-max">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text mb-3">
              Complete Your Look
            </h2>
            <p className="text-lg text-text/70">
              Customers who bought these items also loved...
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { image: '_F8A0262-Edit.jpg', title: 'Silky Straight', price: '$199.00' },
              { image: '_F8A0263-Edit.jpg', title: 'Natural Wave', price: '$229.00' },
              { image: '_F8A0287-Edit.jpg', title: 'Luxury Volume', price: '$249.00' }
            ].map((product, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-[350px]">
                  <Image
                    src={`/lucy-photos/${product.image}`}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{product.price}</span>
                    <button className="px-6 py-2 rounded-full bg-white text-accent font-bold hover:bg-accent hover:text-white transition-all duration-300">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-surface via-background to-accent/5">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/lucy-photos/_F8A0333-Edit.jpg"
                alt="Premium Quality Hair"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-text leading-tight">
                Why Thousands Choose Glamm Hair
              </h2>
              <p className="text-xl text-text/80 leading-relaxed">
                We're committed to providing the highest quality hair extensions and exceptional customer service.
              </p>
              <ul className="space-y-4">
                {[
                  '100% Virgin Human Hair - Ethically sourced',
                  'Premium Quality Control - Every strand inspected',
                  'Natural Look & Feel - Blends seamlessly',
                  'Long-Lasting - Up to 12 months with care',
                  'Expert Support - Hair specialists available 24/7'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-accent/10">
                      <Shield className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-text/90 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-accent/60 text-accent font-bold text-lg hover:bg-accent hover:text-white transition-all duration-300"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Satisfaction Guarantee */}
      <section className="py-16">
        <div className="container-max">
          <div className="bg-gradient-to-br from-accent/10 to-accent-dark/10 rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-4 rounded-full bg-white w-fit mx-auto">
                <Shield className="w-12 h-12 text-accent" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text">
                100% Satisfaction Guarantee
              </h2>
              <p className="text-xl text-text/80 leading-relaxed">
                We stand behind our products. If you're not completely satisfied with your purchase, return it within 30 days for a full refund. No questions asked.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all"
                >
                  <span>View Return Policy</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
