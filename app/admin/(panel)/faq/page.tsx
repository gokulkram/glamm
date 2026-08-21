import { getAllFaqs, DEFAULT_FAQS } from '@/lib/faq'
import FaqManager from './FaqManager'

export const dynamic = 'force-dynamic'

export default async function AdminFaqPage() {
  const faqs = await getAllFaqs()
  // Negative ids only come from the built-in list, so this is how we know the
  // table isn't there yet — the manager shows a banner and stays read-only
  // rather than offering edits that would fail on save.
  const tableMissing = faqs.length > 0 && faqs[0].id === DEFAULT_FAQS[0].id

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <p className="text-text-muted text-sm">
          The questions on the help centre page. Drag to reorder; hidden ones stay off the site.
        </p>
      </div>
      <FaqManager initial={faqs} tableMissing={tableMissing} />
    </div>
  )
}
