// Accepted payment method badges, shown in the footer.
// Lightweight inline badges so no external image assets are required.

const methods: { label: string; bg: string; color: string; node?: React.ReactNode }[] = [
  { label: 'VISA', bg: '#ffffff', color: '#1a1f71' },
  { label: 'Mastercard', bg: '#ffffff', color: '#eb001b' },
  { label: 'AMEX', bg: '#006fcf', color: '#ffffff' },
  { label: 'DISCOVER', bg: '#ffffff', color: '#f76b1c' },
  { label: 'PayPal', bg: '#ffffff', color: '#003087' },
  { label: 'Apple Pay', bg: '#000000', color: '#ffffff' },
  { label: 'Google Pay', bg: '#ffffff', color: '#5f6368' },
  { label: 'Cash App', bg: '#00d54b', color: '#ffffff' },
  { label: 'Shop Pay', bg: '#5a31f4', color: '#ffffff' },
]

export default function PaymentMethods({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {methods.map((m) => (
        <span
          key={m.label}
          className="inline-flex items-center justify-center h-8 min-w-[52px] px-3 rounded-md border border-black/10 text-[11px] font-bold tracking-wide shadow-sm"
          style={{ background: m.bg, color: m.color }}
        >
          {m.label}
        </span>
      ))}
    </div>
  )
}
