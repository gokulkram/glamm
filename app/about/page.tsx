'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, TrendingUp, Award, Star, Users, Heart, Shield, CheckCircle2 } from 'lucide-react'

const stats = [
  { icon: TrendingUp, value: '10+', label: 'Years Experience' },
  { icon: Award, value: '100%', label: 'Virgin Hair' },
  { icon: Star, value: '4.9★', label: 'Average Rating' },
  { icon: Users, value: '10K+', label: 'Happy Customers' },
]

const values = [
  { icon: Award, title: 'Premium Quality', description: "Every product meets the same rigorous standards that built Lucy's salon and beauty supply reputation." },
  { icon: Heart, title: 'Customer First', description: "Your satisfaction is our priority. Lucy's hands-on experience means we truly understand what women need." },
  { icon: Shield, title: 'Reliability', description: 'Beautiful, reliable, long-lasting hair you can trust—backed by a decade of industry expertise.' },
  { icon: Sparkles, title: 'Confidence', description: 'Our mission is simple: to provide top-tier products that help every customer feel their best.' },
]

const timeline = [
  { year: '2014', title: 'The Beginning', description: 'Lucy started her career in the beauty industry with a small braiding business, driven by passion for helping women feel confident.' },
  { year: '2016', title: 'Salon Opening', description: 'The braiding business grew into a full trusted salon, known for exceptional service and attention to detail.' },
  { year: '2019', title: 'Beauty Supply Store', description: 'Expanding further, Lucy opened a beauty supply store offering quality products to her growing community.' },
  { year: '2024', title: 'Glamm Hair Extensions', description: 'After a decade of experience, Lucy launches her own luxury hair extension line—Glamm Hair Extensions.' },
]

const benefits = [
  'Premium 100% virgin human hair',
  'Decade of industry expertise behind every product',
  'Natural look and feel that blends seamlessly',
  'Long-lasting durability with proper care',
  'Can be styled, dyed, and heat-treated',
  'Exceptional customer service',
  'Quality control on every order',
  'Created by a woman, for women',
]

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden bg-gradient-to-br from-[#0a1121] via-[#1a2744] to-[#0a1121] text-white">
        <div className="absolute inset-0 bg-[url('/lucy-photos/_F8A0376-Edit.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        <div className="container-max relative py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-accent/30 mb-6">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Meet The Founder</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              About<br />
              <span className="gradient-text">Lucy Lomuro</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Over a decade of passion, dedication, and expertise in helping women feel confident and beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section container-max">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 hover:shadow-large transition-all duration-300">
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Lucy Photo + Story Section */}
      <section className="section bg-surface">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-large">
              <Image
                src="/lucy-lomuro.jpg"
                alt="Lucy Lomuro - Founder of Glamm Hair Extensions"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <h3 className="font-bold text-text">Lucy Lomuro</h3>
                  <p className="text-sm text-accent">Founder & CEO</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Heart className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">The Journey</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">From Passion to Purpose</h2>
              <div className="space-y-5 text-text-muted leading-relaxed">
                <p>Lucy began her career in the beauty industry in <strong className="text-text">2014</strong>, driven by a passion for helping women feel confident and beautiful. What started as a small braiding business quickly grew into a trusted salon and, eventually, a full beauty supply store known for quality products and exceptional service.</p>
                <p>Over the years, Lucy has worked hands-on with clients every day, mastering techniques, understanding what women truly need, and staying ahead of trends. Her dedication to professionalism, detail, and customer care has earned her a loyal community that continues to support her journey.</p>
                <p>Now, after more than a decade in the industry, Lucy is expanding again—introducing her own luxury hair extension line <strong className="text-text">Glamm Hair Extensions</strong>. Created with the same commitment to quality that built her salon and beauty supply, this new line is designed to give every woman beautiful, reliable, long-lasting hair she can trust.</p>
                <p className="text-lg font-semibold text-text border-l-4 border-accent pl-4 py-2 bg-accent/5 rounded-r-lg">Lucy's mission is simple: to provide top-tier products and an experience that helps every customer feel their best.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="section container-max">
        <div className="text-center mb-12">
          <h2 className="section-title">Our Values</h2>
          <p className="section-sub max-w-2xl mx-auto">These core principles guide everything we do, from sourcing to customer service.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, i) => (
            <div key={i} className="card p-8 text-center hover:shadow-large transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-text-muted leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lucy's Journey Timeline */}
      <section className="section bg-surface">
        <div className="container-max max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="section-title">Lucy's Journey</h2>
            <p className="section-sub">A decade of growth, learning, and dedication</p>
          </div>
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {item.year}
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-md border border-border">
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="section container-max">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Why Choose Glamm Hair?</h2>
            <p className="text-text-muted mb-6">Built on a decade of hands-on experience and a genuine understanding of what women need.</p>
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-text-muted">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-large">
            <Image
              src="/lucy-photos/_F8A0381-Edit.jpg"
              alt="Glamm Hair Extensions Quality"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container-max relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience the Glamm Difference?</h2>
            <p className="text-lg text-text-muted mb-8">Join the community of women who trust Lucy and Glamm Hair Extensions for beautiful, reliable hair.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/shop" className="btn btn-primary btn-lg">Shop Extensions</Link>
              <Link href="/contact" className="btn btn-ghost btn-lg">Contact Lucy</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

