import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/account/data'
import AccountNav from './AccountNav'

export const dynamic = 'force-dynamic'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/account/login')

  return (
    <div className="section">
      <div className="container-max max-w-4xl">
        <h1 className="text-2xl font-bold mb-1">My Account</h1>
        <p className="text-text-muted text-sm mb-6">{user.email}</p>
        <AccountNav />
        {children}
      </div>
    </div>
  )
}
