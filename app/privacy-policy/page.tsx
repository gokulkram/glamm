import { Metadata } from 'next'
import PolicyLayout from '@/components/layout/PolicyLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy | Glamm Hair Extensions',
  description: 'How Glamm Hair Extensions collects, uses, shares, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="Privacy Policy"
      title="Glamm Hair Extensions Privacy Policy"
      subtitle="Your privacy matters to us. Here is how we handle your information."
    >
      <h2>Information We Collect</h2>
      <p>
        Glamm Hair Extensions collects only the information needed to operate our store and provide a smooth
        shopping experience. This includes:
      </p>
      <ul>
        <li>Contact details (name, email, phone, addresses)</li>
        <li>Payment information (processed securely by third party providers)</li>
        <li>Account details (login info, preferences)</li>
        <li>Order history and shopping activity</li>
        <li>Device and usage data (IP address, cookies, browsing behavior)</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process orders, returns, and customer support</li>
        <li>Improve and personalize your shopping experience</li>
        <li>Send order updates and promotional messages</li>
        <li>Protect our store from fraud and security risks</li>
        <li>Comply with legal requirements</li>
      </ul>
      <p><strong>Glamm Hair Extensions does not sell your personal information.</strong></p>

      <h2>How We Share Information</h2>
      <p>
        We may share your information only with trusted partners who help us operate our business, including:
      </p>
      <ul>
        <li>Payment processors</li>
        <li>Shipping and fulfillment partners</li>
        <li>Customer support and marketing platforms</li>
        <li>Analytics and security tools</li>
      </ul>
      <p>These partners must protect your information and use it only for the services they provide.</p>

      <h2>Cookies &amp; Tracking</h2>
      <p>Glamm Hair Extensions uses cookies to:</p>
      <ul>
        <li>Improve site performance</li>
        <li>Personalize your experience</li>
        <li>Analyze traffic and shopping behavior</li>
      </ul>
      <p>You may disable cookies in your browser settings.</p>

      <h2>Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Request corrections or deletion</li>
        <li>Opt out of marketing</li>
        <li>Limit certain data uses</li>
      </ul>
      <p>We may need to verify your identity before processing requests.</p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Our services are not intended for children under 16, and we do not knowingly collect their information.
      </p>

      <h2>Data Security &amp; Retention</h2>
      <p>We use industry standard security measures, but no system is perfect.</p>
      <p>
        We keep your information only as long as needed for orders, legal obligations, or business operations.
      </p>

      <h2>Contact Us</h2>
      <p>
        For privacy questions or requests, contact:<br />
        Email: <a href="mailto:support@glammhairextensions.com">support@glammhairextensions.com</a>
      </p>
    </PolicyLayout>
  )
}
