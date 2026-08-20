import { getAllTestimonials, summarise } from '@/lib/testimonials'
import { getTestimonialsSection } from '@/lib/settings'
import TestimonialsManager from './TestimonialsManager'
import TestimonialsSectionForm from './TestimonialsSectionForm'

export const dynamic = 'force-dynamic'

export default async function AdminTestimonialsPage() {
  const [testimonials, section] = await Promise.all([getAllTestimonials(), getTestimonialsSection()])

  // Exactly what the homepage badge will read: the visible testimonials only.
  const summary = summarise(testimonials.filter((t) => t.is_active))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <p className="text-text-muted text-sm">
          The quotes in the homepage carousel. Drag rows to set the order they appear in — changes are live on the
          storefront straight away.
        </p>
      </div>

      <TestimonialsManager testimonials={testimonials} />

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-1">Section heading</h2>
        <p className="text-text-muted text-sm mb-4">
          The wording above the carousel. The rating badge underneath is worked out from the stars on the visible
          testimonials — right now it reads{' '}
          <span className="font-medium text-text">
            {summary.count > 0
              ? `${summary.average.toFixed(1)}/5 from ${summary.count} verified review${summary.count === 1 ? '' : 's'}`
              : 'nothing — no testimonials are visible'}
          </span>
          .
        </p>
        <TestimonialsSectionForm initial={section} />
      </div>
    </div>
  )
}
