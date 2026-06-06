import { Metadata } from 'next'
import PolicyLayout from '@/components/layout/PolicyLayout'

export const metadata: Metadata = {
  title: 'Delivery Issue Policy | Glamm Hair Extensions',
  description: 'Lost package handling, delayed shipments, missing deliveries, and damaged item claims for domestic and international orders.',
}

export default function DeliveryIssuesPage() {
  return (
    <PolicyLayout
      eyebrow="Delivery Issue Policy"
      title="Lost Package Handling"
      subtitle="What to do if your package is delayed, missing, or damaged."
    >
      <h2>Domestic Packages (UPS / USPS)</h2>

      <h3>Package Stuck &quot;In Transit&quot;</h3>
      <p>Weather, holidays, or carrier delays can slow tracking updates.</p>
      <p>If your tracking has not moved for 7 days, contact us so we can investigate.</p>
      <p>You may also contact the carrier directly:</p>
      <ul>
        <li>UPS: 1 800 742 5877</li>
        <li>USPS: 1 800 275 8777</li>
      </ul>
      <p>
        We will open an investigation with the carrier. If the package is confirmed lost, we will file an insurance
        claim (you pay nothing). Once approved, you may choose a <strong>reshipment</strong> or a{' '}
        <strong>full refund</strong>.
      </p>

      <h3>Package Marked &quot;Delivered&quot; but Not Received</h3>
      <p>First, check:</p>
      <ul>
        <li>Your mailbox or porch</li>
        <li>Hidden drop spots</li>
        <li>Neighbors or family</li>
        <li>Any home surveillance</li>
      </ul>
      <p>Then contact the carrier:</p>
      <ul>
        <li>UPS: 1 800 742 5877</li>
        <li>USPS: 1 800 275 8777</li>
      </ul>
      <p>
        If you still cannot locate the package, contact us. Our domestic shipments include insurance for porch theft.
        We will verify details and submit a claim. Once approved, you may choose a <strong>reshipment</strong> or{' '}
        <strong>refund</strong>.
      </p>

      <h2>Damaged Items</h2>
      <p>If your order arrives damaged, keep all packaging and contact us immediately. Please provide:</p>
      <ul>
        <li>Clear photos of the outer packaging</li>
        <li>Clear photos of the product damage</li>
      </ul>
      <p>
        We will file an insurance claim on your behalf. Once approved, you may choose a replacement or refund. Do not
        discard anything until we confirm the claim is complete.
      </p>

      <h2>International Packages</h2>

      <h3>Package In Transit</h3>
      <p>
        If tracking stops updating for an extended period or you have not received your package within 30 days of
        shipment, email us. We will investigate with the carrier. If the package is confirmed lost before delivery,
        we will <strong>reship or refund</strong>.
      </p>

      <h3>Package Marked &quot;Delivered&quot; but Missing</h3>
      <p>
        For international orders, once the carrier marks a package as <strong>Delivered</strong>, loss or theft{' '}
        <strong>after delivery</strong> is not covered. If this happens, please:
      </p>
      <ul>
        <li>Check your mailbox, lobby, or pickup area</li>
        <li>Ask neighbors or building staff</li>
        <li>Contact your local postal service or DHL/FedEx office within 24 to 48 hours</li>
        <li>Request proof of delivery (GPS scan, delivery notes)</li>
        <li>File a local report if theft is suspected</li>
      </ul>
      <p>
        We cannot refund or reship international orders marked as Delivered, but we will provide any documents needed
        to support your claim with the carrier.
      </p>

      <h2>Contact Us</h2>
      <p>
        For any delivery issue, reach us at{' '}
        <a href="mailto:support@glammhairextensions.com">support@glammhairextensions.com</a>.
      </p>
    </PolicyLayout>
  )
}
