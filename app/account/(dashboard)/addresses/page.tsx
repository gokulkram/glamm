import { getMyAddresses } from '@/lib/account/data'
import AddressManager from './AddressManager'

export const dynamic = 'force-dynamic'

export default async function AddressesPage() {
  const addresses = await getMyAddresses()
  return <AddressManager initial={addresses} />
}
