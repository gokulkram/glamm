import Image from 'next/image'

// Accepted payment method logos, shown in the footer.
// SVG logos live in /public/payment.
const methods: { label: string; src: string }[] = [
  { label: 'Visa', src: '/payment/visa.svg' },
  { label: 'Mastercard', src: '/payment/mastercard.svg' },
  { label: 'American Express', src: '/payment/amex.svg' },
  { label: 'Discover', src: '/payment/discover.svg' },
  { label: 'PayPal', src: '/payment/paypal.svg' },
  { label: 'Apple Pay', src: '/payment/apple-pay.svg' },
  { label: 'Google Pay', src: '/payment/google-pay.svg' },
  { label: 'Cash App Pay', src: '/payment/cashapp.svg' },
  { label: 'Venmo', src: '/payment/venmo.svg' },
  { label: 'Amazon Pay', src: '/payment/amazonpay.svg' },
]

export default function PaymentMethods({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {methods.map((m) => (
        <span
          key={m.label}
          title={m.label}
          className="inline-flex items-center justify-center h-9 w-14 px-2.5 rounded-md bg-white border border-black/10 shadow-sm"
        >
          <Image
            src={m.src}
            alt={m.label}
            width={40}
            height={24}
            unoptimized
            className="h-5 w-auto object-contain"
          />
        </span>
      ))}
    </div>
  )
}
