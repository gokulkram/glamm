import { getFaqs } from '@/lib/faq'
import FaqBrowser from './FaqBrowser'

// Questions are admin-editable, and the admin routes revalidate this path on
// every change, so a save shows up straight away.
export const revalidate = 300

export default async function FAQPage() {
  const faqs = await getFaqs()
  return <FaqBrowser faqs={faqs} />
}
