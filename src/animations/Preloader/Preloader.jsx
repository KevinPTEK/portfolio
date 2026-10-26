import { useLayoutEffect, useState } from 'react'
import { Fog } from './Fog.jsx'
import { KrSeal } from './KrSeal.jsx'
import './Preloader.scss'

/**
 * Le voile de l'intro : le sceau KR se dessine, puis le brouillard se lève.
 * Purement visuel : les lecteurs d'écran lisent la page dès le départ. Son
 * état, sur <html data-intro>, bloque le défilement et règle l'accueil.
 *
 * @param {object} props
 * @param {'drawing' | 'opening' | 'ready' | 'done'} props.phase - de usePreloader
 * @param {boolean} props.rushed - de usePreloader
 */
export function Preloader({ phase, rushed }) {
  const [hasFog, setHasFog] = useState(false)

  // avant la première image, sinon l'accueil est peint net puis flou
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
