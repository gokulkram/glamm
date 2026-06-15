import { getMyProfile } from '@/lib/account/data'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function AccountSettingsPage() {
  const profile = await getMyProfile()
  if (!profile) return null
  return <SettingsForm profile={profile} />
}
