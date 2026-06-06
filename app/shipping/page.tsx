import { Metadata } from 'next'
import PolicyLayout from '@/components/layout/PolicyLayout'

export const metadata: Metadata = {
  title: 'Shipping Policy | Glamm Hair Extensions',
  description: 'Shipping carriers, processing times, costs, duties, and delivery details for Glamm Hair Extensions orders.',
}

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="Shipping Policy"
      title="Shipping Policy"
      subtitle="Fast, reliable delivery no matter where you are located."
    >
      <h2>Our Shipping Promise</h2>
      <p>
        Glamm Hair Extensions ships worldwide and aims to provide fast, reliable delivery no matter where you are
        located.
      </p>

      <h2>Shipping Carriers</h2>
      <ul>
        <li>United States orders ship via UPS and FedEx.</li>
        <li>International orders ship via standard global carriers.</li>
        <li>Express options such as DHL or FedEx are available upon request.</li>
      </ul>

      <h2>Processing Time</h2>
      <ul>
        <li>Orders are processed within 0 to 3 business days.</li>
        <li>Custom work such as coloring, bleaching, or density adjustments may require additional time.</li>
        <li>If you need urgent processing, please contact us immediately.</li>
      </ul>

      <h2>Shipping Time</h2>
      <ul>
        <li>United States delivery typically arrives within a few business days after dispatch.</li>
        <li>International delivery times vary by destination and carrier.</li>
        <li>Express international shipping is available upon request.</li>
      </ul>

      <h2>Shipping Costs</h2>
      <ul>
        <li>U.S. shipping is free on qualifying orders $100+. A small fee may apply to smaller orders or remote locations.</li>
        <li>International shipping rates vary by country and will appear at checkout.</li>
        <li>Express shipping is available upon request and will be quoted by customer service.</li>
      </ul>

      <h2>Duties &amp; Taxes</h2>
      <p>
        International customers are responsible for any customs duties, VAT, import taxes, or clearance fees required
        by their country. These charges are not included in product or shipping prices.
      </p>

      <h2>Address Changes</h2>
      <p>
        If you need to update your shipping address, please contact us within 12 hours of placing your order. Once an
        order has shipped, the address cannot be changed.
      </p>

      <h2>Order Issues &amp; Delays</h2>
      <p>
        Delivery times may vary due to customs, local carriers, or regional delays. If a package is refused or
        returned due to unpaid duties or incorrect address details, additional shipping costs may apply.
      </p>

      <h2>PO Boxes &amp; Military Addresses</h2>
      <p>We do not deliver to PO Boxes or APO/FPO addresses.</p>

      <h2>Contact Us</h2>
      <p>
        For shipping questions or express shipping requests:<br />
        Email: <a href="mailto:support@glammhairextensions.com">support@glammhairextensions.com</a>
      </p>
    </PolicyLayout>
  )
}
