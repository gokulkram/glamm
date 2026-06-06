'use client'

import Image from 'next/image'
import { Shield, Lock, CreditCard, Truck } from 'lucide-react'

export function CheckoutPagePromo() {
  return (
    <>
      {/* Security Banner */}
      <section className="py-6 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10">
        <div className="container-max">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              {
                icon: Lock,
                text: 'Secure SSL Encryption'
              },
              {
                icon: Shield,
                text: '100% Safe & Secure'
              },
              {
                icon: CreditCard,
                text: 'Multiple Payment Options'
              },
              {
                icon: Truck,
                text: 'Free Shipping Over $100'
              }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="font-bold text-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sidebar Trust Section */}
      <div className="space-y-6">
        {/* Order Summary Image */}
        <div className="relative h-[300px] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/lucy-photos/_F8A0291-Edit.jpg"
            alt="Premium Hair Extensions"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Premium Quality Guaranteed
            </h3>
            <p className="text-white/90">
              100% Virgin Human Hair
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-text text-lg mb-4">Why Shop With Us</h4>
          {[
            'Free shipping on orders over $100',
            '30-day money-back guarantee',
            'Secure payment processing',
            'Expert customer support',
            'Premium quality assurance'
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 p-1 rounded-full bg-accent/20">
                <Shield className="w-3 h-3 text-accent" />
              </div>
              <span className="text-text/90 text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>

        {/* Satisfaction Guarantee */}
        <div className="bg-white rounded-2xl p-6 border-2 border-accent/20 shadow-md">
          <div className="text-center space-y-3">
            <div className="p-3 rounded-full bg-accent/10 w-fit mx-auto">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h4 className="font-bold text-text text-lg">
              100% Satisfaction Guarantee
            </h4>
            <p className="text-text/70 text-sm">
              Not happy? Return within 30 days for a full refund.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
