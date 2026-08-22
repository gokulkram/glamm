import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getOrderDetail } from '@/lib/admin/data'
import { getMyOrderDetail } from '@/lib/account/data'
import { getAdminUser } from '@/lib/supabase/admin-auth'
import Invoice from '@/components/Invoice'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Invoice | Glamm Hair Extensions',
  robots: { index: false, follow: false },
}

/**
 * The invoice for one order, printable straight from the browser.
 *
 * Readable by the customer the order belongs to, or by an admin — support
 * needs to be able to pull an invoice for any order, and a customer only ever
 * sees their own. Anything else 404s rather than confirming the order exists.
 */
export default async function InvoicePage({ params }: { params: { id: string } }) {
  // getMyOrderDetail matches on email, which is how guest orders are claimed
  // onto an account. Admins fall through to the unrestricted lookup.
  const own = await getMyOrderDetail(params.id)
  const order = own ?? ((await getAdminUser()) ? await getOrderDetail(params.id) : null)
  if (!order) notFound()

  return <Invoice order={order} />
}
