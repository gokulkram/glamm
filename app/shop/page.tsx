'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Product, Category } from '@/lib/data'
import ProductCard from '@/components/ProductCard'
import { Search, X, Sparkles, ChevronRight, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('featured')

  // Load the catalog from the database
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? [])
        setCategories(d.categories ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Pick up ?category= from the URL (used by header dropdown, footer & homepage links)
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category')
    if (cat) setSelectedCategory(cat)
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const selectedCat = categories.find(c => c.slug === selectedCategory)
      if (selectedCat) {
        filtered = filtered.filter((product) =>
          product.category.toLowerCase() === selectedCat.name.toLowerCase()
        )
      }
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.priceMin - b.priceMin)
        break
      case 'price-high':
        filtered.sort((a, b) => b.priceMax - a.priceMax)
        break
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        // Featured - keep original order
        break
    }

    return filtered
  }, [products, categories, searchQuery, selectedCategory, sortBy])

  return (
    <>
      <div className="section">
        <div className="container-max">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="section-title">Shop All Extensions</h1>
            <p className="section-sub max-w-2xl mx-auto">
              Browse our complete collection of premium hair extensions
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-text hover:border-accent hover:text-accent'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                  selectedCategory === cat.slug
                    ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-text hover:border-accent hover:text-accent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 bg-white text-sm outline-none focus:border-accent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3 rounded-full border-2 border-gray-200 bg-white text-sm outline-none focus:border-accent transition-colors cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-text-muted">
              Showing <span className="font-semibold text-text">{filteredProducts.length}</span> products
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-sm text-accent hover:text-accent-dark font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Products Grid - Full Width */}
          {loading ? (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl bg-surface mb-3" />
                  <div className="h-4 w-3/4 rounded bg-surface mb-2" />
                  <div className="h-4 w-1/2 rounded bg-surface" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg mb-4">No products found</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Promo Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/5 via-background to-accent/10 py-16 md:py-20">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Featured Image */}
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
              <Image
                alt="Premium Hair Extensions Collection"
                src="/lucy-photos/_F8A0400-Edit.jpg"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute top-8 left-8 px-6 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent fill-accent" />
                  <span className="font-bold text-accent uppercase tracking-wider text-sm">New Arrivals</span>
                </div>
              </div>
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Luxury Collection</h3>
                <p className="text-white/90 text-lg">Premium virgin hair extensions</p>
              </div>
            </div>

            {/* Promo Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-bold text-accent uppercase tracking-wider">Limited Time Offer</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="block text-text mb-2">Get 20% Off</span>
                <span className="block bg-gradient-to-r from-accent via-accent-dark to-accent bg-clip-text text-transparent">Your First Order</span>
              </h2>
              <p className="text-xl text-text/80 leading-relaxed">
                Transform your look with our premium collection of 100% virgin human hair extensions.
                <span className="block mt-2 font-semibold text-accent">Free shipping on orders over $100.</span>
              </p>
              <ul className="space-y-4 pt-4">
                {['Premium Quality - 100% Virgin Human Hair', 'Natural Look - Blends Seamlessly', 'Long Lasting - Up to 12 Months', 'Easy Application - Professional Results'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-accent/10">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                    </div>
                    <span className="text-text/90 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 pt-6">
                <Link href="/shop" className="group px-8 py-4 rounded-full bg-gradient-to-r from-accent to-accent-dark text-white font-bold text-lg shadow-xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105 flex items-center gap-3">
                  <span>Shop Now</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact" className="px-8 py-4 rounded-full border-2 border-accent/60 text-accent font-bold text-lg hover:bg-accent hover:text-white transition-all duration-300 flex items-center gap-3">
                  <span>Get Expert Advice</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

