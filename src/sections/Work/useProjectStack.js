import { useRef } from 'react'
import { useScrollFrame } from '../../animations/useScrollFrame.js'
import { arrivalOf } from './arrival.js'

// Là où le passage existe (empilement, sans « réduire les animations »).
// La même requête que dans Work.scss, à garder identique : ailleurs, écrire
// les variables recalculerait le style pour rien
export const STACK_QUERY =
  '(min-width: 640px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'

/**
 * Le passage entre projets : à chaque image, l'arrivée de chaque projet est
 * écrite en --arrival sur lui-même et en --covered sur le précédent (la forme
 * de l'effet est dans Work.scss).
 *
 * @returns {{ setMarker: (position: number, node: HTMLElement | null) => void,
 *   setRoom: (position: number, node: HTMLElement | null) => void }} pour
 *   les refs de chaque ProjectRoom
 */
export function useProjectStack() {
  const markers = useRef([])
  const rooms = useRef([])

  useScrollFrame(() => {
    if (!window.matchMedia(STACK_QUERY).matches) return
    // lire… (un repère absent : démontage en cours)
    const arrivals = []
    for (const marker of markers.current) {
      if (!marker) return
      arrivals.push(
        arrivalOf(marker.getBoundingClientRect().top, window.innerHeight),
      )
    }
    // …puis écrire. Le premier projet n'arrive par-dessus aucun autre
    arrivals.forEach((arrival, position) => {
      if (position === 0) return
      rooms.current[position]?.style.setProperty('--arrival', arrival)
      rooms.current[position - 1]?.style.setProperty('--covered', arrival)
    })
  })

  // un composant ne modifie pas ce qu'il reçoit : il appelle ces fonctions
  return {
    setMarker: (position, node) => {
      markers.current[position] = node
    },
    setRoom: (position, node) => {
      rooms.current[position] = node
    },
  }
}
