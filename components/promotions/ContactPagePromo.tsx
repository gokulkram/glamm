'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react'

export function ContactPagePromo() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-surface via-background to-accent/5 py-20">
      <div className="container-max">
        {/* Top Banner */}
        <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl mb-16">
          <Image
            src="/lucy-photos/_F8A0317-Edit.jpg"
            alt="Contact Glamm Hair"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="max-w-3xl space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Need Expert Hair Advice?
              </h2>
              <p className="text-xl md:text-2xl text-white/90 font-light">
                Our hair extension specialists are here to help you find the perfect match
              </p>
            </div>
          </div>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Phone,
              title: 'Call Us',
              description: 'Speak with our experts',
              action: 'Call Now',
              href: 'tel:+1234567890'
            },
            {
              icon: Mail,
              title: 'Email Us',
              description: 'Get a response within 24hrs',
              action: 'Send Email',
              href: 'mailto:info@glammhair.com'
            },
            {
              icon: MessageCircle,
              title: 'Live Chat',
              description: 'Instant support available',
              action: 'Start Chat',
              href: '#chat'
            }
          ].map((method, i) => (
            <div key={i} className="group relative p-8 rounded-2xl bg-white border-2 border-accent/20 hover:border-accent/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6 p-4 rounded-full bg-accent/10 w-fit">
                <method.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">{method.title}</h3>
              <p className="text-text/70 mb-6">{method.description}</p>
              <Link
                href={method.href}
                className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all"
              >
                <span>{method.action}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA with Image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-accent/10 to-accent-dark/10 rounded-3xl p-8 md:p-12">
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-extrabold text-text leading-tight">
              Book a Free Consultation
            </h3>
            <p className="text-lg text-text/80">
              Not sure which extensions are right for you? Schedule a free consultation with our hair experts and get personalized recommendations.
            </p>
            <ul className="space-y-3">
              {[
                'Personalized hair analysis',
                'Color matching assistance',
                'Application method guidance',
                'Maintenance tips & tricks'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-text/90 font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold text-lg shadow-xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105"
            >
              <span>Book Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/lucy-photos/_F8A0346-Edit.jpg"
              alt="Hair Consultation"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
