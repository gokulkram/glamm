import MailStatusPanel from './MailStatusPanel'
import MailCredentialsForm from './MailCredentialsForm'

export const dynamic = 'force-dynamic'

export default function AdminMailPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mail</h1>
        <p className="text-text-muted text-sm">
          SMTP settings for order confirmation, shipping, status update, contact form, and damage
          claim emails, plus who receives the internal new order / contact / damage claim alerts.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold mb-1">Status</h2>
        <p className="text-text-muted text-sm mb-4">
          What&apos;s currently in effect — edit it in Credentials below.
        </p>
        <MailStatusPanel />
      </div>

      <div>
        <h2 className="text-lg font-bold mb-1">Credentials</h2>
        <p className="text-text-muted text-sm mb-4">
          The password is write-only — saving a blank one leaves it unchanged.
        </p>
        <MailCredentialsForm />
      </div>
    </div>
  )
}
