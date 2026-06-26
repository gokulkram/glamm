import nodemailer from 'nodemailer'

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  })
}

const FROM = () => process.env.SMTP_FROM || process.env.SMTP_USER || 'Glamm Hair'

/**
 * Recipients for internal store notifications. Uses ORDER_NOTIFY_EMAILS if set,
 * otherwise falls back to ADMIN_EMAILS — so order alerts can go to a shared
 * inbox without also granting admin-panel access.
 */
function notificationRecipients(): string[] {
  return (process.env.ORDER_NOTIFY_EMAILS || process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

type EmailItem = { title: string; size?: string | null; quantity: number; unit_price: number }

type OrderConfirmationData = {
  orderNumber: string
  email: string
  firstName?: string | null
  items: EmailItem[]
  subtotal: number
  shipping: number
  discount?: number
  total: number
}

const money = (n: number) => `$${n.toFixed(2)}`

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#FAF8F5;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C2C2C;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:8px 0 20px;">
      <span style="font-size:24px;font-weight:700;letter-spacing:.5px;">Glamm <span style="color:#f68961;">Hair</span></span>
    </div>
    <div style="background:#fff;border:1px solid #EAE3D9;border-radius:16px;overflow:hidden;">
      ${body}
    </div>
    <p style="text-align:center;color:#9b9b9b;font-size:12px;margin-top:20px;">© Glamm Hair Extensions. ${title}</p>
  </div></body></html>`
}

export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
  const transport = getTransport()
  if (!transport) {
    console.warn('SMTP not configured — skipping order confirmation email')
    return false
  }

  const rows = data.items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece5;">
          <div style="font-weight:600;">${it.title}</div>
          <div style="color:#6B6B6B;font-size:13px;">${it.size ? `Size ${it.size} · ` : ''}Qty ${it.quantity}</div>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece5;text-align:right;white-space:nowrap;">${money(
          it.unit_price * it.quantity,
        )}</td>
      </tr>`,
    )
    .join('')

  const body = `
    <div style="background:linear-gradient(135deg,#0a1121,#1a2744);padding:28px 24px;color:#fff;text-align:center;">
      <div style="font-size:20px;font-weight:700;">Thank you${data.firstName ? `, ${data.firstName}` : ''}! 🎉</div>
      <div style="opacity:.8;margin-top:4px;">Your order is confirmed</div>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 4px;color:#6B6B6B;font-size:13px;">Order number</p>
      <p style="margin:0 0 20px;font-size:18px;font-weight:700;">${data.orderNumber}</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">
        <tr><td style="padding:3px 0;color:#6B6B6B;">Subtotal</td><td style="padding:3px 0;text-align:right;">${money(
          data.subtotal,
        )}</td></tr>
        <tr><td style="padding:3px 0;color:#6B6B6B;">Shipping</td><td style="padding:3px 0;text-align:right;">${
          data.shipping ? money(data.shipping) : 'Free'
        }</td></tr>
        ${
          data.discount && data.discount > 0
            ? `<tr><td style="padding:3px 0;color:#2e7d32;">Discount</td><td style="padding:3px 0;text-align:right;color:#2e7d32;">−${money(
                data.discount,
              )}</td></tr>`
            : ''
        }
        <tr><td style="padding:8px 0 0;font-weight:700;border-top:1px solid #EAE3D9;">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:700;border-top:1px solid #EAE3D9;">${money(
          data.total,
        )}</td></tr>
      </table>
      <p style="color:#6B6B6B;font-size:13px;margin-top:24px;">We'll email you again when your order ships. You can track it anytime from your account.</p>
    </div>`

  try {
    await transport.sendMail({
      from: FROM(),
      to: data.email,
      subject: `Your Glamm Hair order ${data.orderNumber} is confirmed`,
      html: shell('Order confirmation', body),
    })
    return true
  } catch (err) {
    console.error('sendOrderConfirmation failed:', err)
    return false
  }
}

type NewOrderNotificationData = {
  orderNumber: string
  customerName?: string | null
  email: string
  phone?: string | null
  items: EmailItem[]
  subtotal: number
  shipping: number
  discount?: number
  total: number
  paymentMethod?: string | null
  paymentStatus?: string | null
}

/** Internal alert to store staff when a new order is placed. */
export async function sendNewOrderNotification(data: NewOrderNotificationData): Promise<boolean> {
  const transport = getTransport()
  if (!transport) {
    console.warn('SMTP not configured — skipping new-order notification')
    return false
  }
  const to = notificationRecipients()
  if (to.length === 0) {
    console.warn('No ORDER_NOTIFY_EMAILS / ADMIN_EMAILS set — skipping new-order notification')
    return false
  }

  const rows = data.items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece5;">
          <div style="font-weight:600;">${it.title}</div>
          <div style="color:#6B6B6B;font-size:13px;">${it.size ? `Size ${it.size} · ` : ''}Qty ${it.quantity}</div>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece5;text-align:right;white-space:nowrap;">${money(
          it.unit_price * it.quantity,
        )}</td>
      </tr>`,
    )
    .join('')

  const body = `
    <div style="background:linear-gradient(135deg,#0a1121,#1a2744);padding:24px;color:#fff;">
      <div style="font-size:18px;font-weight:700;">🛒 New order received</div>
      <div style="opacity:.8;margin-top:2px;">${data.orderNumber} · ${money(data.total)} · ${
        data.paymentStatus ?? 'pending'
      }${data.paymentMethod ? ` (${data.paymentMethod})` : ''}</div>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;font-size:14px;color:#2C2C2C;">
        <b>Customer:</b> ${data.customerName || '—'}<br/>
        <b>Email:</b> ${data.email}${data.phone ? `<br/><b>Phone:</b> ${data.phone}` : ''}
      </p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">
        <tr><td style="padding:3px 0;color:#6B6B6B;">Subtotal</td><td style="padding:3px 0;text-align:right;">${money(
          data.subtotal,
        )}</td></tr>
        <tr><td style="padding:3px 0;color:#6B6B6B;">Shipping</td><td style="padding:3px 0;text-align:right;">${
          data.shipping ? money(data.shipping) : 'Free'
        }</td></tr>
        ${
          data.discount && data.discount > 0
            ? `<tr><td style="padding:3px 0;color:#2e7d32;">Discount</td><td style="padding:3px 0;text-align:right;color:#2e7d32;">−${money(
                data.discount,
              )}</td></tr>`
            : ''
        }
        <tr><td style="padding:8px 0 0;font-weight:700;border-top:1px solid #EAE3D9;">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:700;border-top:1px solid #EAE3D9;">${money(
          data.total,
        )}</td></tr>
      </table>
      <p style="color:#6B6B6B;font-size:13px;margin-top:20px;">Open the admin → Orders to process this order.</p>
    </div>`

  try {
    await transport.sendMail({
      from: FROM(),
      to: to.join(','),
      subject: `🛒 New order ${data.orderNumber} — ${money(data.total)}`,
      html: shell('New order', body),
    })
    return true
  } catch (err) {
    console.error('sendNewOrderNotification failed:', err)
    return false
  }
}

type ShippingData = {
  orderNumber: string
  email: string
  firstName?: string | null
  trackingNumber?: string | null
  trackingCarrier?: string | null
}

export async function sendShippingNotification(data: ShippingData): Promise<boolean> {
  const transport = getTransport()
  if (!transport) {
    console.warn('SMTP not configured — skipping shipping email')
    return false
  }

  const tracking = data.trackingNumber
    ? `<div style="margin-top:16px;background:#FAF8F5;border:1px solid #EAE3D9;border-radius:12px;padding:16px;">
         <div style="color:#6B6B6B;font-size:13px;">Tracking number${
           data.trackingCarrier ? ` (${data.trackingCarrier})` : ''
         }</div>
         <div style="font-weight:700;font-size:16px;margin-top:2px;">${data.trackingNumber}</div>
       </div>`
    : ''

  const body = `
    <div style="background:linear-gradient(135deg,#0a1121,#1a2744);padding:28px 24px;color:#fff;text-align:center;">
      <div style="font-size:20px;font-weight:700;">Your order is on its way! 📦</div>
      <div style="opacity:.8;margin-top:4px;">Order ${data.orderNumber}</div>
    </div>
    <div style="padding:24px;">
      <p style="margin:0;">Hi${data.firstName ? ` ${data.firstName}` : ''}, good news — your Glamm Hair order has shipped.</p>
      ${tracking}
      <p style="color:#6B6B6B;font-size:13px;margin-top:24px;">You can track your order anytime from your account.</p>
    </div>`

  try {
    await transport.sendMail({
      from: FROM(),
      to: data.email,
      subject: `Your Glamm Hair order ${data.orderNumber} has shipped`,
      html: shell('Shipping update', body),
    })
    return true
  } catch (err) {
    console.error('sendShippingNotification failed:', err)
    return false
  }
}

type OrderStatusData = {
  orderNumber: string
  email: string
  firstName?: string | null
  status: string
}

// Customer-facing copy per order status. Statuses not listed here (pending,
// paid, shipped) do not send via this function — "shipped" has its own email
// with tracking, and pending/paid are covered by the order confirmation.
const STATUS_COPY: Record<string, { subject: string; heading: string; message: string }> = {
  processing: {
    subject: 'is being prepared',
    heading: 'Your order is being prepared 📦',
    message: "Good news — we've started preparing your order. We'll email you again with tracking as soon as it ships.",
  },
  delivered: {
    subject: 'has been delivered',
    heading: 'Your order was delivered 🎉',
    message: 'Your order has been marked as delivered. We hope you love your Glamm Hair! If anything isn’t right, just reply to this email.',
  },
  cancelled: {
    subject: 'has been cancelled',
    heading: 'Your order has been cancelled',
    message: 'Your order has been cancelled. If this wasn’t expected or you have any questions, please contact our support team.',
  },
  refunded: {
    subject: 'has been refunded',
    heading: 'Your refund has been processed',
    message: 'We’ve processed a refund for your order. It can take 5–10 business days to appear on your statement, depending on your bank.',
  },
}

/** Notify the customer when an admin moves their order to a new status. */
export async function sendOrderStatusUpdate(data: OrderStatusData): Promise<boolean> {
  const copy = STATUS_COPY[data.status]
  if (!copy) return false // no customer email for this status

  const transport = getTransport()
  if (!transport) {
    console.warn('SMTP not configured — skipping status email')
    return false
  }

  const body = `
    <div style="background:linear-gradient(135deg,#0a1121,#1a2744);padding:28px 24px;color:#fff;text-align:center;">
      <div style="font-size:20px;font-weight:700;">${copy.heading}</div>
      <div style="opacity:.8;margin-top:4px;">Order ${data.orderNumber}</div>
    </div>
    <div style="padding:24px;">
      <p style="margin:0;">Hi${data.firstName ? ` ${data.firstName}` : ''}, ${copy.message}</p>
      <p style="color:#6B6B6B;font-size:13px;margin-top:24px;">You can view your order anytime from your account.</p>
    </div>`

  try {
    await transport.sendMail({
      from: FROM(),
      to: data.email,
      subject: `Your Glamm Hair order ${data.orderNumber} ${copy.subject}`,
      html: shell('Order update', body),
    })
    return true
  } catch (err) {
    console.error('sendOrderStatusUpdate failed:', err)
    return false
  }
}
