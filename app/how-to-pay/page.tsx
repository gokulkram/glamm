import { Metadata } from 'next'
import PolicyLayout from '@/components/layout/PolicyLayout'
import PaymentMethods from '@/components/PaymentMethods'

export const metadata: Metadata = {
  title: 'How To Pay | Glamm Hair Extensions',
  description: 'Payment options available at Glamm Hair Extensions, including credit cards, PayPal, Cash App Pay, and Apple Pay.',
}

export default function HowToPayPage() {
  return (
    <PolicyLayout
      eyebrow="Payments"
      title="How to Pay on Our Website"
      subtitle="We offer several payment options to make your shopping experience convenient."
    >
      <h2>Accepted Payment Methods</h2>
      <ul>
        <li><strong>Credit Cards:</strong> Visa, Mastercard, American Express, Discover, and more.</li>
        <li><strong>PayPal</strong></li>
        <li><strong>Cash App Pay</strong></li>
        <li><strong>Apple Pay</strong></li>
      </ul>

      <div className="not-prose my-8">
        <PaymentMethods />
      </div>

      <h2>Good to Know</h2>
      <p>
        If you are logged into your account at checkout, you will only see the options to pay with credit cards.
      </p>
      <p>
        If you have any payment issues, contact us at{' '}
        <a href="mailto:support@glammhair.com">support@glammhair.com</a>.
      </p>
    </PolicyLayout>
  )
}
