'use client'

import { useEffect, useMemo } from 'react'
import { GrowthBookProvider as GBProvider, GrowthBook } from '@growthbook/growthbook-react'
import { AppFeatures } from '@/lib/growthbook'

interface Props {
  children: React.ReactNode
}

export default function GrowthBookProvider({ children }: Props) {
  // Create GrowthBook instance immediately (not in useEffect)
  // This ensures the provider context is always available
  const growthbook = useMemo(() => {
    const clientKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY

    return new GrowthBook<AppFeatures>({
      apiHost: 'https://cdn.growthbook.io',
      clientKey: clientKey || '',
      enableDevMode: process.env.NODE_ENV === 'development',
      backgroundSync: true,
      subscribeToChanges: true,
    })
  }, [])

  // Initialize GrowthBook after mount (load features from API)
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY

    if (!clientKey) {
      console.warn('GrowthBook: NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY not set. Feature flags will use defaults.')
      return
    }

    // Load features from GrowthBook API
    growthbook.init({ streaming: true }).catch((err) => {
      console.error('GrowthBook initialization failed:', err)
    })

    // Cleanup on unmount
    return () => {
      growthbook.destroy()
    }
  }, [growthbook])

  // Always wrap children in provider - hooks will work even before init completes
  return (
    <GBProvider growthbook={growthbook}>
      {children}
    </GBProvider>
  )
}
