import { useRef } from 'react'
import { useScrollFrame } from '../../animations/useScrollFrame.js'
import { arrivalOf } from './arrival.js'

// Là où le passage existe : l'empilement (Work.scss), sans « réduire les
// animations ». La même requête que celle de Work.scss (vérifié par
// Work.styles.test.js) : ailleurs, aucune règle ne lit les variables, et les
// écrire recalculait le style des pièces pour rien (revue : deux fois plus
// de style sur mobile)
export const STACK_QUERY =
  '(min-width: 640px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)'

/**
 * Le passage entre projets (§ 7.10) : à chaque image où la page défile,
 * l'arrivée de chaque projet est écrite en --arrival sur lui-même (la carte
 * qui monte) et en --covered sur le précédent (qui recule). La forme de
 * l'effet est dans Work.scss. Toutes les positions sont lues avant la
 * première écriture : une seule mise en page par image.
 *
 * @returns {{ setMarker: (position: number, node: HTMLElement | null) => void,
 *   setRoom: (position: number, node: HTMLElement | null) => void }} pour
 *   les refs de chaque ProjectRoom : son repère et sa section, à sa place
 *
 * @example
 * const stack = useProjectStack()
 * <ProjectRoom … position={1} stack={stack} />
 */
export function useProjectStack() {
  const markers = useRef([])
  const rooms = useRef([])

  useScrollFrame(() => {
    if (!window.matchMedia(STACK_QUERY).matches) return
    // lire… (un repère absent, pendant un démontage : on s'arrête là)
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

  // les refs restent ici : un composant ne modifie pas ce qu'il reçoit
  // (react-hooks/immutability), il appelle ces fonctions
  return {
    setMarker: (position, node) => {
      markers.current[position] = node
    },
    setRoom: (position, node) => {
      rooms.current[position] = node
    },
  }
}
