'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_SHIPPING, type ShippingConfig } from '@/lib/checkout/shipping'

const ShippingContext = createContext<ShippingConfig>(DEFAULT_SHIPPING)

/** Loads the live shipping rates once so the whole storefront stays consistent. */
export function ShippingProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfg] = useState<ShippingConfig>(DEFAULT_SHIPPING)

  useEffect(() => {
    fetch('/api/shipping')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        const freeThreshold = Number(d.freeThreshold)
        const standardRate = Number(d.standardRate)
        setCfg({
          freeThreshold: Number.isFinite(freeThreshold) ? freeThreshold : DEFAULT_SHIPPING.freeThreshold,
          standardRate: Number.isFinite(standardRate) ? standardRate : DEFAULT_SHIPPING.standardRate,
        })
      })
      .catch(() => {})
  }, [])

  return <ShippingContext.Provider value={cfg}>{children}</ShippingContext.Provider>
}

export function useShipping(): ShippingConfig {
  return useContext(ShippingContext)
}
