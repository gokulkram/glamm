import Image from 'next/image'
import { Shield, Lock, CreditCard, Sparkles, Check } from 'lucide-react'

export function CheckoutHero() {
  return (
    <section className="relative h-[350px] md:h-[450px] overflow-hidden">
      {/* Animated gradient background with shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-accent/20 animate-gradient-xy"></div>
      
      {/* Lucy photo background */}
      <div className="absolute inset-0">
        <Image
          src="/lucy-photos/_F8A0427-Edit.jpg"
          alt="Secure Checkout"
          fill
          sizes="100vw"
          className="object-cover opacity-30"
          priority
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85"></div>
      
      {/* Floating security icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Shield className="absolute top-24 left-[12%] w-10 h-10 text-emerald-300/30 animate-float" style={{animationDelay: '0s'}} />
        <Lock className="absolute top-36 right-[18%] w-8 h-8 text-teal-300/25 animate-float" style={{animationDelay: '1.5s'}} />
        <CreditCard className="absolute bottom-28 left-[25%] w-12 h-12 text-emerald-300/20 animate-float" style={{animationDelay: '0.8s'}} />
        <Sparkles className="absolute top-28 right-[30%] w-7 h-7 text-accent/30 animate-pulse" />
      </div>
      
      <div className="container-max relative h-full flex items-center">
        <div className="max-w-3xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md border border-white/30 mb-6 animate-fade-in-up">
            <Lock className="w-5 h-5 text-emerald-300" />
            <span className="text-sm font-medium">Secure Checkout</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Complete Your
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-accent bg-clip-text text-transparent">
              Dream Look
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Your order is protected with 256-bit SSL encryption. Safe, secure, and ready to transform your style.
          </p>
          
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Shield className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <Check className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-medium">SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

