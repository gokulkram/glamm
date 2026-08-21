import { getHero } from '@/lib/settings'
import HeroForm from './HeroForm'

export const dynamic = 'force-dynamic'

export default async function AdminHomepagePage() {
  const hero = await getHero()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Homepage</h1>
        <p className="text-text-muted text-sm">
          The hero — the first thing visitors see. Leave a field blank to put the original wording back.
        </p>
      </div>
      <HeroForm initial={hero} />
    </div>
  )
}
