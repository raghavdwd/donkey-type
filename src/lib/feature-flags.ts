/**
 * Feature flags for toggling functionality at runtime.
 * Edit this file to enable/disable features.
 */

export const featureFlags = {
  /** Enable punctuation mode (typing practice with punctuation text) */
  punctuationMode: true,
} as const

export type FeatureFlags = typeof featureFlags