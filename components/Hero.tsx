'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Award, Truck, Shield, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Hero() {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(true);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden py-20"
      style={{ background: 'linear-gradient(135deg, #0a1121 0%, #1a2744 100%)' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ transform: 'translateY(0px)' }}>
          <Image
            src="/lucy-photos/_F8A0531-Edit.jpg"
            alt="Glamm Hair Extensions - Premium Collection"
            fill
            sizes="100vw"
            className={`object-cover object-[center_30%] transition-all duration-1000 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            priority
          />
        </div>
        {/* Gradient Overlays - Reduced tint for more visible background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,17,33,0.55), rgba(10,17,33,0.2), rgba(10,17,33,0.55))' }}></div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,17,33,0.45), transparent, rgba(10,17,33,0.15))' }}></div>
        {/* Decorative Blurs */}
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30" style={{ background: '#f68961' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20" style={{ background: '#febf6b' }}></div>
      </div>

      {/* Content */}
      <div className="container-max relative z-10 pt-32 pb-20 w-full">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(246, 137, 97, 0.15)', border: '1px solid rgba(246, 137, 97, 0.4)' }}
          >
            <Star className="w-5 h-5 fill-current" style={{ color: '#febf6b' }} />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">100% Virgin Human Hair</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight">
              <span className="block text-white mb-3 drop-shadow-lg">Your Most Stunning</span>
              <span
                className="block drop-shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f68961, #febf6b, #ffc9a7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Look Starts Here
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light max-w-3xl mx-auto drop-shadow-md">
            Your Natural Beauty, Upgraded.
            <span className="block mt-3 font-medium drop-shadow-sm" style={{ color: '#ffc9a7' }}>
              Luxurious • Natural • Effortlessly Stunning
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-5 pt-6">
            <Link
              href="/shop"
              className="group px-10 py-5 rounded-full text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #f68961, #febf6b)' }}
            >
              <ShoppingBag className="w-6 h-6" />
              <span>Shop Collection</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="group px-10 py-5 rounded-full border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/15 hover:border-white/60 transition-all duration-300 flex items-center gap-3 backdrop-blur-md"
            >
              <span>Discover More</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 pt-16 max-w-3xl mx-auto border-t border-white/20">
            <div className="space-y-3">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full backdrop-blur-sm" style={{ background: 'rgba(246, 137, 97, 0.15)', border: '1px solid rgba(246, 137, 97, 0.3)' }}>
                  <Award className="w-7 h-7" style={{ color: '#febf6b' }} />
                </div>
              </div>
              <div className="text-4xl font-bold drop-shadow-md" style={{ color: '#f68961' }}>100%</div>
              <div className="text-xs text-white/70 font-medium uppercase tracking-wide">Premium Quality</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full backdrop-blur-sm" style={{ background: 'rgba(246, 137, 97, 0.15)', border: '1px solid rgba(246, 137, 97, 0.3)' }}>
                  <Truck className="w-7 h-7" style={{ color: '#febf6b' }} />
                </div>
              </div>
              <div className="text-4xl font-bold drop-shadow-md" style={{ color: '#f68961' }}>Free</div>
              <div className="text-xs text-white/70 font-medium uppercase tracking-wide">Shipping</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full backdrop-blur-sm" style={{ background: 'rgba(246, 137, 97, 0.15)', border: '1px solid rgba(246, 137, 97, 0.3)' }}>
                  <Shield className="w-7 h-7" style={{ color: '#febf6b' }} />
                </div>
              </div>
              <div className="text-4xl font-bold drop-shadow-md" style={{ color: '#f68961' }}>30 Day</div>
              <div className="text-xs text-white/70 font-medium uppercase tracking-wide">Guarantee</div>
            </div>
          </div>

          {/* Customer Avatars */}
          <div className="flex items-center justify-center gap-6 pt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-3 backdrop-blur-sm"
                  style={{ borderColor: '#0a1121', background: 'linear-gradient(135deg, rgba(246,137,97,0.5), rgba(254,191,107,0.5))' }}
                ></div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#febf6b' }} />
                ))}
              </div>
              <p className="text-sm text-white/80">
                <span className="font-semibold text-white">5,000+</span> Happy Customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/40 flex items-start justify-center p-2 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f68961' }}></div>
        </div>
      </div>
    </section>
  );
}

