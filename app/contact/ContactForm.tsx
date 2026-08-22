'use client'

import { useState } from 'react'
import { Send, Loader2, MessageCircle } from 'lucide-react'

/**
 * The "Send Us a Message" form. Split out of the page so the page itself can
 * be a server component and read its copy from settings — this is the only
 * part that needs to be interactive.
 */
export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    company: '', // honeypot — must stay empty
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not send your message. Please try again.')
        return
      }
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', company: '' })
    } catch {
      setError('Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
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
          {/* Honeypot: hidden from real users, catches bots */}
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <button
            type="submit"
            disabled={sending}
            className="w-full btn btn-primary btn-lg flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
