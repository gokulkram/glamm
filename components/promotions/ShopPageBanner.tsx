'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Sparkles } from 'lucide-react'

export function ShopPageBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-accent/5 via-background to-accent/10 py-16 md:py-20">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
            <Image
              src="/lucy-photos/_F8A0400-Edit.jpg"
              alt="Premium Hair Extensions Collection"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Floating Badge */}
            <div className="absolute top-8 left-8 px-6 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent fill-accent" />
                <span className="font-bold text-accent uppercase tracking-wider text-sm">New Arrivals</span>
              </div>
            </div>

            {/* Bottom Text Overlay */}
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Luxury Collection
              </h3>
              <p className="text-white/90 text-lg">
                Premium virgin hair extensions
              </p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-bold text-accent uppercase tracking-wider">Limited Time Offer</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="block text-text mb-2">Get 20% Off</span>
              <span className="block bg-gradient-to-r from-accent via-accent-dark to-accent bg-clip-text text-transparent">
                Your First Order
              </span>
            </h2>

            <p className="text-xl text-text/80 leading-relaxed">
              Transform your look with our premium collection of 100% virgin human hair extensions. 
              <span className="block mt-2 font-semibold text-accent">Free shipping on orders over $100.</span>
            </p>

            <ul className="space-y-4 pt-4">
              {[
                'Premium Quality - 100% Virgin Human Hair',
                'Natural Look - Blends Seamlessly',
                'Long Lasting - Up to 12 Months',
                'Easy Application - Professional Results'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-accent/10">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                  </div>
                  <span className="text-text/90 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-6">
              <Link
                href="/shop"
                className="group px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold text-lg shadow-xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/contact"
                className="px-8 py-4 rounded-full border-2 border-accent/60 text-accent font-bold text-lg hover:bg-accent hover:text-white transition-all duration-300 flex items-center gap-3"
              >
                <span>Get Expert Advice</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
