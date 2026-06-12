import { getCustomers } from '@/lib/admin/data'
import CustomersTable from './CustomersTable'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const customers = await getCustomers()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-text-muted text-sm">{customers.length} customer{customers.length === 1 ? '' : 's'}</p>
      </div>
      <CustomersTable customers={customers} />
    </div>
  )
}
