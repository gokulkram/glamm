import Image from 'next/image'
import { Star, Award, Sparkles, TrendingUp } from 'lucide-react'

interface ProductDetailHeroProps {
  title: string
  category: string
  rating?: number
  reviews?: number
}

export function ProductDetailHero({ title, category, rating = 5, reviews = 0 }: ProductDetailHeroProps) {
  return (
    <section className="relative h-[300px] md:h-[400px] overflow-hidden">
      {/* Multi-layered animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-accent/20 animate-gradient-xy"></div>
      
      {/* Triple Lucy photo grid background */}
      <div className="absolute inset-0 grid grid-cols-3 opacity-25">
        <div className="relative">
          <Image
            src="/lucy-photos/_F8A0433-Edit.jpg"
            alt="Product showcase"
            fill
            sizes="33vw"
            className="object-cover"
          />
        </div>
        <div className="relative">
          <Image
            src="/lucy-photos/_F8A0475-Edit.jpg"
            alt="Product showcase"
            fill
            sizes="33vw"
            className="object-cover"
          />
        </div>
        <div className="relative">
          <Image
            src="/lucy-photos/_F8A0489-Edit.jpg"
            alt="Product showcase"
            fill
            sizes="33vw"
            className="object-cover"
          />
        </div>
      </div>
      
      {/* Gradient overlay with shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/90"></div>
      <div className="absolute inset-0 animate-shimmer"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-[8%] w-8 h-8 text-amber-300/40 fill-amber-300/40 animate-float" style={{animationDelay: '0s'}} />
        <Award className="absolute top-32 right-[12%] w-10 h-10 text-purple-300/30 animate-float" style={{animationDelay: '1s'}} />
        <Sparkles className="absolute bottom-24 left-[15%] w-7 h-7 text-pink-300/35 animate-float" style={{animationDelay: '2s'}} />
        <TrendingUp className="absolute top-28 right-[20%] w-9 h-9 text-accent/30 animate-pulse" />
        <Star className="absolute bottom-32 right-[25%] w-6 h-6 text-amber-300/30 fill-amber-300/30 animate-float" style={{animationDelay: '1.5s'}} />
      </div>
      
      <div className="container-max relative h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/30 mb-5 animate-fade-in-up">
            <Award className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-medium uppercase tracking-wider">{category}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          {/* Rating display */}
          {reviews > 0 && (
            <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/80 text-sm">
                {rating.toFixed(1)} ({reviews} reviews)
              </span>
            </div>
          )}
          
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            Premium quality • 100% virgin human hair • Ethically sourced
          </p>
        </div>
      </div>
    </section>
  )
}

