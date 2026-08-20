'use client'

import { useRef } from 'react'
import { Star, Quote, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Testimonial } from '@/lib/testimonials'

/** `n` filled stars out of five — the rating the admin picked for the card. */
function Stars({ n, className = 'h-4 w-4' }: { n: number; className?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((j) => (
        <Star
          key={j}
          className={`${className} ${j <= n ? 'fill-[#febf6b] text-[#febf6b]' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default function ReviewCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Nav controls */}
      <div className="mb-6 flex justify-center gap-3 lg:justify-end">
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous reviews"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent text-accent transition-colors hover:bg-accent hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Next reviews"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent text-accent transition-colors hover:bg-accent hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((t, i) => (
          <figure
            key={t.id}
            className="relative flex w-[86%] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-large sm:w-[47%] lg:w-[31.5%]"
          >
            {/* decorative accent glow + ghost index */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-accent/25 to-[#febf6b]/25 blur-2xl" />
            <span className="pointer-events-none absolute right-6 top-4 text-6xl font-black leading-none text-accent/[0.07]">
              {String(i + 1).padStart(2, '0')}
            </span>

            <Quote className="mb-4 h-10 w-10 text-accent" />
            <Stars n={t.rating} className="mb-4 h-4 w-4" />
            <p className="mb-3 text-lg font-bold leading-snug">{t.headline}</p>
            <blockquote className="flex-1 leading-relaxed text-text-muted">&ldquo;{t.quote}&rdquo;</blockquote>

            <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
              <div className="rounded-full bg-gradient-to-br from-accent to-[#febf6b] p-[2px]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-accent">
                  {t.initial || t.headline.slice(0, 1).toUpperCase()}
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Verified Buyer</div>
                <div className="flex items-center gap-1 text-xs text-accent">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Purchase
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
