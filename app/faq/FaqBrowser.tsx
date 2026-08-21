'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search, HelpCircle, Truck, Package, Scissors, RefreshCw } from 'lucide-react'
import { useShipping } from '@/contexts/ShippingContext'
import { fillShippingTokens, type Faq, type FaqCategory } from '@/lib/faq'

type Tab = 'all' | FaqCategory

// Fixed in code because each tab carries an icon; the counts come from the
// questions themselves so they can't drift once these are editable.
const TABS: { id: Tab; label: string; icon: typeof HelpCircle }[] = [
  { id: 'all', label: 'All', icon: HelpCircle },
  { id: 'shipping', label: 'Orders & Shipping', icon: Truck },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'care', label: 'Care & Styling', icon: Scissors },
  { id: 'returns', label: 'Returns', icon: RefreshCw },
]

export default function FaqBrowser({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Tab>('all')
  const { freeThreshold, standardRate } = useShipping()

  // {{freeThreshold}} / {{standardRate}} anywhere in an answer track the
  // admin-set rates, so a reworded question can't break the link the way
  // matching on exact question text used to.
  const resolved = faqs.map((f) => ({
    ...f,
    answer: fillShippingTokens(f.answer, { freeThreshold, standardRate }),
  }))

  const counts = TABS.map((tab) => ({
    ...tab,
    count: tab.id === 'all' ? faqs.length : faqs.filter((f) => f.category === tab.id).length,
  }))

  const filtered = resolved.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container-max relative py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="text-sm font-medium text-accent">Help Center</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Frequently Asked<br />
              <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg text-text-muted mb-8">
              Find answers to common questions about our products, shipping, and care instructions.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-full border-2 border-border bg-white text-base outline-none focus:border-accent transition-colors shadow-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section container-max">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {counts.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-medium'
                  : 'bg-surface border-2 border-border text-text hover:border-accent'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === cat.id ? 'bg-white/20' : 'bg-accent/10 text-accent'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filtered.length === 0 && (
            <p className="text-center text-text-muted">No questions match that search.</p>
          )}
          {filtered.map((faq) => {
            // Keyed on the question's own id rather than its position, so the
            // open one stays open while searching or switching tabs.
            const isOpen = openId === faq.id
            const categoryLabel = TABS.find((c) => c.id === faq.category)?.label || faq.category
            return (
              <div key={faq.id} className="card overflow-hidden hover:shadow-large transition-all duration-300">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <div className="flex-1 pr-4">
                    <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                      {categoryLabel}
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-accent flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-8 pb-6 text-text-muted leading-relaxed border-t border-border pt-6">
                    {faq.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="section relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-accent/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="container-max relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-lg text-text-muted mb-8">
              Our customer support team is here to help! Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact" className="btn btn-primary btn-lg">Contact Support</Link>
              <Link href="/shop" className="btn btn-ghost btn-lg">Shop Extensions</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
