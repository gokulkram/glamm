import { getContact } from '@/lib/settings'
import ContactPageForm from './ContactPageForm'

export const dynamic = 'force-dynamic'

export default async function AdminContactPage() {
  const contact = await getContact()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contact page</h1>
        <p className="text-text-muted text-sm">
          The copy and contact details on /contact. Leave a field blank to put the original wording back.
          The message form itself is not editable here.
        </p>
      </div>
      <ContactPageForm initial={contact} />
    </div>
  )
}
