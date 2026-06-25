'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import type { Product } from '@/lib/data'
import ProductCard from '@/components/ProductCard'
import { ShoppingCart, Heart, Check, Star, Truck, Shield, RotateCcw, ChevronRight, MessageCircle, Award, Package, Zap, Info, ImageIcon } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useShipping } from '@/contexts/ShippingContext'

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { freeThreshold } = useShipping()

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedImage, setSelectedImage] = useState(0)

  // Load the catalog from the database
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => setAllProducts(d.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const product = allProducts.find((p) => p.slug === slug)

  if (loading) {
    return (
      <div className="section container-max text-center py-24">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        <p className="mt-4 text-text-muted">Loading product…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="section container-max text-center">
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <Link href="/shop" className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const selectedPrice = selectedSize && product.sizes_prices ? product.sizes_prices[selectedSize] : product.priceMin

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    addToCart({
      id: product.id,
      title: product.title,
      price: `$${selectedPrice}`,
      priceMin: product.priceMin,
      priceMax: product.priceMax,
      image: product.image,
      category: product.category,
      slug: product.slug,
      size: selectedSize,
      selectedPrice: selectedPrice,
      quantity: quantity,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        price: `$${product.priceMin} - $${product.priceMax}`,
        priceMin: product.priceMin,
        priceMax: product.priceMax,
        image: product.image,
        category: product.category,
        slug: product.slug,
      })
    }
  }

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  // Create gallery array (use product image 3 times for demo)
  const gallery = [product.image, product.image, product.image]
  const isPlaceholder = product.image.includes('placeholder')

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-background to-surface">
      <div className="container-max">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8 animate-fade-in-up">
          <Link href="/" className="text-text-muted hover:text-accent transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <Link href="/shop" className="text-text-muted hover:text-accent transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <Link href={`/shop?category=${product.category.toLowerCase()}`} className="text-text-muted hover:text-accent transition-colors">{product.category}</Link>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text font-medium">{product.title}</span>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Left: Image Gallery */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-accent/5 to-accent/10 mb-4 shadow-lg group">
              {isPlaceholder ? (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-8">
                  <ImageIcon className="w-24 h-24 text-gray-400 mb-4" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Placeholder</p>
                    <p className="text-xl font-semibold text-gray-600">{product.title}</p>
                  </div>
                </div>
              ) : (
                <Image
                  src={gallery[selectedImage]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              )}
              {product.badge && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-accent to-accent-dark text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-4">
              {gallery.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${
                    selectedImage === index
                      ? 'ring-4 ring-accent shadow-lg scale-105'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  {isPlaceholder ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <Image src={img} alt={`${product.title} view ${index + 1}`} fill sizes="(max-width: 1024px) 33vw, 16vw" className="object-cover" />
                  )}
                </button>
              ))}
            </div>

            {/* Trust Badges - Desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-4 mt-8">
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent-dark/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-base font-bold mb-1 text-text">Free Shipping</p>
                  <p className="text-sm text-text-muted">On orders ${freeThreshold}+</p>
                </div>
              </div>
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent-dark/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-base font-bold mb-1 text-text">Secure Payment</p>
                  <p className="text-sm text-text-muted">100% Protected</p>
                </div>
              </div>
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent-dark/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                    <RotateCcw className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-base font-bold mb-1 text-text">Easy Returns</p>
                  <p className="text-sm text-text-muted">30-day policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-bold text-sm mb-4">
              <Award className="w-4 h-4" />
              {product.category} Hair
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{product.title}</h1>

            {/* Reviews */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="font-bold">5.0</span>
              </div>
              <span className="text-text-muted">(127 reviews)</span>
              <button className="text-accent hover:underline font-medium flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                Write a review
              </button>
            </div>

            {/* About This Product Box */}
            <div className="mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-accent-dark/5 to-accent/5 rounded-3xl"></div>
              <div className="relative p-8 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-accent/20 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">About This Product</h3>
                    <p className="text-lg text-text leading-relaxed">{product.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-8">
              <label className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                Select Length:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-4 border-2 rounded-xl font-bold transition-all hover:scale-105 ${
                      selectedSize === size
                        ? 'border-accent bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg scale-105'
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Price Display */}
              {selectedSize && product.sizes_prices && (
                <div className="mt-6 p-6 bg-gradient-to-r from-accent/10 to-accent-dark/10 rounded-2xl border-2 border-accent/20 animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-muted mb-1">Price for {selectedSize}</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-accent to-accent-dark bg-clip-text text-transparent">
                        ${product.sizes_prices[selectedSize]}.00
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-r from-accent to-accent-dark rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* No Size Selected Message */}
              {!selectedSize && (
                <div className="mt-6 p-6 bg-surface rounded-2xl border-2 border-dashed border-border">
                  <p className="text-text-muted text-center flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    Select a length to see the price
                  </p>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Quantity:
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 border-2 border-border rounded-xl hover:border-accent hover:bg-accent hover:text-white transition-all font-bold text-xl"
                >
                  -
                </button>
                <span className="text-3xl font-bold w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 border-2 border-border rounded-xl hover:border-accent hover:bg-accent hover:text-white transition-all font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg flex-1 flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all ${
                  inWishlist
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent'
                }`}
              >
                <Heart className={`w-6 h-6 ${inWishlist ? 'fill-accent text-accent' : 'text-text-muted'}`} />
              </button>
            </div>

            {/* Premium Features */}
            <div className="card p-6 mb-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">Premium Features</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In Stock Badge */}
            <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-green-700">In Stock - Ready to Ship</span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-20">
          <div className="card p-8">
            <div className="flex gap-2 mb-8 overflow-x-auto">
              {[
                { id: 'description', label: 'Description', icon: Info },
                { id: 'care', label: 'Hair Care', icon: Heart },
                { id: 'shipping', label: 'Shipping & Returns', icon: Truck }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-bold capitalize transition-all rounded-xl flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="prose max-w-none">
              {activeTab === 'description' && (
                <div className="animate-fade-in">
                  <h3 className="text-3xl font-bold mb-6">Product Description</h3>
                  <p className="text-lg text-text-muted leading-relaxed mb-6">{product.description}</p>
                  <p className="text-text-muted leading-relaxed mb-6">
                    Our {product.title} extensions are crafted from 100% premium human hair, sourced ethically and processed with care to maintain the natural texture and shine. Each bundle is carefully selected to ensure consistent quality and longevity.
                  </p>
                  <h4 className="text-2xl font-bold mb-4 mt-8">Why Choose Our Hair Extensions?</h4>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-lg">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span>
                          <strong>{feature}:</strong> Premium quality guaranteed for lasting beauty and natural appearance.
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === 'care' && (
                <div className="animate-fade-in">
                  <h3 className="text-3xl font-bold mb-6">Hair Care Instructions</h3>
                  <p className="text-lg text-text-muted mb-6">Proper care ensures your hair extensions maintain their beautiful texture and last longer. Follow these professional tips:</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="card p-6">
                      <h4 className="font-bold text-xl mb-4">Washing</h4>
                      <ul className="space-y-2 text-text-muted">
                        <li>• Use sulfate-free shampoo and conditioner</li>
                        <li>• Wash in lukewarm water, not hot</li>
                        <li>• Gently massage, don&apos;t rub vigorously</li>
                        <li>• Rinse thoroughly to remove all product</li>
                      </ul>
                    </div>
                    <div className="card p-6">
                      <h4 className="font-bold text-xl mb-4">Styling</h4>
                      <ul className="space-y-2 text-text-muted">
                        <li>• Detangle with wide-tooth comb when wet</li>
                        <li>• Air dry or use low heat settings</li>
                        <li>• Apply heat protectant before styling</li>
                        <li>• Avoid excessive heat to prolong lifespan</li>
                      </ul>
                    </div>
                    <div className="card p-6">
                      <h4 className="font-bold text-xl mb-4">Maintenance</h4>
                      <ul className="space-y-2 text-text-muted">
                        <li>• Apply leave-in conditioner regularly</li>
                        <li>• Deep condition weekly for best results</li>
                        <li>• Brush gently from ends to roots</li>
                        <li>• Use silk pillowcase to reduce tangling</li>
                      </ul>
                    </div>
                    <div className="card p-6">
                      <h4 className="font-bold text-xl mb-4">Storage</h4>
                      <ul className="space-y-2 text-text-muted">
                        <li>• Store in cool, dry place when not in use</li>
                        <li>• Keep in original packaging or silk bag</li>
                        <li>• Avoid direct sunlight exposure</li>
                        <li>• Ensure completely dry before storing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="animate-fade-in">
                  <h3 className="text-3xl font-bold mb-6">Shipping & Returns</h3>

                  {/* Shipping Information */}
                  <div className="mb-8">
                    <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Truck className="w-6 h-6 text-accent" />
                      Shipping Information
                    </h4>
                    <p className="text-text-muted mb-6">We offer fast, reliable shipping to ensure your hair extensions arrive in perfect condition.</p>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="card p-6">
                        <h5 className="font-bold text-lg mb-3">Standard Shipping</h5>
                        <ul className="space-y-2 text-text-muted">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span><strong>FREE</strong> on orders over ${freeThreshold}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span>Delivery: 3-5 business days</span>
                          </li>
                        </ul>
                      </div>
                      <div className="card p-6">
                        <h5 className="font-bold text-lg mb-3">Express Shipping</h5>
                        <ul className="space-y-2 text-text-muted">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span><strong>$15.99</strong> flat rate</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span>Delivery: 1-2 business days</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-text-muted text-sm">All orders are processed within 24 hours. You&apos;ll receive a tracking number via email once your order ships.</p>
                  </div>

                  {/* Returns & Exchanges */}
                  <div>
                    <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <RotateCcw className="w-6 h-6 text-accent" />
                      Returns & Exchanges
                    </h4>
                    <p className="text-text-muted mb-6">We want you to love your purchase! If you&apos;re not completely satisfied, we offer a hassle-free 30-day return policy.</p>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-text-muted">Products must be unused and in original packaging</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-text-muted">Return shipping is free for defective items</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-text-muted">Refunds processed within 5-7 business days</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-text-muted">Exchanges available for different sizes or styles</span>
                      </li>
                    </ul>

                    <p className="text-text-muted">Contact our customer service team at <a href="mailto:support@glammhair.com" className="text-accent hover:underline font-medium">support@glammhair.com</a> to initiate a return or exchange.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold">You May Also Like</h2>
              <Link
                href={`/shop?category=${product.category.toLowerCase()}`}
                className="text-accent hover:underline font-medium flex items-center gap-2"
              >
                View All {product.category}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div key={relatedProduct.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

