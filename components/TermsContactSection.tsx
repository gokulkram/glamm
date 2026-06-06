'use client'

import { useState } from 'react'
import { Phone, MessageSquare, Send } from 'lucide-react'

// Phone number is a placeholder — replace with the real Glamm Hair number.
const PHONE = '+15551234567'

function CallTextButtons() {
  return (
    <div className="flex gap-3">
      <a
        href={`tel:${PHONE}`}
        className="inline-flex items-center gap-2 px-5 py-2 bg-[#111] text-white !text-white no-underline hover:!no-underline hover:bg-black text-xs font-bold uppercase tracking-widest rounded transition-colors"
      >
        <Phone className="w-3.5 h-3.5" />
        Call
      </a>
      <a
        href={`sms:${PHONE}`}
        className="inline-flex items-center gap-2 px-5 py-2 bg-[#111] text-white !text-white no-underline hover:!no-underline hover:bg-black text-xs font-bold uppercase tracking-widest rounded transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Text
      </a>
    </div>
  )
}

export default function TermsContactSection() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', email: '', message: '' })
    }, 4000)
  }

  return (
    <div className="not-prose mt-8 grid md:grid-cols-2 gap-10 border-t border-border pt-10">
      {/* Left: urgent contact hours */}
      <div className="space-y-6 text-text">
        <p className="font-medium">For urgent matters on business days, please:</p>

        <div className="space-y-3">
          <p className="text-text-muted">9:30 a.m. to 4:30 p.m. ET</p>
          <CallTextButtons />
        </div>

        <hr className="border-border" />

        <div className="space-y-3">
          <p className="text-text-muted">9:00 p.m. to 4:30 a.m. ET (next day)</p>
          <CallTextButtons />
        </div>

        <div>
          <p className="font-bold">Non business days (weekends/holidays):</p>
          <p className="text-text-muted">
            Please <strong>TEXT</strong> only. No phone calls are answered.
          </p>
        </div>
      </div>

      {/* Right: contact form */}
      <div>
        <div className="mb-6">
          <p className="font-bold">Non business days (weekends/holidays):</p>
          <p className="text-text-muted text-sm">
            Please <strong>TEXT</strong> only. No phone calls are answered.
          </p>
        </div>

        {submitted ? (
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
              <Send className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-1">Message Sent!</h3>
            <p className="text-text-muted text-sm">Thank you for contacting us. We will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="terms-name" className="block text-xs font-bold uppercase tracking-widest mb-2">Name</label>
              <input
                id="terms-name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-white outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="terms-email" className="block text-xs font-bold uppercase tracking-widest mb-2">Email</label>
              <input
                id="terms-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-white outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="terms-message" className="block text-xs font-bold uppercase tracking-widest mb-2">Message</label>
              <textarea
                id="terms-message"
                name="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-white outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#111] text-white hover:bg-black text-xs font-bold uppercase tracking-widest rounded transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
