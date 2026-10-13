import { useEffect, useEffectEvent, useLayoutEffect } from 'react'

/**
 * Appelle onFrame au plus une fois par image quand la page défile ou change
 * de taille, et une fois au montage (l'état de départ : rechargement à
 * mi-page). Écrit à la main plutôt qu'avec useScroll de Motion : ≈ 3 Ko de
 * moins au démarrage (décision de Kevin du 13 oct., § 11). Dans onFrame,
 * toutes les lectures (positions) d'abord, puis toutes les écritures :
 * chaque lecture qui suit une écriture force le navigateur à recalculer la
 * mise en page.
 *
 * @param {() => void} onFrame - le calcul d'une image ; toujours la dernière
 *   version reçue (Effect Event), sans réinstaller les écouteurs
 *
 * @example
 * useScrollFrame(() => {
 *   const top = marker.current.getBoundingClientRect().top // lire…
 *   room.current.style.setProperty('--arrival', 1 - top / innerHeight) // …puis écrire
 * })
 */
export function useScrollFrame(onFrame) {
  const frame = useEffectEvent(onFrame)

  // le premier calcul avant le premier affichage : au rechargement à
  // mi-page, une image passait sans l'effet (revue)
  useLayoutEffect(() => {
    frame()
  }, [])

  useEffect(() => {
    let pending = 0 // l'image demandée, s'il y en a une
    const run = () => {
      pending = 0
      frame()
    }
    // plusieurs défilements dans la même image : un seul calcul
    const schedule = () => {
      if (!pending) pending = requestAnimationFrame(run)
    }

    // (scroll ne s'annule pas : l'option « passive » n'y changerait rien)
    window.addEventListener('scroll', schedule)
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(pending)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])
}
