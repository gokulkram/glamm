'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Search, HelpCircle, Truck, Package, Scissors, RefreshCw } from 'lucide-react'

type Category = 'all' | 'shipping' | 'products' | 'care' | 'returns'

const categories = [
  { id: 'all' as Category, label: 'All', icon: HelpCircle, count: 24 },
  { id: 'shipping' as Category, label: 'Orders & Shipping', icon: Truck, count: 6 },
  { id: 'products' as Category, label: 'Products', icon: Package, count: 8 },
  { id: 'care' as Category, label: 'Care & Styling', icon: Scissors, count: 6 },
  { id: 'returns' as Category, label: 'Returns', icon: RefreshCw, count: 4 },
]

const faqs = [
  // Products (8)
  { category: 'products', q: 'What type of hair do you use for your extensions?', a: 'We use 100% virgin human hair sourced ethically from trusted suppliers. Our hair has never been chemically processed, dyed, or treated, ensuring the highest quality and most natural look. Each bundle is carefully inspected to meet our rigorous standards.' },
  { category: 'products', q: 'How long do the extensions last?', a: 'With proper care, our extensions can last 6-12 months or even longer. The lifespan depends on how well you maintain them, how often you wear them, and your styling habits. We provide detailed care instructions with every purchase to help you maximize their longevity.' },
  { category: 'products', q: 'Can I dye or color the extensions?', a: 'Yes! Since our extensions are made from 100% virgin human hair, you can dye, bleach, or color them just like your natural hair. However, we recommend having this done by a professional stylist to ensure the best results and to avoid damage.' },
  { category: 'products', q: "What's the difference between the different curl patterns?", a: 'Each curl pattern offers a unique look: Body Wave has loose, flowing S-shaped waves; Deep Wave features more defined, glamorous waves; Indian Curl has tight, bouncy ringlets; Italian Curly offers medium curls with a silky finish; and Burmese Curl provides beautiful defined curls with volume.' },
  { category: 'products', q: 'How do I choose the right length?', a: 'Consider your desired final look and your natural hair length. For reference: 12-14" reaches shoulder length, 16-18" reaches mid-back, 20-22" reaches lower back, and 24"+ reaches waist length. We recommend ordering 2-3 bundles for a full, natural look.' },
  { category: 'products', q: 'Are the extensions suitable for all hair types?', a: 'Yes! Our extensions work beautifully with all hair types and textures. We offer various textures (straight, wavy, curly) to match your natural hair or create your desired look. Our customer service team can help you choose the best match for your hair.' },
  { category: 'products', q: 'What are closures and frontals used for?', a: "Closures (4x4, 2x6) and frontals (13x4) are lace pieces that create a natural-looking scalp and hairline. They're installed at the crown or front of your head to complete your sew-in or wig, allowing for versatile parting and a seamless, undetectable finish." },
  { category: 'products', q: 'How many bundles do I need?', a: 'For lengths 10-18", we recommend 2-3 bundles. For 20-24", use 3-4 bundles. For 26"+ or very full looks, consider 4-5 bundles. Add a closure or frontal for complete coverage. Your stylist can provide personalized recommendations based on your desired style.' },
  // Orders & Shipping (6)
  { category: 'shipping', q: 'How long does shipping take?', a: "Standard shipping takes 3-5 business days within the US. Express shipping (1-2 business days) is available at checkout. International shipping times vary by location (7-14 business days). You'll receive a tracking number once your order ships." },
  { category: 'shipping', q: 'Do you offer free shipping?', a: 'Yes! We offer free standard shipping on all orders over $100 within the United States. For orders under $100, standard shipping is $8.99. Express shipping is available for an additional fee.' },
  { category: 'shipping', q: 'Can I track my order?', a: "Absolutely! Once your order ships, you'll receive an email with a tracking number. You can use this to track your package in real-time. You can also log into your account on our website to view your order status and tracking information." },
  { category: 'shipping', q: 'Do you ship internationally?', a: 'Yes, we ship to most countries worldwide! International shipping costs and delivery times vary by location. Customs fees and import duties may apply and are the responsibility of the customer. Contact us for specific shipping information for your country.' },
  { category: 'shipping', q: 'What if my package is lost or damaged?', a: "If your package is lost in transit or arrives damaged, please contact us immediately at support@glammhair.com with your order number and photos (if damaged). We'll work with the carrier to resolve the issue and ensure you receive your extensions." },
  { category: 'shipping', q: 'Can I change my shipping address after ordering?', a: "If your order hasn't shipped yet, we can update your address. Please contact us as soon as possible at support@glammhair.com with your order number and new address. Once shipped, we cannot modify the delivery address." },
  // Care & Styling (6)
  { category: 'care', q: 'How do I wash my extensions?', a: 'Wash your extensions every 10-15 wears or when product buildup occurs. Use sulfate-free shampoo and conditioner, wash in lukewarm water in a downward motion, and avoid rubbing or twisting. Gently squeeze out excess water and air dry on a towel or wig stand.' },
  { category: 'care', q: 'Can I use heat styling tools?', a: 'Yes! Our virgin human hair can be heat styled just like your natural hair. Always use a heat protectant spray and keep temperatures below 350°F (180°C) to prevent damage. Lower heat settings are better for longevity.' },
  { category: 'care', q: 'How should I store my extensions?', a: "Store extensions in a cool, dry place away from direct sunlight. For clip-ins, hang them or lay flat in their original packaging. For bundles, store in a silk or satin bag. Ensure they're completely dry before storing to prevent mildew." },
  { category: 'care', q: 'What products should I use?', a: 'Use sulfate-free, alcohol-free products designed for color-treated or natural hair. Avoid heavy oils and silicones that cause buildup. We recommend leave-in conditioners, heat protectants, and light serums for shine. Avoid products with harsh chemicals.' },
  { category: 'care', q: 'How do I prevent tangling?', a: 'Brush extensions daily with a wide-tooth comb or loop brush, starting from the ends and working up. Sleep with hair in a loose braid or ponytail on a silk pillowcase. Avoid excessive product buildup and wash regularly to maintain smoothness.' },
  { category: 'care', q: 'Can I swim with my extensions?', a: 'While possible, we recommend avoiding chlorine and salt water as they can dry out and damage the hair. If you must swim, wet the hair first with clean water, apply leave-in conditioner, and braid it. Wash thoroughly with clarifying shampoo afterward.' },
  // Returns (4)
  { category: 'returns', q: 'What is your return policy?', a: "We offer a 30-day satisfaction guarantee. If you're not completely satisfied, you can return unopened, unused bundles in their original packaging for a full refund. Hair must be in resalable condition with all tags attached." },
  { category: 'returns', q: 'How do I initiate a return?', a: "Contact our customer service team at support@glammhair.com with your order number and reason for return. We'll provide a return authorization number and instructions. Once we receive and inspect the return, we'll process your refund within 5-7 business days." },
  { category: 'returns', q: 'Are there any items that cannot be returned?', a: 'For hygiene reasons, we cannot accept returns on opened bundles, closures, or frontals. Custom-colored or specially ordered items are also non-returnable. All sale and clearance items are final sale.' },
  { category: 'returns', q: 'Do you offer exchanges?', a: "Yes! If you need a different length, texture, or quantity, we're happy to exchange unopened items within 30 days. Contact us to arrange an exchange. You'll receive a prepaid return label, and we'll ship your new items once we receive the return." },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = searchQuery === '' ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
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
          {categories.map((cat) => (
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
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === cat.id ? 'bg-white/20' : 'bg-accent/10 text-accent'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index
            const categoryLabel = categories.find(c => c.id === faq.category)?.label || faq.category
            return (
              <div key={index} className="card overflow-hidden hover:shadow-large transition-all duration-300">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <div className="flex-1 pr-4">
                    <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                      {categoryLabel}
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-accent flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-8 pb-6 text-text-muted leading-relaxed border-t border-border pt-6">
                    {faq.a}
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

