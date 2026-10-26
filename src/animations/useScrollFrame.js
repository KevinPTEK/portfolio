import { useEffect, useEffectEvent, useLayoutEffect } from 'react'

/**
 * Appelle onFrame au plus une fois par image quand la page défile ou change
 * de taille, et une fois au montage. Dans onFrame, toutes les lectures
 * d'abord, puis toutes les écritures : une lecture après une écriture force
 * le navigateur à recalculer la mise en page.
 *
 * @param {() => void} onFrame - le calcul d'une image (toujours la dernière
 *   version reçue, sans réinstaller les écouteurs)
 */
export function useScrollFrame(onFrame) {
  const frame = useEffectEvent(onFrame)

  // avant le premier affichage : au rechargement à mi-page, l'état est juste
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

    window.addEventListener('scroll', schedule)
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(pending)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])
}
