import { Metadata } from 'next'
import PolicyLayout from '@/components/layout/PolicyLayout'

export const metadata: Metadata = {
  title: 'Refund & Exchange Policy | Glamm Hair Extensions',
  description: 'Returns, exchanges, refunds, and our 14 day satisfaction policy at Glamm Hair Extensions.',
}

export default function ReturnPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="Refund & Exchange Policy"
      title="Refund & Exchange Policy"
      subtitle="Your satisfaction is our priority."
    >
      <h2>Returns</h2>
      <p>
        If you are not fully satisfied, you may return your order within 14 days of receiving it for a refund or
        exchange. Please email{' '}
        <a href="mailto:support@glammhairextensions.com">support@glammhairextensions.com</a> before sending anything
        back.
      </p>
      <p>
        Returns are only accepted if the hair is in <strong>original condition</strong>: unworn, unwashed, uncut,
        unstyled, undyed, lace uncut, and with all packaging and gifts included.
      </p>
      <p>
        Customized items (including custom cap sizes or custom colors) are not eligible for return unless there is a
        quality issue.
      </p>

      <h2>Defective or Incorrect Items</h2>
      <p>
        If you receive a defective or incorrect item, contact us within 14 days of delivery. Items reported after
        this period may not qualify for a refund or exchange.
      </p>

      <h2>Return Shipping</h2>
      <ul>
        <li>Customers are responsible for return shipping costs.</li>
        <li>We recommend using a trackable service such as USPS or UPS.</li>
        <li>Without proof of shipment, we cannot issue a refund.</li>
        <li>If returned items are used, altered, or damaged, we may deduct a portion of the refund.</li>
        <li>Unauthorized returns, refused packages, or undeliverable addresses may incur a restocking or return to sender fee.</li>
        <li>International returns may be subject to customs fees, which are the buyer&apos;s responsibility.</li>
      </ul>

      <h2>Refunds</h2>
      <p>Once your return is received and inspected, we will notify you of approval or denial.</p>
      <p>Approved refunds are issued to your original payment method within a few business days.</p>
      <p>
        Expedited shipping fees (such as Overnight or Express) are non refundable if the courier delays delivery, as
        this is outside our control.
      </p>

      <h2>Exchanges</h2>
      <ul>
        <li>To exchange an item, please return it first.</li>
        <li>Once inspected and approved, we will ship your replacement.</li>
        <li>If the new item costs more, you will be asked to pay the difference.</li>
        <li>If it costs less, we will refund the difference.</li>
        <li>If you need an exchange urgently, you may place a new order while returning the original item. We will refund the first order once the return is approved.</li>
      </ul>
    </PolicyLayout>
  )
}
