'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Eye, Heart, Check, Ruler, ImageIcon } from 'lucide-react';
import { Product } from '@/lib/data';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isPlaceholder = product.image.includes('placeholder');

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  // The whole card is a <Link>, so stop the click from navigating to the product.
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
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
      });
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group cursor-pointer h-full flex flex-col relative min-w-0">
      {/* Outer Glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-accent/5 via-transparent to-accent-dark/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

      {/* Card Container */}
      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-accent/10 group-hover:border-accent/30 group-hover:scale-[1.02] flex flex-col h-full">
        {/* Corner Decorations */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-[3rem] opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent-dark/20 to-transparent rounded-tr-[2.5rem] opacity-50"></div>

        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Border Frame */}
          <div className="absolute inset-0 border-4 border-white/50 rounded-t-2xl z-10 pointer-events-none"></div>

          {/* Shimmer Animation - only show when image not loaded */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
          )}

          {/* Product Image */}
          {isPlaceholder || imageError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
              <ImageIcon className="w-16 h-16 text-gray-400 mb-3" />
              <div className="text-center">
                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Placeholder</p>
                <p className="text-sm font-semibold text-gray-600">{product.title}</p>
              </div>
            </div>
          ) : (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Hover Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

          {/* Dot Pattern on Hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(201,169,126,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          ></div>

          {/* Quick Action Buttons - Desktop Only */}
          <div className="hidden lg:flex absolute inset-0 items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
            <button
              className="w-14 h-14 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center hover:bg-accent hover:text-white hover:scale-110 transition-all duration-300 shadow-2xl translate-y-4 group-hover:translate-y-0 border-2 border-accent/20"
              style={{ transitionDelay: '0ms' }}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={toggleWishlist}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`w-14 h-14 rounded-xl backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl translate-y-4 group-hover:translate-y-0 border-2 ${inWishlist ? 'bg-accent text-white border-accent' : 'bg-white/95 hover:bg-accent hover:text-white border-accent/20'}`}
              style={{ transitionDelay: '50ms' }}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Badge with Glow */}
          {product.badge && (
            <div className="absolute top-3 left-3 z-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-dark rounded-xl blur-md opacity-75"></div>
                <div className="relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent to-accent-dark text-white text-xs font-bold shadow-xl flex items-center gap-1.5 border border-white/20">
                  {product.badge}
                </div>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-3 right-3 w-10 h-10 rounded-lg backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg z-20 border-2 ${inWishlist ? 'bg-accent text-white border-accent' : 'bg-white/90 text-text hover:bg-accent hover:text-white border-white/50 hover:border-accent'}`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gray-900/75 text-white text-center text-xs font-bold py-1.5 tracking-wide">
              OUT OF STOCK
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 bg-white relative">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

          {/* Category & Rating Row */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-accent/10 to-accent-dark/10 text-accent text-xs font-bold uppercase tracking-wider border border-accent/20">
              {product.category}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-accent text-accent" />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-2.5">
            <h3 className="font-bold text-base mb-1 text-text group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-tight">
              {product.title}
            </h3>
            <div className="h-0.5 w-10 bg-gradient-to-r from-accent to-transparent rounded-full group-hover:w-16 transition-all duration-500"></div>
          </div>

          {/* Price Section */}
          <div className="mt-auto mb-3">
            <div className="relative overflow-hidden rounded-xl p-3 bg-gradient-to-br from-accent/10 via-accent/5 to-accent-dark/10 border-2 border-accent/20">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(45deg, transparent 48%, rgba(201,169,126,0.1) 49%, rgba(201,169,126,0.1) 51%, transparent 52%)', backgroundSize: '20px 20px' }}></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative">
                <p className="text-xs text-text-muted font-medium mb-0.5">Starting at</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold bg-gradient-to-r from-accent via-accent-dark to-accent bg-clip-text text-transparent">${product.priceMin}.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {product.inStock ? (
              <div className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200">
                <Check className="w-3 h-3" />
                <span>In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200">
                <span>Out of Stock</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1.5 rounded-lg border border-accent/20">
              <span>Free Ship</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-text-muted bg-surface px-2.5 py-1.5 rounded-lg border border-border">
              <Ruler className="w-3 h-3" />
              <span>{product.sizes?.length || 8} Lengths</span>
            </div>
          </div>

          {/* View Details Button */}
          <button className="relative w-full py-3 rounded-xl overflow-hidden font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/button">
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent-dark to-accent bg-[length:200%_100%] animate-gradient"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"></div>
            <Eye className="w-4 h-4 text-white relative z-10" />
            <span className="text-white relative z-10 text-sm">View Details</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

