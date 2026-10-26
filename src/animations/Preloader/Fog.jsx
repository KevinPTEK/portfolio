import { useEffect, useEffectEvent, useRef } from 'react'

/**
 * Le brouillard de l'intro : un petit <canvas> étiré à l'écran (l'agrandissement
 * adoucit la brume). Sa boucle est chargée après le premier affichage ; le
 * voile CSS couvre l'attente. Sans canvas, ou chargé trop tard, il ne fait
 * rien : le voile s'efface seul, en fondu.
 *
 * @param {object} props
 * @param {'drawing' | 'opening' | 'ready'} props.phase
 * @param {boolean} props.rushed
 * @param {() => void} props.onPaint - après la première image peinte
 */
export function Fog({ phase, rushed, onPaint }) {
  const canvasRef = useRef(null)
  // la boucle lit toujours l'état du moment, sans relancer l'Effect
  const readState = useEffectEvent(() => ({ phase, rushed }))
  const painted = useEffectEvent(() => onPaint())

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext?.('2d')
    if (!context) return

    // le départ du calendrier de l'intro (usePreloader part au même rendu)
    const start = performance.now()
    let stop = null
    let cancelled = false
    import('./playFog.js').then(
      ({ playFog }) => {
        if (cancelled) return
        stop = playFog({ canvas, context, start, readState, painted })
      },
      // chargement impossible : le voile CSS suffit
      () => {},
    )
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  return <canvas className="preloader__fog" ref={canvasRef} />
}
