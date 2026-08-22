import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, Send, Instagram, MessageCircle, Facebook, Twitter } from 'lucide-react'
import { getContact } from '@/lib/settings'
import ContactForm from './ContactForm'

export const dynamic = 'force-dynamic'

/** The four cards share everything but their icon and their body. */
function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 text-center hover:shadow-large transition-all duration-300 group">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      {children}
    </div>
  )
}

const infoLink = 'text-text-muted hover:text-accent transition-colors'

export default async function ContactPage() {
  const c = await getContact()

  // Stored bare so the admin form takes a plain address/number; the scheme is
  // added here. tel: keeps only digits and a leading +.
  const mailto = `mailto:${c.email}`
  const tel = `tel:${c.phone.replace(/[^\d+]/g, '')}`
  const address = [c.addressLine1, c.addressLine2].filter(Boolean).join(', ')

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container-max relative py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="text-sm font-medium text-accent">{c.eyebrow}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {c.headingTop}<br />
              <span className="gradient-text">{c.headingBottom}</span>
            </h1>
            <p className="text-lg text-text-muted">{c.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="section container-max">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <InfoCard icon={<Mail className="w-7 h-7 text-white" />} title={c.emailLabel}>
            <a href={mailto} className={infoLink}>{c.email}</a>
          </InfoCard>
          <InfoCard icon={<Phone className="w-7 h-7 text-white" />} title={c.phoneLabel}>
            <a href={tel} className={infoLink}>{c.phone}</a>
          </InfoCard>
          <InfoCard icon={<MapPin className="w-7 h-7 text-white" />} title={c.addressLabel}>
            <a href={c.mapsHref} className={infoLink} target="_blank" rel="noopener noreferrer">
              {address}
            </a>
          </InfoCard>
          <InfoCard icon={<Clock className="w-7 h-7 text-white" />} title={c.hoursLabel}>
            <p className="text-text-muted">{c.hours}</p>
          </InfoCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <ContactForm />

          {/* Right Column */}
          <div className="space-y-8">
            {/* Map Placeholder — the same address as the card above it, so the
                two can never disagree. */}
            <div className="card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-accent mx-auto mb-3" />
                  <p className="text-text-muted font-medium">{c.addressLine1}</p>
                  <p className="text-text-muted">{c.addressLine2}</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card p-8">
              <h3 className="text-2xl font-bold mb-6">Quick Links</h3>
              <div className="space-y-4">
                <Link href="/faq" className="flex items-center gap-3 text-text-muted hover:text-accent transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">FAQ</div>
                    <div className="text-sm">Find quick answers</div>
                  </div>
                </Link>
                <Link href="/how-to-use" className="flex items-center gap-3 text-text-muted hover:text-accent transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all"></div>
                  <div>
                    <div className="font-semibold">How To Use</div>
                    <div className="text-sm">Installation guides</div>
                  </div>
                </Link>
                <Link href="/shop" className="flex items-center gap-3 text-text-muted hover:text-accent transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Shop Extensions</div>
                    <div className="text-sm">Browse our collection</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Social Follow */}
            <div className="card p-8">
              <h3 className="text-2xl font-bold mb-6">{c.socialHeading}</h3>
              <p className="text-text-muted mb-6">{c.socialBlurb}</p>
              <div className="flex gap-4">
                <a href={c.instagramHref} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-all hover:scale-110 hover:text-pink-500" aria-label="Instagram">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href={c.facebookHref} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-all hover:scale-110 hover:text-blue-600" aria-label="Facebook">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href={c.twitterHref} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-all hover:scale-110 hover:text-blue-400" aria-label="Twitter">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
