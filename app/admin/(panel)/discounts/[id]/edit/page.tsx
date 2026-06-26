import { notFound } from 'next/navigation'
import { getCouponById } from '@/lib/coupons'
import DiscountForm from '../../DiscountForm'

export const dynamic = 'force-dynamic'

export default async function EditDiscountPage({ params }: { params: { id: string } }) {
  const coupon = await getCouponById(params.id)
  if (!coupon) notFound()

  return <DiscountForm initial={coupon} />
}
