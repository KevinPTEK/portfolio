import { useEffect, useEffectEvent, useRef } from 'react'

/**
 * Le brouillard de l'intro sur un <canvas> (§ 7.4) : un petit canvas étiré à
 * l'écran — l'agrandissement adoucit les bords, comme une vraie brume. Il
 * s'ouvre à l'heure de « opening », se lève en INTRO.lift secondes, ou en
 * INTRO.rush si le visiteur a fait un geste. Son calcul et sa boucle
 * (playFog.js et fog.js) sont chargés après le premier affichage, hors du
 * chemin critique (budget, § 11) : le voile CSS de Preloader couvre
 * l'attente. Sans contexte 2D, ou si le calcul arrive après l'ouverture (ou
 * jamais), il ne fait rien : le voile s'efface seul, en fondu.
 *
 * @param {object} props
 * @param {'drawing' | 'opening' | 'ready'} props.phase
 * @param {boolean} props.rushed
 * @param {() => void} props.onPaint - après la première image peinte
 *
 * @example
 * <Fog phase={phase} rushed={rushed} onPaint={() => setHasFog(true)} />
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

    // le départ du calendrier de l'intro : usePreloader le lance au même
    // rendu (dans App), à quelques millisecondes près
    const start = performance.now()
    let stop = null
    let cancelled = false
    import('./playFog.js').then(
      ({ playFog }) => {
        // (arrivé trop tard, il ne peint rien : playFog le voit à sa
        // première image)
        if (cancelled) return
        stop = playFog({ canvas, context, start, readState, painted })
      },
      // pas de réseau, ou un nouveau déploiement l'a retiré : le voile CSS
      // suffit. (Seul le chargement est rattrapé : une erreur de la boucle
      // reste visible dans la console — revue)
      () => {},
    )
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  return <canvas className="preloader__fog" ref={canvasRef} />
}
