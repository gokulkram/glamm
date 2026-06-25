'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, Phone, Mail, ArrowRight } from 'lucide-react'

export function FAQPagePromo() {
  return (
    <>
      {/* Top Banner */}
      <section className="relative h-[350px] overflow-hidden mb-16">
        <Image
          src="/lucy-photos/_F8A0427-Edit.jpg"
          alt="FAQ - Glamm Hair"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container-max">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                How Can We Help?
              </h1>
              <p className="text-xl text-white/90">
                Find answers to common questions about our hair extensions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gradient-to-br from-accent/5 via-background to-surface">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-text mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-text/70 max-w-2xl mx-auto">
              Our expert team is here to help you find the perfect hair extensions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: MessageCircle,
                title: 'Live Chat',
                description: 'Chat with our experts now',
                cta: 'Start Chat',
                href: '#chat'
              },
              {
                icon: Phone,
                title: 'Call Us',
                description: 'Mon-Fri 9am-6pm EST',
                cta: 'Call Now',
                href: 'tel:+1234567890'
              },
              {
                icon: Mail,
                title: 'Email Support',
                description: 'Response within 24 hours',
                cta: 'Send Email',
                href: 'mailto:support@glammhair.com'
              }
            ].map((contact, i) => (
              <div key={i} className="group text-center p-8 rounded-2xl bg-white border-2 border-accent/20 hover:border-accent/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 p-4 rounded-full bg-accent/10 w-fit mx-auto">
                  <contact.icon className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-text mb-2">{contact.title}</h3>
                <p className="text-text/70 mb-6">{contact.description}</p>
                <Link
                  href={contact.href}
                  className="inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all"
                >
                  <span>{contact.cta}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Image CTA */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/lucy-photos/_F8A0433-Edit.jpg"
                alt="Expert Hair Consultation"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-extrabold text-text leading-tight">
                Book a Free Consultation
              </h3>
              <p className="text-xl text-text/80 leading-relaxed">
                Not sure which extensions are right for you? Our hair experts will help you choose the perfect color, length, and texture for your needs.
              </p>
              <ul className="space-y-3">
                {[
                  'Personalized recommendations',
                  'Color matching expertise',
                  'Application guidance',
                  'Care & maintenance tips'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-text/90 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold text-lg shadow-xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105"
              >
                <span>Schedule Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
