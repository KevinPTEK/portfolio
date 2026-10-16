import { useLayoutEffect, useState } from 'react'
import { Fog } from './Fog.jsx'
import { KrSeal } from './KrSeal.jsx'
import './Preloader.scss'

/**
 * Le voile de l'intro (§ 7.4) : le sceau KR se dessine, se dissout, et le
 * brouillard se lève sur l'accueil. Purement visuel (aria-hidden) : la page
 * est lue par les lecteurs d'écran dès le départ. Son état, posé sur
 * <html data-intro>, bloque le défilement et règle la mise au point de
 * l'accueil (Preloader.scss, Home.scss).
 *
 * @param {object} props
 * @param {'drawing' | 'opening' | 'ready' | 'done'} props.phase - de usePreloader
 * @param {boolean} props.rushed - de usePreloader
 *
 * @example
 * const intro = usePreloader()
 * <Preloader phase={intro.phase} rushed={intro.rushed} />
 */
export function Preloader({ phase, rushed }) {
  const [hasFog, setHasFog] = useState(false)

  // avant la première image (useLayoutEffect) : sinon l'accueil serait peint
  // net puis flou, et la mise au point jouerait à l'envers
  useLayoutEffect(() => {
    if (phase === 'done') return
    const root = document.documentElement
    root.dataset.intro = phase
    if (rushed) root.dataset.introRushed = ''
    return () => {
      delete root.dataset.intro
      delete root.dataset.introRushed
    }
  }, [phase, rushed])

  if (phase === 'done') return null

  return (
    <div
      className={hasFog ? 'preloader preloader--fog' : 'preloader'}
      aria-hidden="true"
    >
      <Fog phase={phase} rushed={rushed} onPaint={() => setHasFog(true)} />
      <KrSeal phase={phase} rushed={rushed} />
    </div>
  )
}
