'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

/**
 * Five stars the admin clicks to set a testimonial's rating. Hovering previews
 * the value, so the click target and what you get are the same thing.
 *
 * Pass `readOnly` to draw a rating without the interaction — same geometry, so
 * a row and its editor line up.
 */
export default function StarPicker({
  value,
  onChange,
  readOnly = false,
  size = 'h-5 w-5',
  label = 'Rating',
}: {
  value: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: string
  label?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value

  if (readOnly) {
    return (
      <div className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${size} ${n <= value ? 'fill-[#febf6b] text-[#febf6b]' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            aria-label={`${label}: ${n} star${n === 1 ? '' : 's'}`}
            aria-pressed={value === n}
            className="rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Star
              className={`${size} transition-colors ${
                n <= shown ? 'fill-[#febf6b] text-[#febf6b]' : 'text-gray-300 hover:text-[#febf6b]/60'
              }`}
            />
          </button>
        ))}
      </div>
      <span className="ml-1 text-xs tabular-nums text-text-muted">{shown}/5</span>
    </div>
  )
}
