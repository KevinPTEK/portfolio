import { useCallback, useSyncExternalStore } from 'react'

// « réduire les animations »
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Suit une requête média : vrai tant qu'elle correspond.
 *
 * @param {string} query - une requête média : « (min-width: 640px) »…
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
