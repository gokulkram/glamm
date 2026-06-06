import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import { LucyGallery } from '@/components/LucyGallery'
import { products, categories } from '@/lib/data'
import { BadgeCheck, Package, ShieldCheck, Heart, Star, Mail, Gift, Instagram, Quote } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Glamm Hair Extensions | Premium 100% Virgin Human Hair | Free Shipping',
  description: 'Discover luxury hair extensions at Glamm. Premium 100% virgin human hair in wavy, straight, curly styles & HD closures. Free shipping, 30-day returns.',
}

const testimonials = [
  { name: 'Best hair I’ve ever bought!', initial: 'B', quote: "Soft, full, and zero shedding. I’m obsessed." },
  { name: 'My man thought it was my real hair.', initial: 'M', quote: "And honestly… I didn’t correct him." },
  { name: 'Installed it twice and it still looks new.', initial: 'I', quote: "Quality is crazy good." },
  { name: 'I got compliments before I even sat down.', initial: 'C', quote: "This hair is THAT girl." },
  { name: 'Shipping was fast and the hair is gorgeous.', initial: 'S', quote: "10/10 experience." },
  { name: 'I’m a stylist and I recommend this brand now.', initial: 'R', quote: "Clients love it every time." },
  { name: 'The curls stayed popping all week.', initial: 'T', quote: "No frizz, no drama." },
  { name: 'I was scared to try a new brand… now I’m loyal.', initial: 'L', quote: "Glamm Hair won me over." },
  { name: 'Feels like butter, looks like luxury.', initial: 'F', quote: "I’m not buying hair anywhere else." },
]

export default function Home() {
  return (
    <>
      <Hero />

      {/* Products Section */}
      <section className="section container-max">
        <div className="text-center mb-12">
          <h2 className="section-title">OUR TOP PICKS</h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">FOR EVERY VIBE</h3>
          <p className="section-sub max-w-3xl mx-auto">
            Whether you&apos;re feeling those bouncy curls, sleek straight locks, or effortless waves, we&apos;ve got your dream hair covered. These are our best sellers for a reason, because they bring the glam every time!
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link href="/shop" className="px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent-dark transition-colors">
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="px-6 py-3 rounded-full border-2 border-accent text-accent font-semibold hover:bg-accent hover:text-white transition-all"
            >
              {cat.name} <span className="text-sm opacity-75">({cat.count})</span>
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop" className="btn btn-primary btn-lg">
            Browse All Extensions
          </Link>
        </div>
      </section>

      {/* Why Glamm Hair Section */}
      <section className="section container-max">
        <div className="text-center mb-16">
          <h2 className="section-title">Why Glamm Hair?</h2>
          <p className="section-sub max-w-2xl mx-auto">
            Because you deserve hair that keeps up. Work, brunch, date night, repeat.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {[
            { icon: BadgeCheck, title: 'Premium Quality', desc: '100% virgin human hair sourced ethically from trusted suppliers' },
            { icon: Package, title: 'Free Shipping', desc: 'Free standard shipping on all orders over $100' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: 'Safe and secure checkout with multiple payment options' },
            { icon: Heart, title: 'Customer Love', desc: 'Join thousands of satisfied customers who trust Glamm Hair' },
          ].map((feature, i) => (
            <div key={i} className="card p-8 text-center hover:shadow-large transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <feature.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="section container-max">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/lucy-photos/_F8A0400-Edit.jpg"
              alt="Beautiful hair transformation"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              More Volume. More You.{' '}
              <span className="gradient-text">The confidence boost you&apos;ve been missing</span>
            </h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Our curly extensions aren&apos;t just about style, they&apos;re about transformation. Many of our customers shared that they felt less insecure about thin hair and experienced a major self esteem boost after wearing our extensions.💫
            </p>
            <p className="text-text-muted leading-relaxed mb-8">
              Expect volume, length, and a natural blend so seamless, no one will know it&apos;s not your own. These curls don&apos;t just turn heads, they turn moods around.
            </p>
            <div className="flex gap-4">
              <Link href="/shop" className="btn btn-primary">Shop Now</Link>
              <Link href="/about" className="btn btn-secondary">Read More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="section container-max">
        <div className="text-center mb-12">
          <h2 className="section-title">See The Glamm Difference</h2>
          <p className="section-sub max-w-2xl mx-auto mb-8">
            Real hair, real transformations, real confidence. Join thousands of women who&apos;ve discovered their perfect look with Glamm.
          </p>
        </div>
        <div className="card p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Follow Us on Instagram</h3>
          <p className="text-accent font-medium mb-4">@glammhair_extenions</p>
          <p className="text-text-muted mb-6">Get daily inspiration, behind-the-scenes content, styling tips, and see our latest hair transformations!</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="px-4 py-2 rounded-full bg-background text-sm">Daily Updates</span>
            <span className="px-4 py-2 rounded-full bg-background text-sm">Styling Tips</span>
            <span className="px-4 py-2 rounded-full bg-background text-sm">Client Transformations</span>
            <span className="px-4 py-2 rounded-full bg-background text-sm">Exclusive Offers</span>
          </div>
          <a href="https://www.instagram.com/glammhair_extenions" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <Instagram className="w-5 h-5" />
            Follow @glammhair_extenions
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section container-max">
        <div className="text-center mb-16">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-sub max-w-2xl mx-auto">
            Join thousands of happy customers who&apos;ve transformed their look with Glamm Hair
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="card p-8 hover:shadow-large transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <Quote className="w-10 h-10 text-accent/20 mb-4" />
              <blockquote className="text-text-muted leading-relaxed mb-6">&quot;{t.quote}&quot;</blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold">
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-accent flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Purchase
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass">
            <Star className="w-5 h-5 fill-accent text-accent" />
            <span className="font-semibold">4.9/5</span>
            <span className="text-text-muted">from 5,000+ reviews</span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="container-max relative">
          <div className="max-w-4xl mx-auto">
            <div className="card p-12 md:p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h2 className="section-title mb-4">Get Styling Guides & Exclusive Drops</h2>
              <p className="section-sub max-w-2xl mx-auto mb-8">
                Join our community and be the first to know about new arrivals, exclusive offers, and expert hair care tips. Plus, get 15% off your first order!
              </p>
              <form className="max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-border bg-white text-sm outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary whitespace-nowrap">
                    <Gift className="w-4 h-4" />
                    Get 15% Off
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-4">No spam, only beautiful hair. Unsubscribe anytime.</p>
              </form>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark border-2 border-white" />
                    ))}
                  </div>
                  <span>10K+ subscribers</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-border" />
                <div className="hidden sm:flex items-center gap-2">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span>4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lucy Gallery Section */}
      <LucyGallery />
    </>
  )
}

