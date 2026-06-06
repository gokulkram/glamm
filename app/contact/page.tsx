'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, Send, Instagram, MessageCircle, Facebook, Twitter } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container-max relative py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="text-sm font-medium text-accent">Get In Touch</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              We&apos;d Love to<br />
              <span className="gradient-text">Hear From You</span>
            </h1>
            <p className="text-lg text-text-muted">
              Have questions about our products? Need styling advice? Our team is here to help you find the perfect extensions for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="section container-max">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="card p-6 text-center hover:shadow-large transition-all duration-300 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold mb-2">Email Us</h3>
            <a href="mailto:support@glammhair.com" className="text-text-muted hover:text-accent transition-colors">support@glammhair.com</a>
          </div>
          <div className="card p-6 text-center hover:shadow-large transition-all duration-300 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold mb-2">Call Us</h3>
            <a href="tel:+15551234567" className="text-text-muted hover:text-accent transition-colors">+1 (555) 123-4567</a>
          </div>
          <div className="card p-6 text-center hover:shadow-large transition-all duration-300 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold mb-2">Visit Us</h3>
            <a href="https://maps.google.com" className="text-text-muted hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">123 Beauty Lane, Los Angeles, CA 90001</a>
          </div>
          <div className="card p-6 text-center hover:shadow-large transition-all duration-300 group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold mb-2">Business Hours</h3>
            <p className="text-text-muted">Mon-Fri: 9AM-6PM PST</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Send Us a Message</h2>
            </div>
            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-text-muted">Thank you for contacting us. We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2">Your Name *</label>
                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white outline-none focus:border-accent transition-colors" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2">Email Address *</label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white outline-none focus:border-accent transition-colors" placeholder="jane@example.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white outline-none focus:border-accent transition-colors" placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold mb-2">Subject *</label>
                  <select id="subject" name="subject" required value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white outline-none focus:border-accent transition-colors">
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="order-status">Order Status</option>
                    <option value="styling-advice">Styling Advice</option>
                    <option value="returns">Returns &amp; Exchanges</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">Your Message *</label>
                  <textarea id="message" name="message" required value={formData.message} onChange={handleChange} rows={6} className="w-full px-4 py-3 rounded-xl border-2 border-border bg-white outline-none focus:border-accent transition-colors resize-none" placeholder="Tell us how we can help you..." />
                </div>
                <button type="submit" className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Map Placeholder */}
            <div className="card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-accent mx-auto mb-3" />
                  <p className="text-text-muted font-medium">123 Beauty Lane</p>
                  <p className="text-text-muted">Los Angeles, CA 90001</p>
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
              <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
              <p className="text-text-muted mb-6">Stay connected for styling tips, new arrivals, and exclusive offers!</p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/glammhair_extenions" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-all hover:scale-110 hover:text-pink-500" aria-label="Instagram">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-all hover:scale-110 hover:text-blue-600" aria-label="Facebook">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-all hover:scale-110 hover:text-blue-400" aria-label="Twitter">
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

