import { CLAIM_STATUS_LABELS, type ClaimWithPhotos } from '@/lib/claims'

/** Badge colours per claim status, matching the tone used for order states. */
const TONE: Record<string, string> = {
  submitted: 'bg-surface text-text-muted border-border',
  in_review: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

/**
 * A filed damage report — shown to the customer on their order page and to
 * support in the admin panel. Photo URLs are signed by the caller.
 */
export default function ClaimStatus({ claim }: { claim: ClaimWithPhotos }) {
  const filed = new Date(claim.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
            TONE[claim.status] ?? TONE.submitted
          }`}
        >
          {CLAIM_STATUS_LABELS[claim.status] ?? claim.status}
        </span>
        <span className="text-sm text-text-muted">Reported on {filed}</span>
      </div>

      <p className="whitespace-pre-wrap text-sm text-text">{claim.description}</p>

      {claim.photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {claim.photoUrls.map((url, i) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
              {/* Signed, expiring URLs — not routed through the image optimiser. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Damage photo ${i + 1}`}
                className="h-20 w-20 rounded-lg border border-border object-cover bg-surface transition-opacity hover:opacity-80"
              />
            </a>
          ))}
        </div>
      )}

      {claim.admin_note && (
        <div className="rounded-lg bg-surface p-4 text-sm">
          <div className="mb-1 font-medium">Update from our team</div>
          <p className="whitespace-pre-wrap text-text-muted">{claim.admin_note}</p>
        </div>
      )}
    </div>
  )
}
