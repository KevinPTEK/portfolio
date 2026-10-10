import { useCallback, useSyncExternalStore } from 'react'

// « réduire les animations », la requête la plus lue du site (§ 7.1)
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Suit une requête média : vrai tant qu'elle correspond. useSyncExternalStore
 * relit la valeur à chaque changement, sans état en double (react.dev,
 * « Subscribing to a browser API »).
 *
 * @param {string} query - une requête média : « (min-width: 640px) »…
 * @returns {boolean}
 *
 * @example
 * const reduced = useMediaQuery(REDUCED_MOTION)
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
