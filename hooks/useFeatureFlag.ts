'use client'

import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { AppFeatures } from '@/lib/growthbook'

/**
 * Hook to check if a feature flag is enabled
 * Returns false while GrowthBook is loading or if the flag is not set
 */
export function useFeatureFlag<K extends keyof AppFeatures>(
  flagKey: K
): boolean {
  // useFeatureIsOn returns false by default if flag is not set
  return useFeatureIsOn(flagKey as string)
}

/**
 * Convenience hook specifically for demo controls
 */
export function useDemoControlsEnabled(): boolean {
  return useFeatureFlag('demo-controls-enabled')
}
